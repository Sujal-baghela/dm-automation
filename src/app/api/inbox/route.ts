import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const platform = request.nextUrl.searchParams.get("platform")

    const messages = await prisma.inboxMessage.findMany({
      where: {
        userId,
        ...(platform ? { platform } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(messages)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch messages"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { messageId } = body

    if (!messageId) {
      return NextResponse.json(
        { error: "Missing required field: messageId" },
        { status: 400 }
      )
    }

    const message = await prisma.inboxMessage.update({
      where: {
        id: messageId,
        userId,
      },
      data: { isRead: true },
    })

    return NextResponse.json(message)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update message"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}