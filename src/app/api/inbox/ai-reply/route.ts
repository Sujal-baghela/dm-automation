import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getSuggestedReply } from "@/lib/aiReply";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = (await request.json()) as { messageId: string };

    if (!messageId) {
      return NextResponse.json({ error: "messageId required" }, { status: 400 });
    }

    const message = await prisma.inboxMessage.findFirst({
      where: { id: messageId, userId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const contextMessages = await prisma.inboxMessage.findMany({
      where: {
        userId,
        platform: message.platform,
        senderId: message.senderId,
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    const messages = contextMessages.map((msg) => ({
      text: msg.text ?? "",
      isOutbound: msg.isOutbound,
    }));

    const suggestion = await getSuggestedReply({
      platform: message.platform,
      senderId: message.senderId,
      messages,
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("[AI-REPLY] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
