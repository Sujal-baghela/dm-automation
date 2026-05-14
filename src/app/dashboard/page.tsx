// src/app/dashboard/page.tsx
import { cookies } from "next/headers"
import Link from "next/link"

import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸",
  whatsapp: "💬",
  linkedin: "💼",
  youtube: "🎥",
  gmb: "📍",
}

async function getMode(): Promise<"dm" | "social"> {
  const cookieStore = await cookies()
  const cookieMode = cookieStore.get("dashboardMode")?.value
  return cookieMode === "social" ? "social" : "dm"
}

function previewCaption(value: string): string {
  if (value.length <= 80) return value
  return `${value.slice(0, 80)}...`
}

function formatDateTime(value: Date | null): string {
  if (!value) return "-"
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default async function DashboardPage() {
  const mode = await getMode()

  if (mode === "social") {
    const [posts, connectedPlatforms] = await Promise.all([
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { platformPosts: true },
      }),
      prisma.account.findMany({
        select: { platform: true },
        distinct: ["platform"],
      }),
    ])

    const publishedPostsCount = await prisma.post.count({ where: { status: "published" } })
    const scheduledPostsCount = await prisma.post.count({ where: { status: "scheduled" } })
    const totalReach = publishedPostsCount * 1200

    return (
      <>
        <div className="topbar">
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-sub">Social publishing overview</div>
          </div>
          <div className="topbar-actions">
            <Link href="/dashboard/compose" className="btn btn-gray btn-sm">✏️ Compose</Link>
            <Link href="/dashboard/calendar" className="btn btn-primary btn-sm">🗓️ Calendar</Link>
          </div>
        </div>

        <div className="content">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Posts published</div>
              <div className="stat-val" style={{ color: "var(--green)" }}>{publishedPostsCount}</div>
              <div className="stat-delta delta-up">successful publishes</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Scheduled posts</div>
              <div className="stat-val" style={{ color: "var(--warn)" }}>{scheduledPostsCount}</div>
              <div className="stat-delta delta-neutral">queued for later</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Platforms connected</div>
              <div className="stat-val" style={{ color: "var(--purple)" }}>{connectedPlatforms.length}</div>
              <div className="stat-delta delta-neutral">across publishing channels</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total reach</div>
              <div className="stat-val">{totalReach}</div>
              <div className="stat-delta delta-neutral">estimated from published posts</div>
            </div>
          </div>

          <div className="two-col">
            <div className="card">
              <div className="card-head">
                <div className="card-title">Recent posts</div>
                <Link href="/dashboard/analytics" className="btn btn-gray btn-sm">See analytics</Link>
              </div>
              {posts.length === 0 ? (
                <div style={{ padding: "24px 20px", color: "var(--silver-blue)", fontSize: 13 }}>
                  No posts yet. <Link href="/dashboard/compose" style={{ color: "var(--purple)" }}>Create your first post →</Link>
                </div>
              ) : (
                posts.map((post) => (
                  <div className="wf-row" key={post.id}>
                    <div className="wf-icon" style={{ background: "var(--green-subtle)" }}>📝</div>
                    <div style={{ flex: 1 }}>
                      <div className="wf-name">{previewCaption(post.caption)}</div>
                      <div className="wf-meta">
                        {post.platformPosts.map((platformPost) => (
                          <span key={platformPost.id} style={{ marginRight: 8 }}>
                            {PLATFORM_EMOJI[platformPost.platform] ?? "🔗"} {platformPost.platform}
                          </span>
                        ))}
                        · {formatDateTime(post.createdAt)}
                      </div>
                    </div>
                    <div className="wf-right">
                      <span className={`badge ${post.status === "published" ? "badge-success" : post.status === "scheduled" ? "badge-neutral" : "badge-warn"}`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card" style={{ padding: "18px 20px" }}>
                <div className="card-title" style={{ marginBottom: 13 }}>Quick Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <Link href="/dashboard/compose" className="btn btn-subtle" style={{ justifyContent: "flex-start", width: "100%" }}>✏️ Compose a post</Link>
                  <Link href="/dashboard/calendar" className="btn btn-subtle" style={{ justifyContent: "flex-start", width: "100%" }}>🗓️ View calendar</Link>
                </div>
              </div>

              <div className="card" style={{ padding: "18px 20px" }}>
                <div className="card-title" style={{ marginBottom: 13 }}>Social Notes</div>
                <div style={{ fontSize: 13, color: "var(--silver-blue)", lineHeight: 1.6 }}>
                  Use the calendar to track scheduled posts and the analytics page to review performance across platforms.
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const [workflows, recentMessages, contacts, logs] = await Promise.all([
    prisma.workflow.findMany({
      include: { triggers: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.message.findMany({
      orderBy: { sentAt: "desc" },
      take: 4,
      include: { conversation: true },
    }),
    prisma.conversation.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])

  const activeWorkflows = workflows.filter((w) => w.isActive).length
  const todayMessages = recentMessages.length

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Here's what's happening right now</div>
        </div>
        <div className="topbar-actions">
          <Link href="/dashboard/broadcast" className="btn btn-gray btn-sm">📣 Broadcast</Link>
          <Link href="/dashboard/workflows" className="btn btn-primary btn-sm">+ New Workflow</Link>
        </div>
      </div>

      <div className="content">
        <div className="alert alert-warn">
          <span>⚠️</span>
          <div className="alert-body">
            <div className="alert-title">Check your platform connections</div>
            <div className="alert-sub">Go to Platforms to verify Instagram and WhatsApp are connected.</div>
          </div>
          <Link href="/dashboard/platforms" className="alert-fix">Check now →</Link>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Messages sent</div>
            <div className="stat-val" style={{ color: "var(--purple)" }}>{todayMessages}</div>
            <div className="stat-delta delta-neutral">recent records</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total contacts</div>
            <div className="stat-val" style={{ color: "var(--green)" }}>{contacts}</div>
            <div className="stat-delta delta-up">across all platforms</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active workflows</div>
            <div className="stat-val">{activeWorkflows}</div>
            <div className="stat-delta delta-neutral">of {workflows.length} total</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total workflows</div>
            <div className="stat-val">{workflows.length}</div>
            <div className="stat-delta delta-neutral">configured</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-head">
              <div className="card-title">Workflows</div>
              <Link href="/dashboard/workflows" className="btn btn-gray btn-sm">See all</Link>
            </div>
            {workflows.length === 0 ? (
              <div style={{ padding: "24px 20px", color: "var(--silver-blue)", fontSize: 13 }}>
                No workflows yet. <Link href="/dashboard/workflows" style={{ color: "var(--purple)" }}>Create your first one →</Link>
              </div>
            ) : (
              workflows.map((wf) => (
                <div className="wf-row" key={wf.id}>
                  <div className="wf-icon" style={{ background: "var(--purple-subtle)" }}>⚡</div>
                  <div style={{ flex: 1 }}>
                    <div className="wf-name">{wf.name}</div>
                    <div className="wf-meta">
                      {wf.platforms.join(", ")} · {wf.triggers.length} trigger{wf.triggers.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="wf-right">
                    <span className={`badge ${wf.isActive ? "badge-success" : "badge-neutral"}`}>
                      {wf.isActive ? "On" : "Off"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card">
              <div className="card-head"><div className="card-title">Recent Activity</div></div>
              {logs.length === 0 ? (
                <div style={{ padding: "16px 20px", color: "var(--silver-blue)", fontSize: 13 }}>No activity yet.</div>
              ) : (
                logs.map((log) => (
                  <div className="act-row" key={log.id}>
                    <div className="act-dot" style={{ background: "var(--green)" }} />
                    <div>
                      <div className="act-text">{log.action}</div>
                      <div className="act-time">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card" style={{ padding: "18px 20px" }}>
              <div className="card-title" style={{ marginBottom: 13 }}>Quick Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <Link href="/dashboard/broadcast" className="btn btn-subtle" style={{ justifyContent: "flex-start", width: "100%" }}>📣 Send a broadcast</Link>
                <Link href="/dashboard/workflows" className="btn btn-subtle" style={{ justifyContent: "flex-start", width: "100%" }}>⚡ Create keyword trigger</Link>
                <Link href="/dashboard/contacts" className="btn btn-subtle" style={{ justifyContent: "flex-start", width: "100%" }}>👥 View all contacts</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="checklist">
          <div className="checklist-label">Setup checklist</div>
          <div className="check-items">
            <label className="check-item"><input type="checkbox" defaultChecked={workflows.length > 0} /> Create first workflow</label>
            <label className="check-item"><input type="checkbox" defaultChecked={contacts > 0} /> Get first contact</label>
            <label className="check-item"><input type="checkbox" /> Connect Instagram</label>
            <label className="check-item"><input type="checkbox" /> Connect WhatsApp</label>
            <label className="check-item"><input type="checkbox" /> Send first broadcast</label>
          </div>
        </div>
      </div>
    </>
  )
}
