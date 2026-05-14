import type {
  PlatformAdapter,
  NormalizedMessage,
  MessageContent,
  PostContent,
  PublishResult,
} from "./base";

export class InstagramApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "InstagramApiError";
    this.statusCode = statusCode;
  }
}

const instagramFetch = async (
  url: string,
  options: RequestInit,
  token?: string,
): Promise<any> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const body = await response.text();
    throw new InstagramApiError(
      `Instagram API error: ${response.status} — ${body}`,
      response.status,
    );
  }
  return response.json();
};

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

  async sendMessage(
    externalId: string,
    content: MessageContent,
    accountId: string,
    token: string,
  ) {
    const res = await fetch("https://graph.facebook.com/v20.0/me/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipient: { id: externalId },
        message: content.text
          ? { text: content.text }
          : {
              attachment: {
                type: "image",
                payload: { url: content.mediaUrl },
              },
            },
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(
        `IG API ${res.status}: ${err.error?.message ?? "Unknown"}`,
      );
    }
  },

  getSessionExpiry(lastMessageAt: Date): Date {
    return new Date(lastMessageAt.getTime() + 24 * 60 * 60 * 1000);
  },

  async publishPost(
    accountId: string,
    token: string,
    content: PostContent,
  ): Promise<PublishResult> {
    if (!content.mediaUrls || content.mediaUrls.length === 0) {
      throw new Error("Instagram publishPost requires a mediaUrl");
    }

    const createRes = await instagramFetch(
      `https://graph.facebook.com/v20.0/${accountId}/media`,
      {
        method: "POST",
        body: JSON.stringify({
          image_url: content.mediaUrls[0],
          caption: content.caption,
          access_token: token,
        }),
      },
      token,
    );

    const creationId: string | undefined =
      createRes.id || createRes.creation_id || createRes.media_id;

    if (!creationId) {
      throw new InstagramApiError(
        "No creation id returned from Instagram",
        500,
      );
    }

    const publishRes = await instagramFetch(
      `https://graph.facebook.com/v20.0/${accountId}/media_publish`,
      {
        method: "POST",
        body: JSON.stringify({
          creation_id: creationId,
          access_token: token,
        }),
      },
      token,
    );

    const mediaId: string | undefined = publishRes.id;
    if (!mediaId) {
      throw new InstagramApiError(
        "No media id returned from Instagram publish",
        500,
      );
    }

    return {
      externalId: mediaId,
      url: `https://www.instagram.com/p/${mediaId}`,
      platform: "instagram",
    };
  },

  async deletePost(postId: string, token: string): Promise<void> {
    await instagramFetch(
      `https://graph.facebook.com/v20.0/${postId}`,
      { method: "DELETE" },
      token,
    );
  },

  async getPostAnalytics(
    postId: string,
    token: string,
  ): Promise<Record<string, number>> {
    const res = await instagramFetch(
      `https://graph.facebook.com/v20.0/${postId}?fields=like_count,comments_count`,
      { method: "GET" },
      token,
    );
    return {
      likes: Number(res.like_count ?? 0),
      comments: Number(res.comments_count ?? 0),
    };
  },
};