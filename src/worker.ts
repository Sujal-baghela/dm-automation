import "dotenv/config";
import { Worker, Job } from "bullmq";
import { redis } from "./lib/redis";
import { prisma } from "./lib/prisma";
import { matchTrigger } from "./lib/workflowMatcher";
import { InstagramAdapter } from "./lib/adapters/instagram";
import { WhatsAppAdapter } from "./lib/adapters/whatsapp";
import type { MessageContent } from "./lib/adapters/base";

const ADAPTERS = { instagram: InstagramAdapter, whatsapp: WhatsAppAdapter };

// Bug 4 fixed: no token in job data — fetched from DB at runtime
interface DMJobData {
  platform: "instagram" | "whatsapp";
  accountId: string;
  rawPayload: any;
}

const worker = new Worker<DMJobData>(
  "dm-automation",
  async (job: Job<DMJobData>) => {
    const { platform, accountId, rawPayload } = job.data;
    const adapter = ADAPTERS[platform];
    if (!adapter) throw new Error(`Unsupported platform: ${platform}`);

    const conn = await prisma.platformConnection.findUnique({
      where: { accountId },
      select: { accessToken: true },
    });
    if (!conn) throw new Error(`No connection found for accountId: ${accountId}`);
    const token = conn.accessToken;

    const normalized = adapter.normalizePayload(rawPayload);
    if (normalized.isOutbound) return;

    const conv = await prisma.conversation.upsert({
      where: {
        platform_externalId: {
          platform,
          externalId: normalized.externalId,
        },
      },
      update: {
        lastMessageAt: normalized.timestamp,
        sessionExpiresAt: adapter.getSessionExpiry(normalized.timestamp),
      },
      create: {
        platform,
        externalId: normalized.externalId,
        lastMessageAt: normalized.timestamp,
        sessionExpiresAt: adapter.getSessionExpiry(normalized.timestamp),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conv.id,
        direction: "inbound",
        content: normalized.text || "media",
        status: "pending",
      },
    });

    const workflow = await matchTrigger(
      platform,
      normalized.externalId,
      normalized.text || ""
    );
    if (!workflow) return;

    const action = (workflow.nodes as any).actions?.[0];
    if (!action) return;

    const content: MessageContent =
      action.type === "template"
        ? { templateName: action.templateName }
        : { text: action.text };

    if (
      platform === "whatsapp" &&
      conv.sessionExpiresAt &&
      new Date() > conv.sessionExpiresAt &&
      !content.templateName
    ) {
      throw new Error(
        "WA session expired — business-initiated messages require an approved template."
      );
    }

    await adapter.sendMessage(normalized.externalId, content, accountId, token);

    await prisma.message.create({
      data: {
        conversationId: conv.id,
        direction: "outbound",
        content: content.text || `template:${content.templateName}`,
        status: "sent",
      },
    });
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

console.log("🚀 DM Automation Worker Started");
worker.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
worker.on("failed", (job, err) =>
  console.error(`❌ Job ${job?.id} failed:`, err.message)
);

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down worker...");
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});