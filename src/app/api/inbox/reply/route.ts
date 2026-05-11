import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { InstagramAdapter } from "@/lib/adapters/instagram"
import { LinkedInAdapter } from "@/lib/adapters/linkedin"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, text } = body

    if (!messageId || !text) {
      return NextResponse.json(
        { error: "Missing required fields: messageId, text" },
        { status: 400 }
      )
    }

    const originalMessage = await prisma.inboxMessage.findUnique({
      where: { id: messageId },
    })

    if (!originalMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (originalMessage.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const account = await prisma.account.findFirst({
      where: {
        userId,
        platform: originalMessage.platform,
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: "No account found for this platform" },
        { status: 404 }
      )
    }

    if (originalMessage.platform === "instagram") {
      await InstagramAdapter.sendMessage(
        originalMessage.senderId,
        { text },
        account.externalId,
        account.accessToken
      )
    } else if (originalMessage.platform === "linkedin") {
      await LinkedInAdapter.sendMessage(
        originalMessage.senderId,
        { text },
        account.externalId,
        account.accessToken
      )
    } else {
      throw new Error(`Unsupported platform: ${originalMessage.platform}`)
    }

    await prisma.inboxMessage.create({
      data: {
        userId,
        platform: originalMessage.platform,
        externalId: crypto.randomUUID(),
        senderId: "me",
        text,
        isOutbound: true,
        isRead: true,
      },
    })

    await prisma.inboxMessage.update({
      where: { id: messageId },
      data: { repliedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send reply"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}