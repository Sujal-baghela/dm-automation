import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import HeatmapClient from "./HeatmapClient";

export const dynamic = "force-dynamic";

const PLATFORMS = ["instagram", "linkedin", "youtube", "gmb"] as const;

const platformMeta: Record<(typeof PLATFORMS)[number], { emoji: string; name: string }> = {
  instagram: { emoji: "📸", name: "Instagram" },
  linkedin: { emoji: "💼", name: "LinkedIn" },
  youtube: { emoji: "🎥", name: "YouTube" },
  gmb: { emoji: "📍", name: "Google Business" },
};

function previewCaption(value: string): string {
  if (value.length <= 80) return value;
  return `${value.slice(0, 80)}...`;
}

function formatDateTime(value: Date | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AnalyticsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="content">Unauthorized</div>;
  }

  const posts = await prisma.post.findMany({
    where: { userId },
    include: { platformPosts: true },
    orderBy: { createdAt: "desc" },
  });

  const totalPosts = posts.length;
  const publishedPosts = posts.filter((post) => post.status === "published");
  const scheduledPostsCount = posts.filter((post) => post.status === "scheduled").length;
  const failedPostsCount = posts.filter((post) => post.status === "failed").length;

  const recentPublished = publishedPosts.slice(0, 10);

  const breakdown = PLATFORMS.map((platform) => {
    const platformPosts = posts.flatMap((post) =>
      post.platformPosts.filter((platformPost) => platformPost.platform === platform)
    );
    return {
      platform,
      total: platformPosts.length,
      published: platformPosts.filter((item) => item.status === "published").length,
      failed: platformPosts.filter((item) => item.status === "failed").length,
    };
  });

  // ── Heatmap data (server-side, same request) ──
  const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));

  // Published posts
  for (const post of posts) {
    if (post.status === "published" && post.publishedAt) {
      const d = new Date(post.publishedAt);
      grid[d.getDay()][d.getHours()]++;
    }
    if (post.status === "scheduled" && post.scheduledAt) {
      const d = new Date(post.scheduledAt);
      grid[d.getDay()][d.getHours()]++;
    }
  }

  // Inbox replies
  const replies = await prisma.inboxMessage.findMany({
    where: { userId, isOutbound: true },
    select: { createdAt: true },
  });
  for (const reply of replies) {
    const d = new Date(reply.createdAt);
    grid[d.getDay()][d.getHours()]++;
  }

  let maxCount = 0;
  const slots: { day: number; hour: number; count: number }[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const count = grid[day][hour];
      if (count > maxCount) maxCount = count;
      if (count > 0) slots.push({ day, hour, count });
    }
  }
  slots.sort((a, b) => b.count - a.count);
  const topSlots = slots.slice(0, 3);
  const totalActivity = slots.reduce((sum, s) => sum + s.count, 0);

  const heatmapData = { grid, maxCount, topSlots, totalActivity };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-sub">Performance overview across connected publishing platforms</div>
        </div>
      </div>

      <div className="content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Posts</div>
            <div className="stat-val" style={{ color: "var(--purple)" }}>
              {totalPosts}
            </div>
            <div className="stat-delta delta-neutral">all statuses</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Published</div>
            <div className="stat-val" style={{ color: "var(--green)" }}>
              {publishedPosts.length}
            </div>
            <div className="stat-delta delta-neutral">successfully posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Scheduled</div>
            <div className="stat-val" style={{ color: "var(--warn)" }}>
              {scheduledPostsCount}
            </div>
            <div className="stat-delta delta-neutral">queued for publish</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Failed</div>
            <div className="stat-val" style={{ color: "var(--danger)" }}>
              {failedPostsCount}
            </div>
            <div className="stat-delta delta-neutral">needs attention</div>
          </div>
        </div>

        {/* ── Best Time to Post Heatmap ── */}
        <HeatmapClient data={heatmapData} />

        {posts.length === 0 ? (
          <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.3px" }}>
              No analytics yet
            </div>
            <div style={{ fontSize: 13, color: "var(--silver-blue)" }}>
              Publish your first post to start seeing analytics.
            </div>
          </div>
        ) : (
          <>
            <div className="table-wrap" style={{ marginBottom: 16 }}>
              <div className="table-head" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
                <div className="th">Platform</div>
                <div className="th">Platform Posts</div>
                <div className="th">Published</div>
                <div className="th">Failed</div>
              </div>
              {breakdown.map((row) => (
                <div
                  key={row.platform}
                  className="table-row"
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
                >
                  <div className="td" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{platformMeta[row.platform].emoji}</span>
                    <span style={{ fontWeight: 600 }}>{platformMeta[row.platform].name}</span>
                  </div>
                  <div className="td">{row.total}</div>
                  <div className="td">{row.published}</div>
                  <div className="td">{row.failed}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-head">
                <div className="card-title">Recent Published Posts</div>
              </div>
              {recentPublished.length === 0 ? (
                <div style={{ padding: "14px 20px", fontSize: 13, color: "var(--silver-blue)" }}>
                  No published posts yet.
                </div>
              ) : (
                recentPublished.map((post) => (
                  <div key={post.id} className="wf-row">
                    <div className="wf-icon" style={{ background: "var(--green-subtle)" }}>
                      ✅
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="wf-name">{previewCaption(post.caption)}</div>
                      <div className="wf-meta">
                        {post.platformPosts
                          .map(
                            (platformPost) =>
                              `${platformMeta[platformPost.platform as (typeof PLATFORMS)[number]]?.emoji ?? "🔗"} ${platformPost.platform}`
                          )
                          .join(" · ")}
                      </div>
                    </div>
                    <div className="wf-meta">{formatDateTime(post.publishedAt)}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}