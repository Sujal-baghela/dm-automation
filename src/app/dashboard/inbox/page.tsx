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

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Inbox</div>
          <div className="page-sub">Read and reply to incoming messages across platforms</div>
        </div>
      </div>

      <div className="content">
        <div className="two-col" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
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
            <div className="card-head">
              <div className="card-title">Message Details</div>
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
        </div>
      </div>
    </>
  );
}
