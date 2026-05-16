"use client";

import { useState } from "react";

interface Message {
  id: string;
  platform: string;
  senderId: string;
  text: string | null;
  mediaUrl: string | null;
  isRead: boolean;
  isOutbound: boolean;
  tags: string[];
  createdAt: string;
}

interface Insight {
  id: string;
  sentiment: string;
  intent: string;
  tags: string[];
  summary: string;
  analyzedAt: string;
}

interface Stats {
  platforms: string[];
  totalMessages: number;
  inboundCount: number;
  outboundCount: number;
  lastActive: string | null;
  firstSeen: string | null;
}

interface Props {
  senderId: string;
  messages: Message[];
  insight: Insight | null;
  allInsights: Insight[];
  stats: Stats;
}

const platformEmoji: Record<string, string> = {
  instagram: "📸",
  linkedin: "💼",
  youtube: "🎥",
  gmb: "📍",
  whatsapp: "💬",
};

const sentimentConfig: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  positive: { emoji: "😊", label: "Positive", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  neutral:  { emoji: "😐", label: "Neutral",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  negative: { emoji: "😟", label: "Negative", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const intentConfig: Record<string, { emoji: string; label: string }> = {
  "interested":    { emoji: "👀", label: "Interested" },
  "price-inquiry": { emoji: "💰", label: "Price Inquiry" },
  "support":       { emoji: "🛠", label: "Support" },
  "objection":     { emoji: "🚧", label: "Objection" },
  "casual":        { emoji: "💬", label: "Casual Chat" },
  "ready-to-buy":  { emoji: "🔥", label: "Ready to Buy" },
};

function formatTime(value: string): string {
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ContactDetailClient({ senderId, messages, insight: initialInsight, allInsights: initialAllInsights, stats }: Props) {
  const [insight, setInsight] = useState<Insight | null>(initialInsight);
  const [allInsights, setAllInsights] = useState<Insight[]>(initialAllInsights);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"messages" | "insights">("messages");

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/inbox/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Analysis failed");
      }
      const data = await res.json();
      const newInsight = data.insight as Insight;
      setInsight(newInsight);
      setAllInsights((prev) => [newInsight, ...prev.filter((i) => i.id !== newInsight.id)]);
      setActiveTab("insights");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sentimentInfo = insight ? (sentimentConfig[insight.sentiment] ?? sentimentConfig.neutral) : null;
  const intentInfo = insight ? (intentConfig[insight.intent] ?? { emoji: "💬", label: insight.intent }) : null;
  const initials = senderId.slice(0, 2).toUpperCase();

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/dashboard/contacts" style={{ color: "var(--silver-blue)", textDecoration: "none", fontSize: 13 }}>← Contacts</a>
          <div>
            <div className="page-title">{senderId}</div>
            <div className="page-sub">Contact profile & conversation history</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/dashboard/inbox" className="btn btn-gray btn-sm" style={{ textDecoration: "none" }}>💬 Open in Inbox</a>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleAnalyze()} disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "🧠 Analyze Conversation"}
          </button>
        </div>
      </div>

      <div className="content">
        {error && (
          <div style={{ background: "var(--danger-subtle)", border: "1px solid var(--danger-border)", borderRadius: "var(--r-sm)", padding: "10px 14px", color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="two-col" style={{ gridTemplateColumns: "280px 1fr", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ textAlign: "center", padding: "24px 20px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--purple-subtle)", border: "2px solid var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "var(--purple)", margin: "0 auto 12px" }}>
                {initials}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--near-black)", marginBottom: 4 }}>{senderId}</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
                {stats.platforms.map((p) => (
                  <span key={p} className="badge badge-neutral">{platformEmoji[p] ?? "💬"} {p}</span>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="card-title">Stats</div></div>
              <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Total Messages", value: stats.totalMessages },
                  { label: "Inbound", value: stats.inboundCount },
                  { label: "Outbound (Replies)", value: stats.outboundCount },
                  { label: "First Seen", value: formatDate(stats.firstSeen) },
                  { label: "Last Active", value: formatDate(stats.lastActive) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "var(--silver-blue)" }}>{label}</span>
                    <span style={{ fontWeight: 600, color: "var(--near-black)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {insight && (
              <div className="card">
                <div className="card-head">
                  <div className="card-title">🧠 Latest Insight</div>
                  <span style={{ fontSize: 11, color: "var(--silver-blue)" }}>{formatRelative(insight.analyzedAt)}</span>
                </div>
                <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, background: sentimentInfo?.bg, border: `1px solid ${sentimentInfo?.color}40`, fontSize: 13, fontWeight: 600, color: sentimentInfo?.color, width: "fit-content" }}>
                    {sentimentInfo?.emoji} {sentimentInfo?.label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--near-black)" }}>
                    <span style={{ color: "var(--silver-blue)" }}>Intent: </span>
                    <strong>{intentInfo?.emoji} {intentInfo?.label}</strong>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {insight.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "var(--purple-subtle)", color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--near-black)", fontStyle: "italic", lineHeight: 1.5, padding: "8px 10px", background: "var(--surface)", borderRadius: "var(--r-sm)", border: "1px solid var(--border-gray)" }}>
                    "{insight.summary}"
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-gray)", padding: "0 20px" }}>
              {(["messages", "insights"] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{ background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid var(--purple)" : "2px solid transparent", padding: "14px 16px 12px", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400, color: activeTab === tab ? "var(--purple)" : "var(--silver-blue)", cursor: "pointer", marginBottom: -1, transition: "all 0.15s" }}>
                  {tab === "messages" ? `💬 Messages (${messages.length})` : `🧠 Insight History (${allInsights.length})`}
                </button>
              ))}
            </div>

            {activeTab === "messages" && (
              <div style={{ padding: "0 20px 20px", maxHeight: 600, overflowY: "auto" }}>
                {messages.length === 0 ? (
                  <div style={{ padding: "24px 0", textAlign: "center", color: "var(--silver-blue)", fontSize: 13 }}>No messages found for this contact.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16 }}>
                    {messages.map((msg) => (
                      <div key={msg.id} style={{ display: "flex", flexDirection: msg.isOutbound ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: msg.isOutbound ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: msg.isOutbound ? "var(--purple)" : "var(--surface)", border: msg.isOutbound ? "none" : "1px solid var(--border-gray)", fontSize: 13, color: msg.isOutbound ? "#fff" : "var(--near-black)", lineHeight: 1.5 }}>
                          {msg.text ?? <span style={{ fontStyle: "italic", opacity: 0.7 }}>{msg.mediaUrl ? "📎 Media attachment" : "(no content)"}</span>}
                          <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65, textAlign: msg.isOutbound ? "right" : "left" }}>
                            {formatTime(msg.createdAt)}{msg.platform && ` · ${platformEmoji[msg.platform] ?? ""} ${msg.platform}`}
                          </div>
                          {msg.tags?.length > 0 && (
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                              {msg.tags.map((tag) => (
                                <span key={tag} style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: msg.isOutbound ? "rgba(255,255,255,0.2)" : "var(--purple-subtle)", color: msg.isOutbound ? "#fff" : "var(--purple)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "insights" && (
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, maxHeight: 600, overflowY: "auto" }}>
                {allInsights.length === 0 ? (
                  <div style={{ padding: "24px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🧠</div>
                    <div style={{ fontSize: 13, color: "var(--silver-blue)", marginBottom: 12 }}>No analysis run yet.</div>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleAnalyze()} disabled={isAnalyzing}>
                      {isAnalyzing ? "Analyzing..." : "Run First Analysis"}
                    </button>
                  </div>
                ) : (
                  allInsights.map((item, index) => {
                    const si = sentimentConfig[item.sentiment] ?? sentimentConfig.neutral;
                    const ii = intentConfig[item.intent] ?? { emoji: "💬", label: item.intent };
                    return (
                      <div key={item.id} style={{ padding: "14px 16px", border: "1px solid var(--border-gray)", borderRadius: "var(--r-sm)", background: index === 0 ? "var(--purple-subtle)" : "var(--surface)", borderColor: index === 0 ? "var(--purple)" : "var(--border-gray)", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 20, background: si.bg, border: `1px solid ${si.color}40`, fontSize: 12, fontWeight: 600, color: si.color }}>{si.emoji} {si.label}</span>
                            <span style={{ fontSize: 12, color: "var(--near-black)", fontWeight: 500 }}>{ii.emoji} {ii.label}</span>
                          </div>
                          <span style={{ fontSize: 11, color: "var(--silver-blue)" }}>{formatRelative(item.analyzedAt)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--near-black)", fontStyle: "italic" }}>"{item.summary}"</div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {item.tags.map((tag) => (
                            <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: "var(--purple-subtle)", color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
