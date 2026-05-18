"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function formatDateTime(value: string | null): string {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

interface Post {
  id: string;
  caption: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  platformPosts: Array<{ id: string; platform: string }>;
}

export default function CalendarClient({ posts: initialPosts }: { posts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  };

  const scheduledPosts = posts.filter((p) => p.status === "scheduled");
  const publishedPosts = posts.filter((p) => p.status === "published");
  const draftPosts = posts.filter((p) => p.status === "draft");
  const failedCount = posts.filter((p) => p.status === "failed").length;

  const renderPost = (post: Post, statusClass: string, statusText: string) => (
    <div key={post.id} style={{ padding: "13px 20px", borderBottom: "1px solid var(--border-gray)", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{captionPreview(post.caption)}</div>
        <div style={{ fontSize: 12, color: "var(--silver-blue)" }}>{formatDateTime(post.scheduledAt)}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {post.platformPosts.map((pp) => (
          <span key={pp.id} className="badge badge-neutral">
            {platformEmoji[pp.platform] ?? "🔗"} {pp.platform}
          </span>
        ))}
        <span className={`badge ${statusClass}`}>{statusText}</span>
        <button
          type="button"
          className="btn btn-gray btn-sm"
          onClick={() => void handleDelete(post.id)}
          disabled={deleting === post.id}
          style={{ color: "var(--danger)" }}
        >
          {deleting === post.id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );

  const renderSection = (title: string, sectionPosts: Post[], emptyMsg: string, statusClass: string, statusText: string) => (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-head"><div className="card-title">{title}</div></div>
      {sectionPosts.length === 0
        ? <div style={{ padding: "14px 20px", fontSize: 13, color: "var(--silver-blue)" }}>{emptyMsg}</div>
        : sectionPosts.map((p) => renderPost(p, statusClass, statusText))
      }
    </div>
  );

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Calendar</div>
          <div className="page-sub">Track scheduled and published posts across platforms</div>
        </div>
        <div className="topbar-actions">
          <Link href="/dashboard/compose" className="btn btn-primary btn-sm">+ Compose</Link>
        </div>
      </div>
      <div className="content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total posts</div>
            <div className="stat-val" style={{ color: "var(--purple)" }}>{posts.length}</div>
            <div className="stat-delta delta-neutral">all statuses</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Scheduled</div>
            <div className="stat-val" style={{ color: "var(--warn)" }}>{scheduledPosts.length}</div>
            <div className="stat-delta delta-neutral">waiting to publish</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Published</div>
            <div className="stat-val" style={{ color: "var(--green)" }}>{publishedPosts.length}</div>
            <div className="stat-delta delta-neutral">successfully posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Failed</div>
            <div className="stat-val" style={{ color: "var(--danger)" }}>{failedCount}</div>
            <div className="stat-delta delta-neutral">needs attention</div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗓️</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No posts yet</div>
            <div style={{ fontSize: 13, color: "var(--silver-blue)", marginBottom: 20 }}>Create your first post and schedule it to appear here.</div>
            <Link href="/dashboard/compose" className="btn btn-primary btn-sm">+ Compose your first post</Link>
          </div>
        ) : (
          <>
            {renderSection("Scheduled", scheduledPosts, "No scheduled posts.", "badge-warn", "Scheduled")}
            {renderSection("Published", publishedPosts, "No published posts yet.", "badge-success", "Published")}
            {renderSection("Draft", draftPosts, "No draft posts.", "badge-neutral", "Draft")}
          </>
        )}
      </div>
    </>
  );
}
