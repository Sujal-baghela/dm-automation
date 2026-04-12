import type { PlatformAdapter, NormalizedMessage, MessageContent } from "./base";
export const InstagramAdapter: PlatformAdapter = {
  normalizePayload(payload: any): NormalizedMessage {
    const msg = payload.message || {};
    return {
      platform: "instagram",
      externalId: payload.sender?.id || "",
      text: msg.text || msg.caption || "",
      mediaUrl: msg.attachments?.[0]?.payload?.url,
      timestamp: new Date(payload.timestamp),
      isOutbound: false,
    };
  },
  async sendMessage(externalId: string, content: MessageContent, accountId: string, token: string) {
    const res = await fetch("https://graph.facebook.com/v20.0/me/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        recipient: { id: externalId },
        message: content.text ? { text: content.text } : { attachment: { type: "image", payload: { url: content.mediaUrl } } },
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`IG API ${res.status}: ${err.error?.message || "Unknown"}`);
    }
  },
  getSessionExpiry(lastMessageAt: Date): Date {
    return new Date(lastMessageAt.getTime() + 24 * 60 * 60 * 1000);
  },
};
