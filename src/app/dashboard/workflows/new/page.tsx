"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import "../../dashboard.css"

const PLATFORMS = [
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "whatsapp", label: "WhatsApp", emoji: "💬" },
]

const TRIGGER_TYPES = [
  { id: "keyword", label: "Keyword match", desc: "Message contains this word anywhere" },
  { id: "exact", label: "Exact match", desc: "Message must be exactly this word" },
  { id: "regex", label: "Regex match", desc: "Advanced pattern matching" },
]

export default function Page() {
  const [name, setName] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [triggerType, setTriggerType] = useState("keyword")
  const [pattern, setPattern] = useState("")
  const [replyMessage, setReplyMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Workflow name is required")
      return
    }
    if (selectedPlatforms.length === 0) {
      setError("Select at least one platform")
      return
    }
    if (!pattern.trim()) {
      setError("Trigger pattern is required")
      return
    }
    if (!replyMessage.trim()) {
      setError("Reply message is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const body = {
        name,
        platforms: selectedPlatforms,
        isActive: true,
        nodes: [{ type: "send_message", message: replyMessage }],
        triggers: [{ type: triggerType, pattern, platform: null }],
      }

      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to create workflow")

      router.push("/dashboard/workflows")
    } catch (err) {
      setError((err as Error)?.message ?? String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
  <>
    <div className="topbar">
      <div>
        <div className="page-title">New Workflow</div>
        <div className="page-sub">Create a keyword-triggered auto-reply</div>
      </div>
      <div className="topbar-actions">
        <Link href="/dashboard/workflows" className="btn btn-gray btn-sm">← Back</Link>
      </div>
    </div>

    <div className="content">
      <div className="two-col">

        {/* LEFT COLUMN */}
        <div className="card" style={{ padding: 24 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Workflow details</div>

          <label className="form-label">Workflow name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Price inquiry reply" />

          <label className="form-label" style={{ marginTop: 16 }}>Platforms</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {PLATFORMS.map((p) => {
              const selected = selectedPlatforms.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--r)",
                    border: `1.5px solid ${selected ? "var(--purple)" : "var(--border-gray)"}`,
                    background: selected ? "var(--purple-subtle)" : "var(--white)",
                    cursor: "pointer",
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{p.emoji}</span>
                  <span style={{ color: selected ? "var(--purple)" : "var(--near-black)", fontWeight: 500 }}>{p.label}</span>
                </button>
              )
            })}
          </div>

          <label className="form-label" style={{ marginTop: 16 }}>Trigger type</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TRIGGER_TYPES.map((t) => {
              const selected = triggerType === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTriggerType(t.id)}
                  style={{
                    padding: "10px 14px",
                    border: `1.5px solid ${selected ? "var(--purple)" : "var(--border-gray)"}`,
                    borderRadius: "var(--r)",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    background: selected ? "var(--purple-subtle)" : "var(--white)",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: selected ? "var(--purple)" : "var(--near-black)" }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: "var(--silver-blue)", marginTop: 2 }}>{t.desc}</div>
                </button>
              )
            })}
          </div>

          <label className="form-label" style={{ marginTop: 16 }}>Trigger keyword or pattern</label>
          <input
            className="form-input"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder={triggerType === "regex" ? "e.g. ^(price|cost|how much)" : "e.g. price"}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="card" style={{ padding: 24 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Auto-reply message</div>

          <p style={{ fontSize: 13, color: "var(--silver-blue)", marginBottom: 16, lineHeight: 1.6 }}>
            When the trigger matches, this message will be sent automatically to the user.
          </p>

          <label className="form-label">Reply message</label>
          <textarea
            className="textarea"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="e.g. Thanks for your message! Our prices start from $99. Reply YES to get a full quote."
            style={{ minHeight: 140 }}
          />

          {replyMessage.trim() ? (
            <>
              <label className="form-label" style={{ marginTop: 16 }}>Preview</label>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-gray)", borderRadius: "var(--r)", padding: "12px 14px", fontSize: 14, lineHeight: 1.6, color: "var(--near-black)" }}>
                {replyMessage}
              </div>
            </>
          ) : null}

          {error ? (
            <div style={{ marginTop: 16, color: "var(--danger)", background: "var(--danger-subtle)", border: "1px solid var(--danger-border)", borderRadius: "var(--r-sm)", padding: "10px 12px", fontSize: 13 }}>
              {error}
            </div>
          ) : null}

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 16, justifyContent: "center" }}
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? "Creating..." : "⚡ Create Workflow"}
          </button>
        </div>

      </div>
    </div>
  </>
)
}