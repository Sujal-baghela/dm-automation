// src/app/dashboard/platforms/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const connections = await prisma.platformConnection.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const instagram = connections.filter((c) => c.platform === "instagram");
  const whatsapp = connections.filter((c) => c.platform === "whatsapp");

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Platforms</div>
          <div className="page-sub">
            Manage connected Instagram and WhatsApp accounts
          </div>
        </div>
        <div className="topbar-actions">
          <Link href="/dashboard/platforms/connect" className="btn btn-primary btn-sm">
            + Connect Account
          </Link>
        </div>
      </div>

      <div className="content">
        {/* SUMMARY STATS */}
        <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <div className="stat-card">
            <div className="stat-label">Total connections</div>
            <div className="stat-val" style={{ color: "var(--purple)" }}>
              {connections.length}
            </div>
            <div className="stat-delta delta-neutral">across all platforms</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Instagram accounts</div>
            <div className="stat-val" style={{ color: "var(--green)" }}>
              {instagram.length}
            </div>
            <div className="stat-delta delta-neutral">
              {instagram.filter((c) => !isExpired(c.expiresAt)).length} active
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">WhatsApp accounts</div>
            <div className="stat-val">{whatsapp.length}</div>
            <div className="stat-delta delta-neutral">
              {whatsapp.filter((c) => !isExpired(c.expiresAt)).length} active
            </div>
          </div>
        </div>

        {/* NO CONNECTIONS STATE */}
        {connections.length === 0 && (
          <div
            className="card"
            style={{ padding: "40px 20px", textAlign: "center" }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 6,
                letterSpacing: "-0.3px",
              }}
            >
              No platforms connected yet
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--silver-blue)",
                marginBottom: 20,
              }}
            >
              Connect an Instagram or WhatsApp account to start automating.
            </div>
            <Link
              href="/dashboard/platforms/connect"
              className="btn btn-primary btn-sm"
            >
              + Connect your first account
            </Link>
          </div>
        )}

        {/* INSTAGRAM SECTION */}
        {instagram.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--silver-blue)",
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 12,
              }}
            >
              Instagram accounts
            </div>
            <div className="plat-grid">
              {instagram.map((conn) => {
                const expired = isExpired(conn.expiresAt);
                return (
                  <div
                    key={conn.id}
                    className={`plat-card ${expired ? "disconnected" : ""}`}
                  >
                    <div className="plat-head">
                      <div
                        className="plat-icon"
                        style={{ background: "rgba(225,48,108,.1)" }}
                      >
                        📸
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="plat-name">Instagram</div>
                        <div className="plat-handle">ID: {conn.accountId}</div>
                      </div>
                      <span className="status-pill">
                        <span
                          className={`dot ${expired ? "dot-red" : "dot-green"}`}
                        />
                        {expired ? "Token expired" : "Connected"}
                      </span>
                    </div>

                    <div className="plat-stats">
                      <div className="plat-stat">
                        <div className="plat-stat-val" style={{ fontSize: 13 }}>
                          {conn.user?.name ?? conn.user?.email ?? "—"}
                        </div>
                        <div className="plat-stat-label">Account owner</div>
                      </div>
                      <div className="plat-stat">
                        <div className="plat-stat-val" style={{ fontSize: 13 }}>
                          {conn.expiresAt
                            ? new Date(conn.expiresAt).toLocaleDateString()
                            : "Never"}
                        </div>
                        <div className="plat-stat-label">Token expires</div>
                      </div>
                    </div>

                    {expired && (
                      <div className="disconnect-note">
                        ⚠️ This token has expired. Workflows using this account
                        are paused. Reconnect to restore them.
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      {expired ? (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: "center" }}
                        >
                          Reconnect →
                        </button>
                      ) : (
                        <button
                          className="btn btn-gray btn-sm"
                          style={{ flex: 1, justifyContent: "center" }}
                        >
                          View details
                        </button>
                      )}
                      <DisconnectButton connectionId={conn.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WHATSAPP SECTION */}
        {whatsapp.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--silver-blue)",
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 12,
              }}
            >
              WhatsApp accounts
            </div>
            <div className="plat-grid">
              {whatsapp.map((conn) => {
                const expired = isExpired(conn.expiresAt);
                return (
                  <div
                    key={conn.id}
                    className={`plat-card ${expired ? "disconnected" : ""}`}
                  >
                    <div className="plat-head">
                      <div
                        className="plat-icon"
                        style={{ background: "rgba(37,211,102,.1)" }}
                      >
                        💬
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="plat-name">WhatsApp Business</div>
                        <div className="plat-handle">ID: {conn.accountId}</div>
                      </div>
                      <span className="status-pill">
                        <span
                          className={`dot ${expired ? "dot-red" : "dot-green"}`}
                        />
                        {expired ? "Token expired" : "Connected"}
                      </span>
                    </div>

                    <div className="plat-stats">
                      <div className="plat-stat">
                        <div className="plat-stat-val" style={{ fontSize: 13 }}>
                          {conn.user?.name ?? conn.user?.email ?? "—"}
                        </div>
                        <div className="plat-stat-label">Account owner</div>
                      </div>
                      <div className="plat-stat">
                        <div className="plat-stat-val" style={{ fontSize: 13 }}>
                          {conn.expiresAt
                            ? new Date(conn.expiresAt).toLocaleDateString()
                            : "Never"}
                        </div>
                        <div className="plat-stat-label">Token expires</div>
                      </div>
                    </div>

                    {expired && (
                      <div className="disconnect-note">
                        ⚠️ This token has expired. Workflows using this account
                        are paused. Reconnect to restore them.
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      {expired ? (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: "center" }}
                        >
                          Reconnect →
                        </button>
                      ) : (
                        <button
                          className="btn btn-gray btn-sm"
                          style={{ flex: 1, justifyContent: "center" }}
                        >
                          View details
                        </button>
                      )}
                      <DisconnectButton connectionId={conn.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HOW IT WORKS - for the manager */}
        <div
          className="card"
          style={{ padding: "20px", marginTop: 8 }}
        >
          <div className="card-title" style={{ marginBottom: 14 }}>
            How platform connections work
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
            }}
          >
            {[
              {
                step: "1",
                title: "Connect account",
                desc: "Use the Meta API to link an Instagram or WhatsApp Business account. This stores an access token securely in your database.",
              },
              {
                step: "2",
                title: "Webhooks activate",
                desc: "Once connected, Meta sends all incoming messages and comments to your webhook endpoints automatically.",
              },
              {
                step: "3",
                title: "Workflows run",
                desc: "Your workflowMatcher checks each incoming message against active workflows and triggers the right reply.",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--r-sm)",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    background: "var(--purple-subtle)",
                    color: "var(--purple)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  {item.step}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--silver-blue)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Client component for disconnect button
function DisconnectButton({ connectionId }: { connectionId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await prisma.platformConnection.delete({ where: { id: connectionId } });
      }}
    >
      <button type="submit" className="btn btn-danger btn-sm">
        Disconnect
      </button>
    </form>
  );
}