// src/app/dashboard/logs/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const tagClass: Record<string, string> = {
  MATCH: "log-success",
  SENT: "log-success",
  BROADCAST: "log-success",
  ERROR: "log-error",
  WARN: "log-warn",
  INFO: "log-info",
};

export default async function LogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Audit Logs</div>
          <div className="page-sub">Every action your system takes is recorded here</div>
        </div>
      </div>
      <div className="content">
        <div className="card">
          <div className="card-head">
            <div className="card-title">System logs</div>
          </div>
          {logs.length === 0 ? (
            <div style={{ padding: "24px 20px", color: "var(--silver-blue)", fontSize: 13 }}>
              No logs yet — they appear here as your workflows run.
            </div>
          ) : (
            logs.map((log) => {
              const tag = log.action.split(" ")[0].toUpperCase();
              return (
                <div className="log-row" key={log.id}>
                  <span className={`log-tag ${tagClass[tag] ?? "log-info"}`}>{tag}</span>
                  <div className="log-text">{log.action}</div>
                  <div className="log-time">{new Date(log.createdAt).toLocaleTimeString()}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}