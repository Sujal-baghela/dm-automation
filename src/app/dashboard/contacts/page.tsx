import { prisma } from "@/lib/prisma"
import ContactsClient from "./ContactsClient"

export const dynamic = "force-dynamic"

const HIGH_INTENT = ["price", "cost", "buy", "purchase", "demo", "interested", "order", "how much", "plan", "pricing"]

function computeScore(messages: { direction: string; content: string; sentAt: Date }[], lastMessageAt: Date): number {
  let score = 0

  const inbound = messages.filter((m) => m.direction === "inbound")
  const outbound = messages.filter((m) => m.direction === "outbound")

  // +10 per inbound message, max 40
  score += Math.min(inbound.length * 10, 40)

  // +25 if any inbound message contains high-intent keyword
  const hasIntent = inbound.some((m) =>
    HIGH_INTENT.some((kw) => m.content.toLowerCase().includes(kw))
  )
  if (hasIntent) score += 25

  // +20 if they replied after an outbound (engagement signal)
  const repliedBack = outbound.length > 0 && inbound.some((m) =>
    outbound.some((o) => m.sentAt > o.sentAt)
  )
  if (repliedBack) score += 20

  // +10 if last message within 7 days
  const daysSince = (Date.now() - new Date(lastMessageAt).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince <= 7) score += 10
  // +5 bonus if within 24 hours
  if (daysSince <= 1) score += 5

  return Math.min(score, 100)
}

export default async function ContactsPage() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: {
        orderBy: { sentAt: "desc" },
        select: { direction: true, content: true, sentAt: true },
      },
    },
    take: 50,
  })

  const scored = conversations
    .map((c) => {
      const score = computeScore(c.messages, c.lastMessageAt)
      const scoreLabel: "Hot" | "Warm" | "Cold" =
        score >= 70 ? "Hot" : score >= 31 ? "Warm" : "Cold"
      const lastContent =
        c.messages[0]?.content
          ? c.messages[0].content.slice(0, 30) + (c.messages[0].content.length > 30 ? "…" : "")
          : "—"
      return {
        id: c.id,
        externalId: c.externalId,
        platform: c.platform,
        status: c.status,
        lastMessageAt: c.lastMessageAt.toISOString(),
        messageCount: c.messages.length,
        lastContent,
        score,
        scoreLabel,
      }
    })
    .sort((a, b) => b.score - a.score)

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Contacts</div>
          <div className="page-sub">{conversations.length} people have messaged your bot</div>
        </div>
      </div>
      <div className="content">
        <ContactsClient contacts={scored} />
      </div>
    </>
  )
}