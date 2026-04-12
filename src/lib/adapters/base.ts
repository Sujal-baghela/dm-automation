export interface NormalizedMessage {
  platform: "instagram" | "whatsapp";
  externalId: string;
  text?: string;
  mediaUrl?: string;
  timestamp: Date;
  isOutbound?: boolean;
}
export interface MessageContent {
  text?: string;
  mediaUrl?: string;
  templateName?: string;
}
export interface PlatformAdapter {
  normalizePayload(raw: any): NormalizedMessage;
  sendMessage(externalId: string, content: MessageContent, accountId: string, token: string): Promise<void>;
  getSessionExpiry(lastMessageAt: Date): Date;
}
