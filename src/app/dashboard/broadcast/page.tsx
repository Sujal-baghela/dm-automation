// src/app/dashboard/broadcast/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const [conversations, recentMessages] = await Promise.all([
    prisma.conversation.findMany({
      orderBy: { lastMessageAt: "desc" },
    }),
    prisma.message.findMany({
      orderBy: { sentAt: "desc" },
      take: 10,
      include: { conversation: true },
    }),
  ]);

  const igContacts = conversations.filter((c) => c.platform === "instagram");
  const waContacts = conversations.filter((c) => c.platform === "whatsapp");

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Broadcast</div>
          <div className="page-sub">
            Send a message to all your contacts at once
          </div>
        </div>
      </div>

      <div className="content">
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
          {/* LEFT — compose */}
          <div>
            <div className="broadcast-card">
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Send via platform</label>
                <div className="platform-pills">
                  <span
                    className="plat-pill sel-ig"
                    style={{ cursor: "default" }}
                  >
                    📸 Instagram ({igContacts.length} contacts)
                  </span>
                  <span
                    className="plat-pill"
                    style={{
                      cursor: "default",
                      opacity: waContacts.length === 0 ? 0.4 : 1,
                    }}
                  >
                    💬 WhatsApp ({waContacts.length} contacts)
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Send to</label>
                <select
                  className="form-input"
                  style={{
                    cursor: "pointer",
                    borderRadius: "var(--r)",
                    fontFamily: "inherit",
                    fontSize: 14,
                  }}
                >
                  <option>
                    All contacts ({conversations.length} people)
                  </option>
                  <option>Instagram only ({igContacts.length} people)</option>
                  <option>WhatsApp only ({waContacts.length} people)</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Your message</label>
                <textarea
                  className="textarea"
                  placeholder="Write your message here… Keep it short and personal. Example: Hey! We just dropped something new 👀 Reply YES if you want the details"
                  defaultValue=""
                />
                <div className="char-count">0 / 1000</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">When to send</label>
                <div className="platform-pills">
                  <span
                    className="plat-pill sel-ig"
                    style={{
                      background: "var(--purple-subtle)",
                      borderColor: "var(--purple)",
                      color: "var(--purple)",
                      cursor: "default",
                    }}
                  >
                    Send now
                  </span>
                  <span className="plat-pill" style={{ cursor: "default" }}>
                    Schedule for later
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "var(--warn-subtle)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: "var(--r-sm)",
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "var(--warn)",
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}
              >
                ⚠️ WhatsApp only allows broadcasts to contacts who messaged
                within the last 24 hours, unless using approved Message
                Templates. Instagram has no such restriction.
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-outlined"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Preview
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: "center" }}
                  disabled={conversations.length === 0}
                >
                  📣 Send to {conversations.length} contacts
                </button>
              </div>
            </div>

            {/* TIPS */}
            <div className="card" style={{ padding: "18px 20px" }}>
              <div className="card-title" style={{ marginBottom: 12 }}>
                Tips for high reply rates
              </div>
              {[
                "Send between 10am–12pm or 6pm–8pm in your audience's timezone",
                "Keep messages under 160 characters — shorter gets more replies",
                "Always include a clear call to action like 'Reply YES' or 'Click below'",
                "Personalise with their name if you have it stored as a tag",
                "Don't broadcast more than once every 3 days to the same contacts",
              ].map((tip, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "7px 0",
                    borderBottom:
                      i < 4 ? "1px solid var(--border-gray)" : "none",
                    fontSize: 13,
                    color: "var(--cool-gray)",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — recent messages + contacts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card">
              <div className="card-head">
                <div className="card-title">Contact breakdown</div>
              </div>
              <div style={{ padding: "14px 20px" }}>
                {[
                  {
                    label: "Instagram",
                    count: igContacts.length,
                    total: conversations.length,
                    color: "#e1306c",
                  },
                  {
                    label: "WhatsApp",
                    count: waContacts.length,
                    total: conversations.length,
                    color: "#25d366",
                  },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "var(--cool-gray)",
                        marginBottom: 5,
                      }}
                    >
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 600 }}>
                        {item.count} / {item.total}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "var(--surface)",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${
                            item.total > 0
                              ? Math.round((item.count / item.total) * 100)
                              : 0
                          }%`,
                          background: item.color,
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--silver-blue)",
                      textAlign: "center",
                      padding: "12px 0",
                    }}
                  >
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
                <div
                  style={{
                    padding: "20px",
                    fontSize: 13,
                    color: "var(--silver-blue)",
                  }}
                >
                  No messages yet.
                </div>
              ) : (
                recentMessages.map((msg) => (
                  <div className="act-row" key={msg.id}>
                    <div
                      className="act-dot"
                      style={{
                        background:
                          msg.direction === "outbound"
                            ? "var(--purple)"
                            : "var(--green)",
                      }}
                    />
                    <div>
                      <div className="act-text">
                        <span
                          className={`badge ${
                            msg.direction === "outbound"
                              ? "badge-purple"
                              : "badge-success"
                          }`}
                          style={{ marginRight: 6, fontSize: 10 }}
                        >
                          {msg.direction}
                        </span>
                        {msg.content.slice(0, 50)}
                        {msg.content.length > 50 ? "…" : ""}
                      </div>
                      <div className="act-time">
                        {msg.conversation.platform} ·{" "}
                        {new Date(msg.sentAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}