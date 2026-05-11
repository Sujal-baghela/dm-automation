import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const platformEmoji: Record<string, string> = {
  instagram: "📸",
  linkedin: "💼",
  youtube: "🎥",
  gmb: "📍",
};

function captionPreview(value: string): string {
  if (value.length <= 80) return value;
  return `${value.slice(0, 80)}...`;
}

function formatDateTime(value: Date | null): string {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PostSection({
  title,
  emptyMessage,
  posts,
  statusClass,
  statusText,
}: {
  title: string;
  emptyMessage: string;
  posts: Array<{
    id: string;
    caption: string;
    scheduledAt: Date | null;
    platformPosts: Array<{ id: string; platform: string }>;
  }>;
  statusClass: string;
  statusText: string;
}) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-head">
        <div className="card-title">{title}</div>
      </div>
      {posts.length === 0 ? (
        <div style={{ padding: "14px 20px", fontSize: 13, color: "var(--silver-blue)" }}>
          {emptyMessage}
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              padding: "13px 20px",
              borderBottom: "1px solid var(--border-gray)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                {captionPreview(post.caption)}
              </div>
              <div style={{ fontSize: 12, color: "var(--silver-blue)" }}>
                {formatDateTime(post.scheduledAt)}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {post.platformPosts.map((platformPost) => (
                <span key={platformPost.id} className="badge badge-neutral">
                  {platformEmoji[platformPost.platform] ?? "🔗"} {platformPost.platform}
                </span>
              ))}
              <span className={`badge ${statusClass}`}>{statusText}</span>
              <Link href="#" className="btn btn-gray btn-sm">
                Edit
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default async function CalendarPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="content">Unauthorized</div>;
  }

  const posts = await prisma.post.findMany({
    where: { userId },
    include: { platformPosts: true },
    orderBy: { scheduledAt: "asc" },
  });

  const scheduledPosts = posts.filter((post) => post.status === "scheduled");
  const publishedPosts = posts.filter((post) => post.status === "published");
  const draftPosts = posts.filter((post) => post.status === "draft");
  const failedPostsCount = posts.filter((post) => post.status === "failed").length;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Calendar</div>
          <div className="page-sub">Track scheduled and published posts across platforms</div>
        </div>
        <div className="topbar-actions">
          <Link href="/dashboard/compose" className="btn btn-primary btn-sm">
            + Compose
          </Link>
        </div>
      </div>

      <div className="content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total posts</div>
            <div className="stat-val" style={{ color: "var(--purple)" }}>
              {posts.length}
            </div>
            <div className="stat-delta delta-neutral">all statuses</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Scheduled</div>
            <div className="stat-val" style={{ color: "var(--warn)" }}>
              {scheduledPosts.length}
            </div>
            <div className="stat-delta delta-neutral">waiting to publish</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Published</div>
            <div className="stat-val" style={{ color: "var(--green)" }}>
              {publishedPosts.length}
            </div>
            <div className="stat-delta delta-neutral">successfully posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Failed</div>
            <div className="stat-val" style={{ color: "var(--danger)" }}>
              {failedPostsCount}
            </div>
            <div className="stat-delta delta-neutral">needs attention</div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗓️</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.3px" }}>
              No posts yet
            </div>
            <div style={{ fontSize: 13, color: "var(--silver-blue)", marginBottom: 20 }}>
              Create your first post and schedule it to appear here.
            </div>
            <Link href="/dashboard/compose" className="btn btn-primary btn-sm">
              + Compose your first post
            </Link>
          </div>
        ) : (
          <>
            <PostSection
              title="Scheduled"
              emptyMessage="No scheduled posts."
              posts={scheduledPosts}
              statusClass="badge-warn"
              statusText="Scheduled"
            />
            <PostSection
              title="Published"
              emptyMessage="No published posts yet."
              posts={publishedPosts}
              statusClass="badge-success"
              statusText="Published"
            />
            <PostSection
              title="Draft"
              emptyMessage="No draft posts."
              posts={draftPosts}
              statusClass="badge-neutral"
              statusText="Draft"
            />
          </>
        )}
      </div>
    </>
  );
}
