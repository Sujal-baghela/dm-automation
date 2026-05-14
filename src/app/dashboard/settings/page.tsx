"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useDashboardMode } from "@/lib/modeContext"

const TABS = ["Profile", "Connected Platforms", "Notifications", "Billing", "Danger Zone"] as const
type Tab = (typeof TABS)[number]

type PlatformState = {
  instagram: boolean
  whatsapp: boolean
  linkedin: boolean
  youtube: boolean
  gmb: boolean
}
export default function SettingsPage() {
  const { mode } = useDashboardMode()
  const [activeTab, setActiveTab] = useState<Tab>("Profile")
  const [name, setName] = useState("Test User")
  const [email, setEmail] = useState("test@dm-automation.com")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [platforms, setPlatforms] = useState<PlatformState>({
    instagram: true,
    whatsapp: false,
    linkedin: false,
    youtube: false,
    gmb: false,
  })
  const [emailOnPublish, setEmailOnPublish] = useState(true)
  const [emailOnFail, setEmailOnFail] = useState(true)

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  function togglePlatform(key: keyof PlatformState) {
    setPlatforms((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function confirmDeleteAccount() {
    if (window.confirm("Delete your account? This action cannot be undone.")) {
      window.alert("Delete account flow would start here.")
    }
  }

  // DM mode shows Instagram + WhatsApp
  // Social mode shows Instagram + Facebook + LinkedIn + YouTube
  const dmPlatforms: { key: keyof PlatformState; label: string; emoji: string; note?: string }[] = [
    { key: "instagram", label: "Instagram", emoji: "📸", note: "Instagram DM automation via Meta API" },
    { key: "whatsapp", label: "WhatsApp", emoji: "💬", note: "WhatsApp Business API required" },
  ]

  const socialPlatforms: { key: keyof PlatformState; label: string; emoji: string; note?: string }[] = [
    { key: "instagram", label: "Instagram", emoji: "📸", note: "Publishing via Instagram Graph API" },
    { key: "gmb", label: "Google Business", emoji: "📍", note: "Publishing via Google Business Profile API" },
    { key: "linkedin", label: "LinkedIn", emoji: "💼", note: "Publishing via LinkedIn API" },
    { key: "youtube", label: "YouTube", emoji: "🎥", note: "Publishing via YouTube Data API" },
  ]

  const activePlatforms = mode === "dm" ? dmPlatforms : socialPlatforms

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">
            {mode === "dm"
              ? "Manage your DM automation connections and preferences"
              : "Manage your social publishing connections and preferences"}
          </div>
        </div>
      </div>

      <div className="content">
        {/* TABS */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                cursor: "pointer",
                border: "none",
                background: activeTab === tab
                  ? mode === "dm" ? "var(--purple)" : "var(--green)"
                  : "var(--surface)",
                color: activeTab === tab ? "white" : "var(--silver-blue)",
                padding: "7px 14px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                transition: "all .15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PROFILE */}
        {activeTab === "Profile" && (
          <div className="card" style={{ padding: 24 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Profile</div>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 20, alignItems: "start" }}>
              <div>
                <div style={{
                  width: 120, height: 120, borderRadius: "50%",
                  background: "var(--surface)", border: "1px dashed var(--border-gray)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textAlign: "center", padding: 12, color: "var(--silver-blue)",
                  fontSize: 13, lineHeight: 1.5, marginBottom: 10, overflow: "hidden",
                }}>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    "Click to upload"
                  )}
                </div>
                <label className="btn btn-outlined btn-sm" style={{ display: "inline-flex", cursor: "pointer" }}>
                  Upload avatar
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      setAvatarPreview(file ? URL.createObjectURL(file) : null)
                    }}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label className="form-label">Name</label>
                  <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <span className="badge badge-neutral">
                  Profile updates are saved locally in this demo
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CONNECTED PLATFORMS — mode aware */}
        {activeTab === "Connected Platforms" && (
          <div className="card" style={{ padding: 24 }}>
            <div className="card-title" style={{ marginBottom: 6 }}>
              {mode === "dm" ? "DM Automation Platforms" : "Social Publishing Platforms"}
            </div>
            <div style={{
              fontSize: 12, color: "var(--silver-blue)", marginBottom: 16,
              padding: "8px 12px", background: "var(--surface)",
              borderRadius: "var(--r-sm)", border: "1px solid var(--border-gray)",
            }}>
              {mode === "dm"
                ? "⚡ Connect Instagram and WhatsApp to enable DM automation and broadcast."
                : "📱 Connect your social accounts to publish and schedule posts across platforms."}
              {" "}For the demo, connect/disconnect is simulated. Real OAuth requires API credentials in .env
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {activePlatforms.map((p) => (
                <div
                  key={p.key}
                  style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", gap: 12, padding: 16,
                    border: `1px solid ${platforms[p.key] ? "rgba(20,158,97,0.3)" : "var(--border-gray)"}`,
                    borderRadius: "var(--r)",
                    background: platforms[p.key] ? "rgba(20,158,97,0.03)" : "transparent",
                    transition: "all .2s",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {p.emoji} {p.label}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className={`badge ${platforms[p.key] ? "badge-success" : "badge-neutral"}`}>
                        {platforms[p.key] ? "Connected" : "Disconnected"}
                      </span>
                      {p.note && (
                        <span style={{ fontSize: 11, color: "var(--silver-blue)" }}>
                          {p.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <label style={{ display: "inline-flex", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={platforms[p.key]}
                      onChange={() => togglePlatform(p.key)}
                      style={{ display: "none" }}
                    />
                    <span className={`toggle ${platforms[p.key] ? "on" : "off"}`} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === "Notifications" && (
          <div className="card" style={{ padding: 24 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Notifications</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 16, padding: 16,
                border: "1px solid var(--border-gray)", borderRadius: "var(--r)",
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {mode === "dm" ? "Email when broadcast sent" : "Email when post published"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--silver-blue)" }}>
                    {mode === "dm"
                      ? "Get notified when a broadcast is sent to your contacts."
                      : "Get notified when scheduled content goes live."}
                  </div>
                </div>
                <label style={{ display: "inline-flex", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={emailOnPublish}
                    onChange={(e) => setEmailOnPublish(e.target.checked)}
                    style={{ display: "none" }}
                  />
                  <span className={`toggle ${emailOnPublish ? "on" : "off"}`} />
                </label>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 16, padding: 16,
                border: "1px solid var(--border-gray)", borderRadius: "var(--r)",
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {mode === "dm" ? "Email when workflow fails" : "Email when post fails"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--silver-blue)" }}>
                    Be alerted if automation runs into an error.
                  </div>
                </div>
                <label style={{ display: "inline-flex", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={emailOnFail}
                    onChange={(e) => setEmailOnFail(e.target.checked)}
                    style={{ display: "none" }}
                  />
                  <span className={`toggle ${emailOnFail ? "on" : "off"}`} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* BILLING */}
        {activeTab === "Billing" && (
          <div className="card" style={{ padding: 24 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Billing</div>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 12, padding: 16,
                border: "1px solid var(--border-gray)", borderRadius: "var(--r)",
              }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Current plan</div>
                  <div style={{ fontSize: 13, color: "var(--silver-blue)" }}>
                    You are on the demo tier.{" "}
                    {mode === "dm"
                      ? "Upgrade for unlimited workflows and contacts."
                      : "Upgrade for unlimited posts and platforms."}
                  </div>
                </div>
                <span className="badge badge-neutral">Free Demo Plan</span>
              </div>

              <div style={{
                padding: 16, borderRadius: "var(--r)",
                border: "1px solid var(--border-gray)",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
              }}>
                {(mode === "dm" ? [
                  { label: "Workflows", used: 3, limit: 3 },
                  { label: "Contacts", used: 5, limit: 100 },
                  { label: "Broadcasts/month", used: 1, limit: 5 },
                  { label: "Platforms", used: 1, limit: 2 },
                ] : [
                  { label: "Posts/month", used: 5, limit: 10 },
                  { label: "Scheduled posts", used: 2, limit: 5 },
                  { label: "Platforms", used: 2, limit: 2 },
                  { label: "Team members", used: 1, limit: 1 },
                ]).map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: 12, color: "var(--silver-blue)", marginBottom: 4 }}>
                      {item.label}
                    </div>
                    <div style={{ height: 4, background: "var(--surface)", borderRadius: 99, overflow: "hidden", marginBottom: 3 }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(Math.round((item.used / item.limit) * 100), 100)}%`,
                        background: item.used >= item.limit ? "var(--danger)" : "var(--purple)",
                        borderRadius: 99,
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--cool-gray)" }}>
                      {item.used} / {item.limit}
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/pricing" className="btn btn-primary" style={{ width: "fit-content" }}>
                Upgrade plan →
              </Link>
            </div>
          </div>
        )}

        {/* DANGER ZONE */}
        {activeTab === "Danger Zone" && (
          <div className="card" style={{ padding: 24 }}>
            <div className="card-title" style={{ marginBottom: 16, color: "var(--danger)" }}>
              Danger Zone
            </div>
            <div style={{
              padding: 16,
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "var(--r)",
              background: "rgba(239,68,68,0.04)",
            }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Delete account</div>
              <div style={{ fontSize: 13, color: "var(--silver-blue)", marginBottom: 14 }}>
                Permanently remove your account, all workflows, contacts, and posts. This cannot be undone.
              </div>
              <button
                type="button"
                className="btn"
                onClick={confirmDeleteAccount}
                style={{ background: "var(--danger)", color: "white", border: "none" }}
              >
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}