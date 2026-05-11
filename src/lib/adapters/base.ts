export interface NormalizedMessage {
  platform: "instagram" | "whatsapp" | "linkedin" | "youtube" | "gmb";
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

export interface PostContent {
  caption: string;
  mediaUrls?: string[];
  tags?: string[];
}

export interface PublishResult {
  externalId: string;
  url: string;
  platform: string;
}

export interface PlatformAdapter {
  normalizePayload(raw: any): NormalizedMessage;
  sendMessage(externalId: string, content: MessageContent, accountId: string, token: string): Promise<void>;
  getSessionExpiry(lastMessageAt: Date): Date;
  publishPost(accountId: string, token: string, content: PostContent): Promise<PublishResult>;
  deletePost(postId: string, token: string): Promise<void>;
  getPostAnalytics(postId: string, token: string): Promise<Record<string, number>>;
}