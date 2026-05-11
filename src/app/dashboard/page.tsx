// src/app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
  ]);

  const activeWorkflows = workflows.filter((w) => w.isActive).length;
  const todayMessages = recentMessages.length;

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
                  <div>
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
  );
}