import type { PlatformAdapter, NormalizedMessage, MessageContent } from "./base";
export const WhatsAppAdapter: PlatformAdapter = {
  normalizePayload(payload: any): NormalizedMessage {
    const msg = payload.messages?.[0] || {};
    return {
      platform: "whatsapp",
      externalId: payload.contacts?.[0]?.wa_id || msg.from || "",
      text: msg.text?.body || "",
      mediaUrl: msg.image?.caption || "",
      timestamp: new Date(msg.timestamp * 1000),
      isOutbound: false,
    };
  },
  async sendMessage(externalId: string, content: MessageContent, accountId: string, token: string) {
    const url = `https://graph.facebook.com/v20.0/${accountId}/messages`;
    const body: any = { messaging_product: "whatsapp", to: externalId };
    if (content.templateName) {
      body.type = "template";
      body.template = { name: content.templateName, language: { code: "en" } };
    } else if (content.text) {
      body.type = "text";
      body.text = { body: content.text };
    } else {
      throw new Error("WA requires text or templateName");
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`WA API ${res.status}: ${err.error?.message || "Unknown"}`);
    }
  },
  getSessionExpiry(lastMessageAt: Date): Date {
    return new Date(lastMessageAt.getTime() + 24 * 60 * 60 * 1000);
  },
};
