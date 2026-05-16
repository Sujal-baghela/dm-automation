import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { InstagramAdapter } from "@/lib/adapters/instagram"
import { WhatsAppAdapter } from "@/lib/adapters/whatsapp"

const VALID_PLATFORMS = ["instagram", "whatsapp"] as const
type Platform = (typeof VALID_PLATFORMS)[number]

type BroadcastBody = {
  platform: string
  message: string
  sendAt: string | null
}

function isPlatform(platform: string): platform is Platform {
  return VALID_PLATFORMS.includes(platform as Platform)
}

export async function GET(_: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [allConversations, recentMessages, scheduledJobs] = await Promise.all([
      prisma.conversation.findMany({ orderBy: { lastMessageAt: "desc" } }),
      prisma.message.findMany({
        orderBy: { sentAt: "desc" },
        take: 10,
        include: { conversation: true },
      }),
      prisma.broadcastJob.findMany({
        where: { userId, status: "pending" },
        orderBy: { sendAt: "asc" },
      }),
    ])

    return NextResponse.json({ contacts: allConversations, recentMessages, scheduledJobs })
  } catch (error) {
    console.error("[broadcast GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await request.json()) as BroadcastBody
    const platform = body.platform.trim()
    const message = body.message.trim()
    const sendAt = body.sendAt

    if (!isPlatform(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 })
    }
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // ── Scheduled broadcast — save to DB ──
    if (sendAt) {
      const job = await prisma.broadcastJob.create({
        data: {
          userId,
          platform,
          message,
          sendAt: new Date(sendAt),
          status: "pending",
        },
      })
      return NextResponse.json({ success: true, scheduled: true, jobId: job.id, sendAt })
    }

    // ── Instant broadcast — send now ──
    const connection = await prisma.platformConnection.findFirst({
      where: { platform },
      select: { accountId: true, accessToken: true },
    })

    if (!connection) {
      return NextResponse.json(
        { error: "No platform connection found. Connect your account in Settings." },
        { status: 400 }
      )
    }

    const conversations = await prisma.conversation.findMany({
      where: { platform },
      select: { externalId: true },
    })

    const adapter = platform === "instagram" ? InstagramAdapter : WhatsAppAdapter
    let sent = 0
    const failed: string[] = []

    for (const conversation of conversations) {
      try {
        await adapter.sendMessage(
          conversation.externalId,
          { text: message },
          connection.accountId,
          connection.accessToken
        )
        sent++
      } catch (err) {
        console.error(`[broadcast] failed for ${conversation.externalId}:`, err)
        failed.push(conversation.externalId)
      }
    }

    await prisma.auditLog.create({
      data: {
        action: `broadcast.sent ${platform} to ${sent} contacts`,
        metadata: { platform, sent, failed: failed.length, message: message.slice(0, 50) },
      },
    })

    return NextResponse.json({ success: true, sent, failed: failed.length })
  } catch (error) {
    console.error("[broadcast POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── Cancel a scheduled job ──
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { jobId } = (await request.json()) as { jobId: string }
    if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 })

    await prisma.broadcastJob.updateMany({
      where: { id: jobId, userId, status: "pending" },
      data: { status: "cancelled" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[broadcast DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}