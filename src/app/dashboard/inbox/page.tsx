"use client";

import { useEffect, useState } from "react";

interface InboxMessage {
  id: string;
  platform: string;
  senderId: string;
  text: string | null;
  mediaUrl: string | null;
  isRead: boolean;
  isOutbound: boolean;
  createdAt: string;
  tags?: string[];
}

interface ConversationInsight {
  id: string;
  sentiment: string;
  intent: string;
  tags: string[];
  summary: string;
  analyzedAt: string;
}

const ALL_PLATFORM_TABS = [
  { id: "all", label: "All" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube" },
  { id: "gmb", label: "GMB" },
];

const platformEmoji: Record<string, string> = {
  instagram: "📸",
  linkedin: "💼",
  youtube: "🎥",
  gmb: "📍",
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

function previewText(value: string | null): string {
  if (!value) return "(no text)";
  if (value.length <= 52) return value;
  return `${value.slice(0, 52)}...`;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelative(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [mode, setMode] = useState("dm");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuggestingReply, setIsSuggestingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState<ConversationInsight | null>(null);
  const [showInsightPanel, setShowInsightPanel] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("dashboardMode");
    if (savedMode === "social") {
      setMode("social");
    }
  }, []);

  useEffect(() => {
    setSelectedPlatform("all");
  }, [mode]);

  const PLATFORM_TABS =
    mode === "dm"
      ? [
          { id: "all", label: "All" },
          { id: "instagram", label: "Instagram" },
          { id: "whatsapp", label: "WhatsApp" },
        ]
      : ALL_PLATFORM_TABS;

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const query = selectedPlatform === "all" ? "" : `?platform=${encodeURIComponent(selectedPlatform)}`;
        const response = await fetch(`/api/inbox${query}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to load inbox");
        }

        const data: InboxMessage[] = await response.json();
        setMessages(data);

        if (selectedMessage) {
          const refreshed = data.find((message) => message.id === selectedMessage.id) ?? null;
          setSelectedMessage(refreshed);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inbox");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMessages();
  }, [selectedPlatform]);

  useEffect(() => {
    if (!selectedMessage) {
      setInsight(null);
      setShowInsightPanel(false);
      return;
    }
    const fetchInsight = async () => {
      try {
        const res = await fetch(`/api/inbox/analyze?senderId=${encodeURIComponent(selectedMessage.senderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setInsight(data[0] as ConversationInsight);
            setShowInsightPanel(true);
          } else {
            setInsight(null);
            setShowInsightPanel(false);
          }
        }
      } catch {
        // No insight yet
      }
    };
    void fetchInsight();
  }, [selectedMessage?.senderId]);

  const handleMessageClick = async (message: InboxMessage) => {
    setSelectedMessage(message);

    if (message.isRead) return;

    setMessages((prev) =>
      prev.map((entry) => (entry.id === message.id ? { ...entry, isRead: true } : entry))
    );
    setSelectedMessage((prev) => (prev && prev.id === message.id ? { ...prev, isRead: true } : prev));

    try {
      await fetch("/api/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id }),
      });
    } catch {
      // Keep optimistic UI state even if mark-as-read fails server-side.
    }
  };

  const handleAiReply = async () => {
    if (!selectedMessage) return;

    setIsSuggestingReply(true);
    setError(null);

    try {
      const response = await fetch("/api/inbox/ai-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: selectedMessage.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to get suggestion");
      }

      const data = await response.json();
      setReplyText(data.suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get suggestion");
    } finally {
      setIsSuggestingReply(false);
    }
  };

  const handleAnalyze = async (closeAfter = false) => {
    if (!selectedMessage) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/inbox/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: selectedMessage.senderId,
          messageId: selectedMessage.id,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Analysis failed");
      }
      const data = await res.json();
      setInsight(data.insight as ConversationInsight);
      setShowInsightPanel(true);
      if (closeAfter) {
        await fetch("/api/inbox", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: selectedMessage.id, markClosed: true }),
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedMessage.id ? { ...m, isRead: true } : m))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/inbox/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          text: replyText,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to send reply");
      }

      setReplyText("");
      setMessages((prev) =>
        prev.map((entry) => (entry.id === selectedMessage.id ? { ...entry, isRead: true } : entry))
      );
      setSelectedMessage((prev) => (prev ? { ...prev, isRead: true } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const sentimentInfo = insight ? (sentimentConfig[insight.sentiment] ?? sentimentConfig.neutral) : null;
  const intentInfo = insight ? (intentConfig[insight.intent] ?? { emoji: "💬", label: insight.intent }) : null;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Inbox</div>
          <div className="page-sub">Read and reply to incoming messages across platforms</div>
        </div>
      </div>

      <div className="content">
        <div style={{ display: "grid", gridTemplateColumns: showInsightPanel && selectedMessage ? "1fr 1.4fr 320px" : "1fr 1.4fr", gap: 16, alignItems: "start", transition: "grid-template-columns 0.3s ease" }}>
          <div className="card">
            <div className="card-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
              <div className="card-title">Conversations</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PLATFORM_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`badge ${selectedPlatform === tab.id ? "badge-purple" : "badge-neutral"}`}
                    style={{ border: "none", cursor: "pointer" }}
                    onClick={() => setSelectedPlatform(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div style={{ padding: "18px 20px", fontSize: 13, color: "var(--silver-blue)" }}>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div style={{ padding: "18px 20px", fontSize: 13, color: "var(--silver-blue)" }}>No messages found.</div>
            ) : (
              messages.map((message) => {
                const isSelected = selectedMessage?.id === message.id;
                return (
                  <button
                    key={message.id}
                    type="button"
                    className="wf-row"
                    onClick={() => void handleMessageClick(message)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: isSelected ? "var(--purple-subtle)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div className="wf-icon" style={{ background: "var(--surface)" }}>
                      {platformEmoji[message.platform] ?? "💬"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="wf-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{message.senderId}</span>
                        {!message.isRead && <span className="dot dot-green" style={{ marginRight: 0 }} />}
                        {message.tags?.slice(0, 1).map((tag) => (
                          <span key={tag} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "var(--purple-subtle)", color: "var(--purple)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="wf-meta">{previewText(message.text)}</div>
                    </div>
                    <div className="wf-meta" style={{ whiteSpace: "nowrap" }}>
                      {formatTime(message.createdAt)}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 520 }}>
            <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="card-title">Message Details</div>
              {selectedMessage && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn btn-outlined btn-sm" onClick={() => void handleAnalyze(false)} disabled={isAnalyzing}>
                    {isAnalyzing ? "Analyzing..." : "🧠 Analyze"}
                  </button>
                  <button type="button" className="btn btn-gray btn-sm" onClick={() => void handleAnalyze(true)} disabled={isAnalyzing}>
                    {isAnalyzing ? "..." : "✅ Close & Analyze"}
                  </button>
                </div>
              )}
            </div>

            {!selectedMessage ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--silver-blue)",
                  fontSize: 13,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                Select a message from the list to view details and reply.
              </div>
            ) : (
              <>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-gray)" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    <span className="badge badge-neutral">
                      {platformEmoji[selectedMessage.platform] ?? "💬"} {selectedMessage.platform}
                    </span>
                    <span className="badge badge-neutral">Sender: {selectedMessage.senderId}</span>
                    <span className="badge badge-neutral">{formatTime(selectedMessage.createdAt)}</span>
                    <a href={`/dashboard/contacts/${encodeURIComponent(selectedMessage.senderId)}`} className="badge badge-neutral" style={{ textDecoration: "none", cursor: "pointer" }}>
                      👤 View Profile →
                    </a>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--near-black)", marginBottom: 10 }}>
                    {selectedMessage.text ?? "(no text content)"}
                  </div>
                  {selectedMessage.mediaUrl && (
                    <a
                      href={selectedMessage.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-gray btn-sm"
                    >
                      Open media
                    </a>
                  )}
                </div>

                <div style={{ padding: "16px 20px", marginTop: "auto" }}>
                  {error && (
                    <div
                      style={{
                        background: "var(--danger-subtle)",
                        border: "1px solid var(--danger-border)",
                        borderRadius: "var(--r-sm)",
                        padding: "10px 12px",
                        color: "var(--danger)",
                        fontSize: 13,
                        marginBottom: 10,
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <label className="form-label">Reply</label>
                  <textarea
                    className="textarea"
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Write your reply..."
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <button
                      type="button"
                      className="btn btn-outlined btn-sm"
                      onClick={() => void handleAiReply()}
                      disabled={isSuggestingReply || !selectedMessage}
                    >
                      {isSuggestingReply ? "Thinking..." : "✨ AI Reply"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => void handleReplySubmit()}
                      disabled={isSending || !replyText.trim()}
                    >
                      {isSending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {showInsightPanel && selectedMessage && (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-gray)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🧠</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--near-black)" }}>AI Insights</span>
                </div>
                <button type="button" onClick={() => setShowInsightPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--silver-blue)", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>×</button>
              </div>
              {isAnalyzing ? (
                <div style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
                  <div style={{ fontSize: 13, color: "var(--silver-blue)" }}>Gemini is reading the conversation...</div>
                </div>
              ) : insight ? (
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--silver-blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Sentiment</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: sentimentInfo?.bg, border: `1px solid ${sentimentInfo?.color}40`, fontSize: 13, fontWeight: 600, color: sentimentInfo?.color }}>
                      <span>{sentimentInfo?.emoji}</span><span>{sentimentInfo?.label}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--silver-blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Intent</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border-gray)", fontSize: 13, fontWeight: 600, color: "var(--near-black)" }}>
                      <span>{intentInfo?.emoji}</span><span>{intentInfo?.label}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--silver-blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Auto Tags</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {insight.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "var(--purple-subtle)", color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--silver-blue)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Summary</div>
                    <div style={{ fontSize: 13, color: "var(--near-black)", lineHeight: 1.5, padding: "10px 12px", background: "var(--surface)", borderRadius: "var(--r-sm)", border: "1px solid var(--border-gray)", fontStyle: "italic" }}>"{insight.summary}"</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--silver-blue)", textAlign: "right" }}>Last analyzed {formatRelative(insight.analyzedAt)}</div>
                  <button type="button" className="btn btn-outlined btn-sm" onClick={() => void handleAnalyze(false)} disabled={isAnalyzing} style={{ width: "100%" }}>🔄 Re-analyze</button>
                  <a href={`/dashboard/contacts/${encodeURIComponent(selectedMessage.senderId)}`} className="btn btn-gray btn-sm" style={{ width: "100%", textAlign: "center", textDecoration: "none" }}>👤 View Contact Profile</a>
                </div>
              ) : (
                <div style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🧠</div>
                  <div style={{ fontSize: 13, color: "var(--silver-blue)", marginBottom: 12 }}>No analysis yet. Click "Analyze" to let Gemini extract sentiment, intent, and tags.</div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => void handleAnalyze(false)} disabled={isAnalyzing}>🧠 Analyze Now</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
