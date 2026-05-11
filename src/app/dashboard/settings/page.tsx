// src/app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Your environment variables and API keys</div>
        </div>
      </div>
      <div className="content">
        <div className="settings-grid">
          <div className="settings-card">
            <div className="settings-title">Database — Neon PostgreSQL</div>
            <div className="settings-sub">Set in your .env file as DATABASE_URL</div>
            <label className="form-label">DATABASE_URL</label>
            <input className="form-input" type="password" defaultValue="postgresql://****" readOnly />
            <span className="badge badge-success">✓ Connected via Prisma</span>
          </div>
          <div className="settings-card">
            <div className="settings-title">Queue — Upstash Redis</div>
            <div className="settings-sub">Set in your .env file as REDIS_URL</div>
            <label className="form-label">REDIS_URL</label>
            <input className="form-input" type="password" defaultValue="rediss://****" readOnly />
            <span className="badge badge-success">✓ Connected via BullMQ</span>
          </div>
          <div className="settings-card">
            <div className="settings-title">Instagram Webhook</div>
            <div className="settings-sub">Set IG_VERIFY_TOKEN and IG_WEBHOOK_SECRET in .env</div>
            <label className="form-label">Webhook URL</label>
            <input className="form-input" defaultValue="/api/webhook/instagram" readOnly />
            <label className="form-label">Verify Token</label>
            <input className="form-input" type="password" defaultValue="****" readOnly />
            <span className="badge badge-success">✓ Active</span>
          </div>
          <div className="settings-card">
            <div className="settings-title">WhatsApp Webhook</div>
            <div className="settings-sub">Set WA_VERIFY_TOKEN and WA_WEBHOOK_SECRET in .env</div>
            <label className="form-label">Webhook URL</label>
            <input className="form-input" defaultValue="/api/webhook/whatsapp" readOnly />
            <label className="form-label">Verify Token</label>
            <input className="form-input" type="password" defaultValue="****" readOnly />
            <span className="badge badge-neutral">Check Meta Dashboard</span>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: "16px 20px", background: "var(--white)", border: "1px solid var(--border-gray)", borderRadius: "var(--r-card)", fontSize: 13, color: "var(--cool-gray)", lineHeight: 1.6 }}>
          💡 To change any value, edit your <code style={{ background: "var(--surface)", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>.env</code> file and restart the server with <code style={{ background: "var(--surface)", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>npm run dev</code>
        </div>
      </div>
    </>
  );
}