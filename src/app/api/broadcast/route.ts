import { NextResponse } from "next/server"

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
    const [allConversations, recentMessages] = await Promise.all([
      prisma.conversation.findMany({ orderBy: { lastMessageAt: "desc" } }),
      prisma.message.findMany({
        orderBy: { sentAt: "desc" },
        take: 10,
        include: { conversation: true },
      }),
    ])

    return NextResponse.json({ contacts: allConversations, recentMessages })
  } catch (error) {
    console.error("[broadcast GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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

    if (sendAt) {
      console.log("[broadcast POST] scheduled broadcast", { platform, sendAt })

      await prisma.auditLog.create({
        data: {
          action: `broadcast.scheduled ${platform}`,
          metadata: { platform, sendAt },
        },
      })

      return NextResponse.json({ success: true, scheduled: true, sendAt })
    }

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
        sent += 1
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