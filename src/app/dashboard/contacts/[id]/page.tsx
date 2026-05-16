import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContactDetailClient from "./ContactDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findFirst({ where: { id: clerkId } });
  if (!user) redirect("/sign-in");

  const senderId = decodeURIComponent(id);

  const messages = await prisma.inboxMessage.findMany({
    where: { userId: user.id, senderId },
    orderBy: { createdAt: "asc" },
  });

  const allInsights = await prisma.conversationInsight.findMany({
    where: { userId: user.id, senderId },
    orderBy: { analyzedAt: "desc" },
    take: 10,
  });
  const insight = allInsights[0] ?? null;

  const platforms = [...new Set(messages.map((m) => m.platform))];
  const totalMessages = messages.length;
  const inboundCount = messages.filter((m) => !m.isOutbound).length;
  const outboundCount = messages.filter((m) => m.isOutbound).length;
  const lastActive = messages.length > 0 ? messages[messages.length - 1].createdAt : null;
  const firstSeen = messages.length > 0 ? messages[0].createdAt : null;

  return (
    <ContactDetailClient
      senderId={senderId}
      messages={messages.map((m) => ({
        id: m.id,
        platform: m.platform,
        senderId: m.senderId,
        text: m.text,
        mediaUrl: m.mediaUrl,
        isRead: m.isRead,
        isOutbound: m.isOutbound,
        tags: m.tags,
        createdAt: m.createdAt.toISOString(),
      }))}
      insight={insight ? {
        id: insight.id,
        sentiment: insight.sentiment,
        intent: insight.intent,
        tags: insight.tags,
        summary: insight.summary,
        analyzedAt: insight.analyzedAt.toISOString(),
      } : null}
      allInsights={allInsights.map((i) => ({
        id: i.id,
        sentiment: i.sentiment,
        intent: i.intent,
        tags: i.tags,
        summary: i.summary,
        analyzedAt: i.analyzedAt.toISOString(),
      }))}
      stats={{
        platforms,
        totalMessages,
        inboundCount,
        outboundCount,
        lastActive: lastActive?.toISOString() ?? null,
        firstSeen: firstSeen?.toISOString() ?? null,
      }}
    />
  );
}
