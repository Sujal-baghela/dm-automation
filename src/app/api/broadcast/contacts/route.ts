import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

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
    console.error("[broadcast contacts GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
