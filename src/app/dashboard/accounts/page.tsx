import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", emoji: "📸", color: "rgba(225,48,108,.1)" },
  { id: "linkedin", name: "LinkedIn", emoji: "💼", color: "rgba(0,119,181,.1)" },
  { id: "youtube", name: "YouTube", emoji: "🎥", color: "rgba(255,0,0,.1)" },
  { id: "gmb", name: "Google Business", emoji: "📍", color: "rgba(52,168,224,.1)" },
];

export default async function AccountsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Unauthorized</div>;
  }

  const accounts = await prisma.account.findMany({
    where: { userId },
  });

  const accountsByPlatform: Record<string, (typeof accounts)[0] | null> = {
    instagram: accounts.find((a) => a.platform === "instagram") ?? null,
    linkedin: accounts.find((a) => a.platform === "linkedin") ?? null,
    youtube: accounts.find((a) => a.platform === "youtube") ?? null,
    gmb: accounts.find((a) => a.platform === "gmb") ?? null,
  };

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const connectedCount = Object.values(accountsByPlatform).filter(
    (a) => a !== null && !isExpired(a.expiresAt)
  ).length;

  const expiredCount = Object.values(accountsByPlatform).filter(
    (a) => a !== null && isExpired(a.expiresAt)
  ).length;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Accounts</div>
          <div className="page-sub">Manage your connected social media accounts</div>
        </div>
      </div>

      <div className="content">
        {/* SUMMARY STATS */}
        <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total connected</div>
            <div className="stat-val" style={{ color: "var(--purple)" }}>
              {accounts.length}
            </div>
            <div className="stat-delta delta-neutral">of {PLATFORMS.length} platforms</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active accounts</div>
            <div className="stat-val" style={{ color: "var(--green)" }}>
              {connectedCount}
            </div>
            <div className="stat-delta delta-neutral">tokens not expired</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Expired tokens</div>
            <div className="stat-val" style={{ color: "var(--warn)" }}
              {expiredCount}
            </div>
            <div className="stat-delta delta-neutral">
              {expiredCount > 0 ? "reconnect needed" : "all tokens valid"}
            </div>
          </div>
        </div>

        {/* PLATFORM CARDS */}
        <div className="plat-grid">
          {PLATFORMS.map((platform) => {
            const account = accountsByPlatform[platform.id] ?? null;
            const expired = account ? isExpired(account.expiresAt) : false;

            return (
              <div
                key={platform.id}
                className={`plat-card ${account && expired ? "disconnected" : ""}`}
              >
                <div className="plat-head">
                  <div className="plat-icon" style={{ background: platform.color }}>
                    {platform.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="plat-name">{platform.name}</div>
                    <div className="plat-handle">
                      {account ? `ID: ${account.externalId}` : "Not connected"}
                    </div>
                  </div>
                  {account && (
                    <span className="status-pill">
                      <span className={`dot ${expired ? "dot-red" : "dot-green"}`} />
                      {expired ? "Expired" : "Connected"}
                    </span>
                  )}
                </div>

                {account && (
                  <div className="plat-stats">
                    <div className="plat-stat">
                      <div className="plat-stat-val" style={{ fontSize: 13 }}>
                        {account.externalId}
                      </div>
                      <div className="plat-stat-label">Account ID</div>
                    </div>
                    <div className="plat-stat">
                      <div className="plat-stat-val" style={{ fontSize: 13 }}>
                        {account.expiresAt
                          ? new Date(account.expiresAt).toLocaleDateString()
                          : "Never"}
                      </div>
                      <div className="plat-stat-label">Token expires</div>
                    </div>
                  </div>
                )}

                {account && expired && (
                  <div className="disconnect-note">
                    ⚠️ This token has expired. Reconnect to enable posting and messaging.
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  {account ? (
                    <>
                      {expired && (
                        <Link
                          href={`/api/auth/${platform.id}`}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, textAlign: "center" }}
                        >
                          Reconnect →
                        </Link>
                      )}
                      <DisconnectButton accountId={account.id} userId={userId} />
                    </>
                  ) : (
                    <Link
                      href={`/api/auth/${platform.id}`}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, textAlign: "center" }}
                    >
                      Connect →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// Server action component for disconnect button
function DisconnectButton({ accountId, userId }: { accountId: string; userId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await prisma.account.delete({ 
          where: { id: accountId, userId } // ADD userId
        });
      }}
    >
      <button type="submit" className="btn btn-danger btn-sm">
        Disconnect
      </button>
    </form>
  );
}
