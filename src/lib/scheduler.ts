import { prisma } from "@/lib/prisma"
import { InstagramAdapter } from "@/lib/adapters/instagram"
import { LinkedInAdapter } from "@/lib/adapters/linkedin"
import { YouTubeAdapter } from "@/lib/adapters/youtube"
import { GMBAdapter } from "@/lib/adapters/gmb"

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
        where: {
          userId: post.userId,
          platform,
        },
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
            metadata: {
              postId: post.id,
              platform,
            },
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
            metadata: {
              postId: post.id,
              platform,
              externalId: result.externalId,
            },
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
            metadata: {
              postId: post.id,
              platform,
              error: message,
            },
          },
        })

        failed += 1
      }
    }

    // Re-fetch platform posts to evaluate final statuses
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

  return { processed, failed }
}
