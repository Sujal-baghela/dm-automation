import type {
  PlatformAdapter,
  NormalizedMessage,
  MessageContent,
  PostContent,
  PublishResult,
} from "./base"

export class LinkedInApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "LinkedInApiError"
    this.statusCode = statusCode
  }
}

const linkedInFetch = async (
  url: string,
  options: RequestInit,
  token: string
): Promise<any> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
    ...(options.headers as Record<string, string>),
  }
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const body = await response.text()
    throw new LinkedInApiError(
      `LinkedIn API error: ${response.status} — ${body}`,
      response.status
    )
  }
  return response.json()
}

export const LinkedInAdapter: PlatformAdapter = {
  normalizePayload(raw: any): NormalizedMessage {
    return {
      platform: "linkedin",
      externalId: raw.sender?.id ?? "",
      text: raw.message?.text,
      mediaUrl: raw.message?.content?.media?.url,
      timestamp: new Date(raw.createdAt),
      isOutbound: false,
    }
  },

  async sendMessage(
    externalId: string,
    content: MessageContent,
    _accountId: string,
    token: string
  ): Promise<void> {
    if (!content.text) throw new Error("LinkedIn requires text content")
    await linkedInFetch(
      "https://api.linkedin.com/v2/messages",
      {
        method: "POST",
        body: JSON.stringify({
          recipients: [{ person: `urn:li:person:${externalId}` }],
          body: content.text,
        }),
      },
      token
    )
  },

  getSessionExpiry(lastMessageAt: Date): Date {
    return new Date(lastMessageAt.getTime() + 7 * 24 * 60 * 60 * 1000)
  },

  async publishPost(
    accountId: string,
    token: string,
    content: PostContent
  ): Promise<PublishResult> {
    let assetUrn: string | undefined

    if (content.mediaUrls && content.mediaUrls.length > 0) {
      // Step 1 — Register upload
      const registerRes = await linkedInFetch(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
        {
          method: "POST",
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              owner: `urn:li:person:${accountId}`,
              serviceRelationships: [
                {
                  relationshipType: "OWNER",
                  identifier: "urn:li:userGeneratedContent",
                },
              ],
            },
          }),
        },
        token
      )

      const uploadUrl: string =
        registerRes.value?.uploadMechanism?.[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ]?.uploadUrl
      assetUrn = registerRes.value?.asset

      // Step 2 — Upload image bytes to LinkedIn
      const imageBlob = await fetch(content.mediaUrls[0]).then((r) => r.blob())
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: imageBlob,
      })
    }

    // Step 3 — Create the UGC post
    interface ShareContent {
      shareCommentary: { text: string }
      shareMediaCategory: string
      media?: Array<{ status: string; media: string }>
    }

    const shareContent: ShareContent = {
      shareCommentary: { text: content.caption },
      shareMediaCategory: assetUrn ? "IMAGE" : "NONE",
    }

    if (assetUrn) {
      shareContent.media = [{ status: "READY", media: assetUrn }]
    }

    const postRes = await linkedInFetch(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        method: "POST",
        body: JSON.stringify({
          author: `urn:li:person:${accountId}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": shareContent,
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        }),
      },
      token
    )

    return {
      externalId: postRes.id,
      url: `https://www.linkedin.com/feed/update/${postRes.id}`,
      platform: "linkedin",
    }
  },

  async deletePost(postId: string, token: string): Promise<void> {
    await linkedInFetch(
      `https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(postId)}`,
      { method: "DELETE" },
      token
    )
  },

  async getPostAnalytics(
    postId: string,
    token: string
  ): Promise<Record<string, number>> {
    const res = await linkedInFetch(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&shares[0]=${encodeURIComponent(postId)}`,
      { method: "GET" },
      token
    )
    const stats = res.elements?.[0]?.totalShareStatistics ?? {}
    return {
      impressions: stats.impressionCount ?? 0,
      clicks: stats.clickCount ?? 0,
      likes: stats.likeCount ?? 0,
      comments: stats.commentCount ?? 0,
      shares: stats.shareCount ?? 0,
    }
  },
}