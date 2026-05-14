import { Worker, Job } from "bullmq"
import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { matchTrigger } from "@/lib/workflowMatcher"
import { InstagramAdapter } from "@/lib/adapters/instagram"
import { WhatsAppAdapter } from "@/lib/adapters/whatsapp"

if (!redis) throw new Error("Redis not configured")

export interface DmJobData {
  platform: "instagram" | "whatsapp"
  accountId: string
  rawPayload: unknown
}

async function processInstagramDM(payload: unknown, accountId: string): Promise<void> {
  const p = payload as Record<string, unknown>
  const sender = p.sender as Record<string, unknown> | undefined
  const message = p.message as Record<string, unknown> | undefined
  const senderId = sender?.id as string | undefined
  const text = (message?.text as string) ?? ""

  if (!senderId) return

  const connection = await prisma.platformConnection.findUnique({ where: { accountId } })
  if (!connection) return

  const conversation = await prisma.conversation.upsert({
    where: { platform_externalId: { platform: "instagram", externalId: senderId } },
    create: { platform: "instagram", externalId: senderId, lastMessageAt: new Date() },
    update: { lastMessageAt: new Date() },
  })

  await prisma.message.create({
    data: { conversationId: conversation.id, direction: "inbound", content: text, status: "received" },
  })

  const workflow = await matchTrigger("instagram", senderId, text)

  if (workflow) {
    const nodes = Array.isArray(workflow.nodes) ? (workflow.nodes as unknown[]) : []
    const node = nodes.find((n) => (n as Record<string, unknown>).type === "send_message")
    const replyText = (node as Record<string, unknown>)?.message as string | undefined

    if (replyText) {
      await InstagramAdapter.sendMessage(senderId, { text: replyText }, accountId, connection.accessToken)
    }

    await prisma.auditLog.create({
      data: {
        action: "workflow.matched instagram " + senderId,
        metadata: { workflowId: String(workflow.id) },
      },
    })
  }
}

async function processWhatsAppDM(payload: unknown, accountId: string): Promise<void> {
  const p = payload as Record<string, unknown>
  const contacts = p.contacts as Array<Record<string, unknown>> | undefined
  const messages = p.messages as Array<Record<string, unknown>> | undefined
  const senderId = contacts?.[0]?.wa_id as string | undefined
  const text = (messages?.[0]?.text as Record<string, unknown>)?.body as string ?? ""

  if (!senderId) return

  const connection = await prisma.platformConnection.findUnique({ where: { accountId } })
  if (!connection) return

  const conversation = await prisma.conversation.upsert({
    where: { platform_externalId: { platform: "whatsapp", externalId: senderId } },
    create: { platform: "whatsapp", externalId: senderId, lastMessageAt: new Date() },
    update: { lastMessageAt: new Date() },
  })

  await prisma.message.create({
    data: { conversationId: conversation.id, direction: "inbound", content: text, status: "received", },
  })

  const workflow = await matchTrigger("whatsapp", senderId, text)

  if (workflow) {
    const nodes = Array.isArray(workflow.nodes) ? (workflow.nodes as unknown[]) : []
    const node = nodes.find((n) => (n as Record<string, unknown>).type === "send_message")
    const replyText = (node as Record<string, unknown>)?.message as string | undefined

    if (replyText) {
      await WhatsAppAdapter.sendMessage(senderId, { text: replyText }, accountId, connection.accessToken)
    }

    await prisma.auditLog.create({
      data: {
        action: "workflow.matched whatsapp " + senderId,
      },
    })
  }
}

export const dmWorker = new Worker<DmJobData>(
  "dm-automation",
  async (job: Job<DmJobData>) => {
    const { platform, accountId, rawPayload } = job.data
    if (platform === "instagram") await processInstagramDM(rawPayload, accountId)
    if (platform === "whatsapp") await processWhatsAppDM(rawPayload, accountId)
  },
  { connection: redis, concurrency: 5 }
)

dmWorker.on("completed", (job) => console.log("[worker] ✅ Job completed:", job.id))
dmWorker.on("failed", (job, err) => console.error("[worker] ❌ Job failed:", job?.id, (err as Error)?.message))
export default dmWorker
