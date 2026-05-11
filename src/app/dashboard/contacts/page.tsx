// src/app/dashboard/contacts/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: { messages: { take: 1, orderBy: { sentAt: "desc" } } },
    take: 50,
  });

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Contacts</div>
          <div className="page-sub">{conversations.length} people have messaged your bot</div>
        </div>
      </div>
      <div className="content">
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input className="search-box" placeholder="Search by ID or platform…" />
          <button className="btn btn-gray btn-sm">Filter by platform</button>
        </div>
        <div className="table-wrap">
          <div className="table-head">
            <div className="th">Contact ID</div>
            <div className="th">Platform</div>
            <div className="th">Status</div>
            <div className="th">Last active</div>
            <div className="th">Messages</div>
          </div>
          {conversations.length === 0 ? (
            <div style={{ padding: "24px 20px", color: "var(--silver-blue)", fontSize: 13 }}>
              No contacts yet — they appear here when someone messages your bot.
            </div>
          ) : (
            conversations.map((c) => (
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
                  <span className={`badge ${c.status === "active" ? "badge-success" : "badge-neutral"}`}>
                    {c.status}
                  </span>
                </div>
                <div className="td" style={{ color: "var(--silver-blue)" }}>
                  {new Date(c.lastMessageAt).toLocaleString()}
                </div>
                <div className="td">{c.messages.length > 0 ? c.messages[0].content.slice(0, 30) + "…" : "—"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}