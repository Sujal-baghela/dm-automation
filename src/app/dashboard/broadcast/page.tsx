"use client"

import { useEffect, useState } from "react"
import "../dashboard.css"

type PlatformId = "instagram" | "whatsapp"
type SendMode = "now" | "later"

type BroadcastContact = {
  platform: PlatformId
  lastMessageAt?: string
}

type BroadcastMessage = {
  id: string
  direction: "inbound" | "outbound"
  content: string
  sentAt: string
  platform?: PlatformId
}

type ScheduledJob = {
  id: string
  platform: string
  message: string
  sendAt: string
  status: string
}

type ContactsResponse =
  | BroadcastContact[]
  | {
    contacts?: BroadcastContact[]
    conversations?: BroadcastContact[]
    recentMessages?: BroadcastMessage[]
    scheduledJobs?: ScheduledJob[]
  }

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function BroadcastPage() {
  const [contacts, setContacts] = useState<BroadcastContact[]>([])
  const [recentMessages, setRecentMessages] = useState<BroadcastMessage[]>([])
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("instagram")
  const [sendMode, setSendMode] = useState<SendMode>("now")
  const [message, setMessage] = useState("")
  const [sendAt, setSendAt] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadContacts() {
      try {
        const res = await fetch("/api/broadcast")
        if (!res.ok) throw new Error("Failed to load broadcast contacts")

        const data = (await res.json()) as ContactsResponse
        const loadedContacts = Array.isArray(data)
          ? data
          : Array.isArray(data.contacts)
            ? data.contacts
            : Array.isArray(data.conversations)
              ? data.conversations
              : []
        const loadedRecentMessages = Array.isArray(data)
          ? []
          : Array.isArray(data.recentMessages)
            ? data.recentMessages
            : []
        const loadedScheduledJobs = Array.isArray(data)
          ? []
          : Array.isArray(data.scheduledJobs)
            ? data.scheduledJobs
            : []

        if (isActive) {
          setContacts(loadedContacts)
          setRecentMessages(loadedRecentMessages)
          setScheduledJobs(loadedScheduledJobs)
        }
      } catch {
        if (isActive) {
          setContacts([])
          setRecentMessages([])
          setScheduledJobs([])
        }
      }
    }

    void loadContacts()
    return () => { isActive = false }
  }, [])

  const igContacts = contacts.filter((c) => c.platform === "instagram")
  const waContacts = contacts.filter((c) => c.platform === "whatsapp")
  const selectedContactsCount = selectedPlatform === "instagram" ? igContacts.length : waContacts.length

  async function handleSend() {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) {
      setErrorMessage("Please enter a message before sending.")
      setSuccessMessage(null)
      return
    }
    if (sendMode === "later" && !sendAt) {
      setErrorMessage("Choose a date and time for scheduled sending.")
      setSuccessMessage(null)
      return
    }

    setIsSending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform,
          message: trimmedMessage,
          sendAt: sendMode === "later" ? sendAt : null,
        }),
      })

      const data = (await res.json()) as { error?: string; jobId?: string; sendAt?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to send broadcast")

      if (sendMode === "later" && data.jobId) {
        // Add new job to list immediately
        setScheduledJobs((prev) => [
          ...prev,
          {
            id: data.jobId!,
            platform: selectedPlatform,
            message: trimmedMessage,
            sendAt: sendAt,
            status: "pending",
          },
        ])
        setMessage("")
        setSendAt("")
      }

      setSuccessMessage(
        sendMode === "later"
          ? `Broadcast scheduled for ${formatDateTime(sendAt)}.`
          : "Broadcast sent successfully."
      )
    } catch (err) {
      setErrorMessage((err as Error).message)
    } finally {
      setIsSending(false)
    }
  }

  async function handleCancel(jobId: string) {
    try {
      await fetch("/api/broadcast", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      setScheduledJobs((prev) => prev.filter((j) => j.id !== jobId))
    } catch {
      // Silently fail — job stays in list
    }
  }

  const platformEmoji: Record<string, string> = { instagram: "📸", whatsapp: "💬" }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Broadcast</div>
          <div className="page-sub">Send a message to all your contacts at once</div>
        </div>
        {scheduledJobs.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--purple-subtle)", border: "1px solid var(--purple)", borderRadius: "var(--r-sm)", fontSize: 13, color: "var(--purple)", fontWeight: 600 }}>
            📅 {scheduledJobs.length} broadcast{scheduledJobs.length > 1 ? "s" : ""} scheduled
          </div>
        )}
      </div>

      <div className="content">
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>

          {/* LEFT — compose */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="broadcast-card">
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Send via platform</label>
                <div className="platform-pills">
                  <button type="button" className={`plat-pill ${selectedPlatform === "instagram" ? "sel-ig" : ""}`} onClick={() => setSelectedPlatform("instagram")} style={{ cursor: "pointer" }}>
                    📸 Instagram ({igContacts.length} contacts)
                  </button>
                  <button type="button" className={`plat-pill ${selectedPlatform === "whatsapp" ? "sel-ig" : ""}`} onClick={() => setSelectedPlatform("whatsapp")} style={{ cursor: "pointer", opacity: waContacts.length === 0 ? 0.4 : 1 }}>
                    💬 WhatsApp ({waContacts.length} contacts)
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Send to</label>
                <select className="form-input" style={{ cursor: "pointer", borderRadius: "var(--r)", fontFamily: "inherit", fontSize: 14 }} disabled>
                  <option>
                    {selectedPlatform === "instagram"
                      ? `Instagram only (${igContacts.length} people)`
                      : `WhatsApp only (${waContacts.length} people)`}
                  </option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Your message</label>
                <textarea
                  className="textarea"
                  placeholder="Write your message here… Keep it short and personal. Example: Hey! We just dropped something new 👀 Reply YES if you want the details"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="char-count">{message.length} / 1000</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">When to send</label>
                <div className="platform-pills">
                  <button type="button" className={`plat-pill ${sendMode === "now" ? "sel-ig" : ""}`} onClick={() => setSendMode("now")} style={{ cursor: "pointer" }}>
                    Send now
                  </button>
                  <button type="button" className={`plat-pill ${sendMode === "later" ? "sel-ig" : ""}`} onClick={() => setSendMode("later")} style={{ cursor: "pointer" }}>
                    Schedule for later
                  </button>
                </div>
              </div>

              {sendMode === "later" && (
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Schedule date and time</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={sendAt}
                    onChange={(e) => setSendAt(e.target.value)}
                    style={{ cursor: "pointer", borderRadius: "var(--r)", fontFamily: "inherit", fontSize: 14 }}
                  />
                </div>
              )}

              <div style={{ background: "var(--warn-subtle)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 12, color: "var(--warn)", marginBottom: 16, lineHeight: 1.5 }}>
                ⚠️ WhatsApp only allows broadcasts to contacts who messaged within the last 24 hours, unless using approved Message Templates. Instagram has no such restriction.
              </div>

              {successMessage && (
                <div style={{ marginBottom: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "var(--green)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, lineHeight: 1.5 }}>
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div style={{ marginBottom: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--danger)", borderRadius: "var(--r-sm)", padding: "10px 14px", fontSize: 13, lineHeight: 1.5 }}>
                  {errorMessage}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-outlined"
                  style={{ flex: 1, justifyContent: "center" }}
                  type="button"
                  onClick={() => {
                    if (!message.trim()) {
                      alert("Write a message first to preview it.");
                      return;
                    }
                    alert(`📣 Preview — how your message will look:\n\n"${message.trim()}"\n\nPlatform: ${selectedPlatform}\nRecipients: ${selectedContactsCount} contacts`);
                  }}
                >
                  Preview
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: "center" }}
                  disabled={isSending || selectedContactsCount === 0}
                  type="button"
                  onClick={() => void handleSend()}
                >
                  {isSending ? "Sending..." : `📣 ${sendMode === "later" ? "Schedule" : "Send"} to ${selectedContactsCount} contacts`}
                </button>
              </div>
            </div>

            {/* ── Scheduled Jobs list ── */}
            {scheduledJobs.length > 0 && (
              <div className="card">
                <div className="card-head">
                  <div className="card-title">📅 Scheduled Broadcasts</div>
                  <span className="badge badge-neutral">{scheduledJobs.length} pending</span>
                </div>
                {scheduledJobs.map((job) => (
                  <div key={job.id} className="wf-row" style={{ alignItems: "flex-start" }}>
                    <div className="wf-icon" style={{ background: "var(--purple-subtle)", fontSize: 14 }}>
                      {platformEmoji[job.platform] ?? "📣"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="wf-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{job.platform}</span>
                        <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                          {formatDateTime(job.sendAt)}
                        </span>
                      </div>
                      <div className="wf-meta" style={{ marginTop: 2 }}>
                        {job.message.length > 60 ? `${job.message.slice(0, 60)}…` : job.message}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCancel(job.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 12, fontWeight: 600, padding: "4px 8px", borderRadius: "var(--r-sm)", flexShrink: 0 }}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            <div className="card" style={{ padding: "18px 20px" }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Tips for high reply rates</div>
              {[
                "Send between 10am–12pm or 6pm–8pm in your audience's timezone",
                "Keep messages under 160 characters — shorter gets more replies",
                "Always include a clear call to action like 'Reply YES' or 'Click below'",
                "Personalise with their name if you have it stored as a tag",
                "Don't broadcast more than once every 3 days to the same contacts",
              ].map((tip, i) => (
                <div key={tip} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: i < 4 ? "1px solid var(--border-gray)" : "none", fontSize: 13, color: "var(--cool-gray)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — contact breakdown + recent messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card">
              <div className="card-head">
                <div className="card-title">Contact breakdown</div>
              </div>
              <div style={{ padding: "14px 20px" }}>
                {[
                  { label: "Instagram", count: igContacts.length, color: "#e1306c" },
                  { label: "WhatsApp", count: waContacts.length, color: "#25d366" },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--cool-gray)", marginBottom: 5 }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 600 }}>{item.count} / {contacts.length}</span>
                    </div>
                    <div style={{ height: 6, background: "var(--surface)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: contacts.length > 0 ? `${Math.round((item.count / contacts.length) * 100)}%` : "0%", background: item.color, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div style={{ fontSize: 13, color: "var(--silver-blue)", textAlign: "center", padding: "12px 0" }}>
                    No contacts yet — they appear when someone messages your bot
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div className="card-title">Recent messages</div>
              </div>
              {recentMessages.length === 0 ? (
                <div style={{ padding: "20px", fontSize: 13, color: "var(--silver-blue)" }}>No messages yet.</div>
              ) : (
                recentMessages.map((msg) => (
                  <div className="act-row" key={msg.id}>
                    <div className="act-dot" style={{ background: msg.direction === "outbound" ? "var(--purple)" : "var(--green)" }} />
                    <div>
                      <div className="act-text">
                        <span className={`badge ${msg.direction === "outbound" ? "badge-purple" : "badge-success"}`} style={{ marginRight: 6, fontSize: 10 }}>
                          {msg.direction}
                        </span>
                        {msg.content.slice(0, 50)}{msg.content.length > 50 ? "…" : ""}
                      </div>
                      <div className="act-time">{msg.platform ?? "unknown"} · {new Date(msg.sentAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}