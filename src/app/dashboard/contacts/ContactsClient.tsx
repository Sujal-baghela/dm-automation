"use client"

import { useState } from "react"

type ScoredContact = {
  id: string
  externalId: string
  platform: string
  status: string
  lastMessageAt: string
  messageCount: number
  lastContent: string
  score: number
  scoreLabel: "Hot" | "Warm" | "Cold"
}

export default function ContactsClient({ contacts }: { contacts: ScoredContact[] }) {
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all")
  const [search, setSearch] = useState("")

  const filtered = contacts.filter((c) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "hot" && c.score >= 70) ||
      (filter === "warm" && c.score >= 31 && c.score < 70) ||
      (filter === "cold" && c.score < 31)
    const matchesSearch =
      search === "" ||
      c.externalId.toLowerCase().includes(search.toLowerCase()) ||
      c.platform.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const hotCount = contacts.filter((c) => c.score >= 70).length
  const warmCount = contacts.filter((c) => c.score >= 31 && c.score < 70).length
  const coldCount = contacts.filter((c) => c.score < 31).length

  const badgeColor = (label: string) => {
    if (label === "Hot") return { background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }
    if (label === "Warm") return { background: "#fef9c3", color: "#ca8a04", border: "1px solid #fef08a" }
    return { background: "var(--surface)", color: "var(--silver-blue)", border: "1px solid var(--border-gray)" }
  }

  const scoreBarColor = (score: number) => {
    if (score >= 70) return "#22c55e"
    if (score >= 31) return "#eab308"
    return "#94a3b8"
  }

  return (
    <>
      <div className="stats-row" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Total Contacts</div>
          <div className="stat-val" style={{ color: "var(--purple)" }}>{contacts.length}</div>
          <div className="stat-delta delta-neutral">all time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">🔥 Hot Leads</div>
          <div className="stat-val" style={{ color: "var(--green)" }}>{hotCount}</div>
          <div className="stat-delta delta-up">score ≥ 70</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">🌤 Warm Leads</div>
          <div className="stat-val" style={{ color: "#ca8a04" }}>{warmCount}</div>
          <div className="stat-delta delta-neutral">score 31–69</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">🧊 Cold Leads</div>
          <div className="stat-val">{coldCount}</div>
          <div className="stat-delta delta-neutral">score ≤ 30</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          className="search-box"
          placeholder="Search by ID or platform…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        {(["all", "hot", "warm", "cold"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`badge ${filter === f ? "badge-purple" : "badge-neutral"}`}
            style={{ border: "none", cursor: "pointer", padding: "6px 14px", fontSize: 12, fontWeight: 600 }}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "hot" ? "🔥 Hot" : f === "warm" ? "🌤 Warm" : "🧊 Cold"}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <div className="table-head">
          <div className="th">Contact ID</div>
          <div className="th">Platform</div>
          <div className="th">Lead Score</div>
          <div className="th">Status</div>
          <div className="th">Last active</div>
          <div className="th">Last message</div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: "24px 20px", color: "var(--silver-blue)", fontSize: 13 }}>
            No contacts match this filter.
          </div>
        ) : (
          filtered.map((c) => (
            <div className="table-row" key={c.id}>
              <div>
                <div className="contact-name">{c.externalId}</div>
                <div className="contact-id">{c.id.slice(0, 12)}…</div>
              </div>
              <div className="td">
                <span className={`badge ${c.platform === "instagram" ? "badge-ig" : "badge-wa"}`}>
                  {c.platform}
                </span>
              </div>
              <div className="td">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 48, height: 6, background: "var(--border-gray)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${c.score}%`, height: "100%", background: scoreBarColor(c.score), borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 24 }}>{c.score}</span>
                  <span
                    className="badge"
                    style={{ ...badgeColor(c.scoreLabel), fontSize: 10, padding: "2px 7px" }}
                  >
                    {c.scoreLabel === "Hot" ? "🔥" : c.scoreLabel === "Warm" ? "🌤" : "🧊"} {c.scoreLabel}
                  </span>
                </div>
              </div>
              <div className="td">
                <span className={`badge ${c.status === "active" ? "badge-success" : "badge-neutral"}`}>
                  {c.status}
                </span>
              </div>
              <div className="td" style={{ color: "var(--silver-blue)" }}>
                {new Date(c.lastMessageAt).toLocaleString()}
              </div>
              <div className="td" style={{ color: "var(--silver-blue)" }}>
                {c.lastContent}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
