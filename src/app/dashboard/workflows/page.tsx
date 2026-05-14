import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { toggleWorkflow } from "./actions"

export const dynamic = "force-dynamic"

const platforms = ["instagram", "whatsapp", "facebook"]

const platformEmoji: Record<string, string> = {
  instagram: "📸",
  whatsapp: "💬",
  facebook: "📘",
}

const triggerLabel: Record<string, string> = {
  keyword: "When message contains...",
  exact: "When message is exactly...",
  regex: "Regex (advanced)",
}

export default async function WorkflowsPage() {
  const workflows = await prisma.workflow.findMany({
    include: { triggers: true, user: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Workflows</div>
          <div className="page-sub">
            {workflows.length} workflow{workflows.length !== 1 ? "s" : ""} configured
          </div>
        </div>
        <div className="topbar-actions">
          <Link href="/dashboard/workflows/new" className="btn btn-primary btn-sm">
            + New Workflow
          </Link>
        </div>
      </div>

      <div className="content">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total workflows</div>
            <div className="stat-val" style={{ color: "var(--purple)" }}>{workflows.length}</div>
            <div className="stat-delta delta-neutral">all time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active</div>
            <div className="stat-val" style={{ color: "var(--green)" }}>
              {workflows.filter((w) => w.isActive).length}
            </div>
            <div className="stat-delta delta-up">currently running</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Paused</div>
            <div className="stat-val">{workflows.filter((w) => !w.isActive).length}</div>
            <div className="stat-delta delta-neutral">turned off</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total triggers</div>
            <div className="stat-val">
              {workflows.reduce((acc, w) => acc + w.triggers.length, 0)}
            </div>
            <div className="stat-delta delta-neutral">across all workflows</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["all", ...platforms].map((p) => (
            <span
              key={p}
              className="badge badge-neutral"
              style={{ padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              {p === "all" ? "All platforms" : (platformEmoji[p] ?? "") + " " + p}
            </span>
          ))}
        </div>

        {workflows.length === 0 ? (
          <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No workflows yet</div>
            <div style={{ fontSize: 13, color: "var(--silver-blue)", marginBottom: 20 }}>
              Create your first workflow to start automating DMs and replies.
            </div>
            <Link href="/dashboard/workflows/new" className="btn btn-primary btn-sm">
              + Create first workflow
            </Link>
          </div>
        ) : (
          <div className="card">
            <div className="card-head">
              <div className="card-title">All workflows</div>
            </div>
            {workflows.map((wf) => (
              <div className="wf-row" key={wf.id}>
                <div className="wf-icon" style={{ background: "var(--purple-subtle)" }}>⚡</div>
                <div style={{ flex: 1 }}>
                  <div className="wf-name">{wf.name}</div>
                  <div className="wf-meta">
                    {wf.platforms.map((p) => platformEmoji[p] ?? p).join(" · ")} ·{" "}
                    {wf.triggers.length} trigger{wf.triggers.length !== 1 ? "s" : ""} ·{" "}
                    {wf.triggers.map((t) => triggerLabel[t.type] ?? t.type).join(", ")}
                    {wf.user && (
                      <span style={{ color: "var(--purple)", marginLeft: 6 }}>
                        · {wf.user.name ?? wf.user.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="wf-right">
                  {wf.platforms.map((p) => (
                    <span
                      key={p}
                      className={`badge ${
                        p === "instagram" ? "badge-ig" : p === "whatsapp" ? "badge-wa" : "badge-neutral"
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                  <span className={`badge ${wf.isActive ? "badge-success" : "badge-neutral"}`}>
                    {wf.isActive ? "On" : "Off"}
                  </span>
                  <form action={toggleWorkflow.bind(null, wf.id, wf.isActive)}>
                    <button
                      type="submit"
                      className={`toggle ${wf.isActive ? "on" : "off"}`}
                      title={wf.isActive ? "Turn off" : "Turn on"}
                    />
                  </form>
                  <Link href={`/dashboard/workflows/${wf.id}`} className="btn btn-gray btn-sm">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-head">
            <div className="card-title">How triggers work</div>
          </div>
          <div style={{ padding: "14px 20px" }}>
            {[
              {
                type: "keyword",
                label: "When message contains...",
                desc: 'Triggers when the message includes your word anywhere. Example: "FREE" matches "Can I get the FREE link please".',
                color: "var(--purple)",
              },
              {
                type: "exact",
                label: "When message is exactly...",
                desc: 'Triggers only when the entire message is your word. Example: "FREE" only matches if user sends just "FREE".',
                color: "var(--green-dark)",
              },
              {
                type: "regex",
                label: "Advanced pattern (Regex)",
                desc: "For power users only — matches using a regular expression pattern.",
                color: "var(--warn)",
              },
            ].map((t, i) => (
              <div
                key={t.type}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < 2 ? "1px solid var(--border-gray)" : "none",
                  alignItems: "flex-start",
                }}
              >
                <span
                  className="badge"
                  style={{
                    background: "var(--surface)",
                    color: t.color,
                    border: "1px solid var(--border-gray)",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {t.label}
                </span>
                <div style={{ fontSize: 13, color: "var(--cool-gray)", lineHeight: 1.5 }}>
                  {t.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}