import { prisma } from "@/lib/prisma"
import { InstagramAdapter } from "@/lib/adapters/instagram"
import { LinkedInAdapter } from "@/lib/adapters/linkedin"
import { YouTubeAdapter } from "@/lib/adapters/youtube"
import { GMBAdapter } from "@/lib/adapters/gmb"
import { WhatsAppAdapter } from "@/lib/adapters/whatsapp"

async function publishToAdapter(
  platform: string,
  account: { externalId: string; accessToken: string },
  post: { caption: string; mediaUrls: string[] }
) {
  switch (platform) {
    case "instagram":
      return await InstagramAdapter.publishPost(account.externalId, account.accessToken, {
        caption: post.caption,
        mediaUrls: post.mediaUrls,
      })
    case "linkedin":
      return await LinkedInAdapter.publishPost(account.externalId, account.accessToken, {
        caption: post.caption,
        mediaUrls: post.mediaUrls,
      })
    case "youtube":
      return await YouTubeAdapter.publishPost(account.externalId, account.accessToken, {
        caption: post.caption,
        mediaUrls: post.mediaUrls,
      })
    case "gmb":
      return await GMBAdapter.publishPost(account.externalId, account.accessToken, {
        caption: post.caption,
        mediaUrls: post.mediaUrls,
      })
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

export async function runScheduler() {
  const now = new Date()

  // ── 1. Existing: publish scheduled posts ──
  const posts = await prisma.post.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    include: { platformPosts: true },
  })

  let processed = 0
  let failed = 0

  for (const post of posts) {
    processed += 1

    for (const pPost of post.platformPosts) {
      if (pPost.status !== "pending") continue

      const platform = pPost.platform

      const account = await prisma.account.findFirst({
        where: { userId: post.userId, platform },
      })

      if (!account) {
        await prisma.platformPost.update({
          where: { id: pPost.id },
          data: { status: "failed", error: "No connected account" },
        })
        await prisma.auditLog.create({
          data: {
            userId: post.userId,
            action: "post.failed",
            metadata: { postId: post.id, platform },
          },
        })
        failed += 1
        continue
      }

      try {
        const result = await publishToAdapter(platform, account, post)
        await prisma.platformPost.update({
          where: { id: pPost.id },
          data: { status: "published", externalId: result.externalId },
        })
        await prisma.auditLog.create({
          data: {
            userId: post.userId,
            action: "post.published",
            metadata: { postId: post.id, platform, externalId: result.externalId },
          },
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Publish error"
        await prisma.platformPost.update({
          where: { id: pPost.id },
          data: { status: "failed", error: message },
        })
        await prisma.auditLog.create({
          data: {
            userId: post.userId,
            action: "post.failed",
            metadata: { postId: post.id, platform, error: message },
          },
        })
        failed += 1
      }
    }

    const updatedPlatformPosts = await prisma.platformPost.findMany({ where: { postId: post.id } })
    const allPublished = updatedPlatformPosts.every((pp) => pp.status === "published")
    const anyFailed = updatedPlatformPosts.some((pp) => pp.status === "failed")
    const anyPending = updatedPlatformPosts.some((pp) => pp.status === "pending")

    if (allPublished) {
      await prisma.post.update({ where: { id: post.id }, data: { status: "published", publishedAt: new Date() } })
    } else if (anyFailed && !anyPending) {
      await prisma.post.update({ where: { id: post.id }, data: { status: "failed" } })
    }
  }

  // ── 2. NEW: send due broadcast jobs ──
  const dueJobs = await prisma.broadcastJob.findMany({
    where: { status: "pending", sendAt: { lte: now } },
  })

  for (const job of dueJobs) {
    const connection = await prisma.platformConnection.findFirst({
      where: { platform: job.platform },
      select: { accountId: true, accessToken: true },
    })

    if (!connection) {
      await prisma.broadcastJob.update({
        where: { id: job.id },
        data: { status: "failed" },
      })
      continue
    }

    const conversations = await prisma.conversation.findMany({
      where: { platform: job.platform },
      select: { externalId: true },
    })

    const adapter = job.platform === "instagram" ? InstagramAdapter : WhatsAppAdapter
    let sent = 0

    for (const convo of conversations) {
      try {
        await adapter.sendMessage(
          convo.externalId,
          { text: job.message },
          connection.accountId,
          connection.accessToken
        )
        sent++
      } catch (err) {
        console.error(`[scheduler/broadcast] failed for ${convo.externalId}:`, err)
      }
    }

    await prisma.broadcastJob.update({
      where: { id: job.id },
      data: { status: "sent", sentCount: sent },
    })

    await prisma.auditLog.create({
      data: {
        userId: job.userId,
        action: `broadcast.scheduled.sent ${job.platform} to ${sent} contacts`,
        metadata: { jobId: job.id, platform: job.platform, sent },
      },
    })
  }

  return { processed, failed, broadcastJobsSent: dueJobs.length }
}