"use client";

import Link from "next/link";
import { demoWorkflows, demoInboxMessages, demoStats, demoChartData } from "@/lib/demo-data";
import "../dashboard/dashboard.css";

export default function DemoPage() {
  // Helper for platform emoji
  const platformEmoji: Record<string, string> = {
    instagram: "📸",
    whatsapp: "💬",
    linkedin: "💼",
    youtube: "🎥",
  };

  // Calculate max value for bar chart
  const maxTotal = Math.max(...demoChartData.map((d) => d.total));
  const maxHeight = 80; // px

  const barHeight = (value: number) => `${(value / maxTotal) * maxHeight}px`;

  return (
    <>
      <div style={{ background: "#7132f5", color: "white", padding: "10px 20px", textAlign: "center" }}>
        👀 Demo Mode — This is a live preview. Sign up free to connect your accounts.{' '}
        <Link href="/sign-up" style={{ color: "white", textDecoration: "underline" }}>
          Get started →
        </Link>
      </div>
      <div className="content" style={{ padding: 20 }}>

        {/* Topbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-sub">Good morning! Here&apos;s your overview.</div>
          </div>
          <Link href="/sign-up" className="btn btn-primary btn-sm">
            Sign up free →
          </Link>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total DMs received</div>
            <div className="stat-val" style={{ color: "var(--purple)" }}>{demoStats.totalDMs}</div>
            <div className="stat-delta delta-neutral">this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Auto-replied</div>
            <div className="stat-val" style={{ color: "var(--green)" }}>{demoStats.autoReplied}</div>
            <div className="stat-delta delta-up">71% automation rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Posts Queued</div>
            <div className="stat-val">{demoStats.postsQueued}</div>
            <div className="stat-delta delta-neutral">next post in 2h</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Followers Gained</div>
            <div className="stat-val" style={{ color: "var(--green)" }}>+{demoStats.followersGained}</div>
            <div className="stat-delta delta-up">↑ 34% vs last week</div>
          </div>
        </div>

        {/* Active Workflows */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-head">
            <div className="card-title">Active Workflows</div>
          </div>
          <div>
            {demoWorkflows.map((wf) => (
              <div key={wf.id} className="wf-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="wf-icon">⚡</span>
                  <span className="wf-name">{wf.name}</span>
                  <span className="wf-meta">{wf.platforms.join(" · ")} · {wf.triggeredCount} triggered</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <span className="badge badge-success">Active</span>
                  {wf.platforms.map((p) => (
                    <span key={p} className="badge badge-neutral">
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unified Inbox */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-head">
            <div className="card-title">Unified Inbox — Recent Messages</div>
          </div>
          <div>
            {demoInboxMessages.map((msg) => (
              <div key={msg.id} className="wf-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="wf-icon">{platformEmoji[msg.platform] ?? "❓"}</span>
                  <span className="wf-name">
                    {msg.senderId}
                    {!msg.isRead && <span style={{ color: "green", marginLeft: 4 }}>·</span>}
                  </span>
                  <span className="wf-meta">{msg.text.slice(0, 50)}</span>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span className="wf-meta" style={{ fontSize: 12, color: "gray" }}>{msg.createdAt}</span>
                  <span className="badge badge-neutral">{msg.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Grid */}
        <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
          {/* Left Card - Bar Chart */}
          <div className="card" style={{ flex: 1, minWidth: 300 }}>
            <div className="card-head">
              <div className="card-title">DM Volume — Last 7 Days</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: maxHeight + 20, padding: "0 20px", overflowX: "visible", marginBottom: 8 }}>
              {demoChartData.map((day) => (
                <div key={day.day} style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
                    <div
                      style={{
                        width: 8,
                        background: "#6366f1",
                        height: barHeight(day.total),
                      }}
                    />
                    <div
                      style={{
                        width: 8,
                        background: "#22c55e",
                        height: barHeight(day.auto),
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12 }}>{day.day}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, display: "flex", gap: 12 }}>
              <div><span style={{ display: "inline-block", width: 12, height: 12, background: "#6366f1" }} /> Total DMs</div>
              <div><span style={{ display: "inline-block", width: 12, height: 12, background: "#22c55e" }} /> Auto-replied</div>
            </div>
          </div>
          {/* Right Card - Builder CTA */}
          <div className="card" style={{ flex: 1, minWidth: 300 }}>
            <div className="card-head">
              <div className="card-title">Try the Workflow Builder</div>
            </div>
            <div style={{ padding: "10px" }}>
              <p>Build automated reply flows visually — drag nodes, connect them, and your DMs reply themselves.</p>
              <Link href="/sign-up" className="btn btn-primary btn-sm">Start building →</Link>
              <br />
              <Link
                href="/dashboard/workflows/new"
                className="btn btn-gray btn-sm"
                style={{ marginTop: 8 }}
              >
                Preview builder (requires login)
              </Link>
            </div>
          </div>
        </div>
      </div></>
  );
}
