import type {
  PlatformAdapter,
  NormalizedMessage,
  MessageContent,
  PostContent,
  PublishResult,
} from "./base"

export class YouTubeApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "YouTubeApiError"
    this.statusCode = statusCode
  }
}

const youtubeFetch = async (
  url: string,
  options: RequestInit,
  token: string
): Promise<any> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const body = await response.text()
    throw new YouTubeApiError(
      `YouTube API error: ${response.status} — ${body}`,
      response.status
    )
  }
  return response.json()
}

export const YouTubeAdapter: PlatformAdapter = {
  normalizePayload(raw: any): NormalizedMessage {
    return {
      platform: "youtube",
      externalId: raw.authorDetails?.channelId ?? "",
      text: raw.snippet?.displayMessage ?? raw.snippet?.textOriginal,
      timestamp: new Date(raw.snippet?.publishedAt ?? Date.now()),
      isOutbound: false,
    }
  },

  async sendMessage(
    externalId: string,  // parent comment ID or video ID
    content: MessageContent,
    _accountId: string,
    token: string
  ): Promise<void> {
    if (!content.text) throw new Error("YouTube requires text content")
    await youtubeFetch(
      "https://www.googleapis.com/youtube/v3/comments?part=snippet",
      {
        method: "POST",
        body: JSON.stringify({
          snippet: {
            parentId: externalId,
            textOriginal: content.text,
          },
        }),
      },
      token
    )
  },

  getSessionExpiry(lastMessageAt: Date): Date {
    // Google OAuth tokens last 1 hour
    return new Date(lastMessageAt.getTime() + 60 * 60 * 1000)
  },

  async publishPost(
    accountId: string,
    token: string,
    content: PostContent
  ): Promise<PublishResult> {
    // Step 1 — Initiate resumable upload, get Location header BEFORE .json()
    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": "video/*",
        },
        body: JSON.stringify({
          snippet: {
            title: content.caption,
            description: content.caption,
            tags: content.tags ?? [],
            channelId: accountId,
          },
          status: {
            privacyStatus: "public",
          },
        }),
      }
    )

    if (!initRes.ok) {
      const body = await initRes.text()
      throw new YouTubeApiError(
        `YouTube upload init failed: ${initRes.status} — ${body}`,
        initRes.status
      )
    }

    // Get Location header BEFORE consuming body
    const uploadUrl = initRes.headers.get("Location")
    if (!uploadUrl) throw new YouTubeApiError("No upload URL returned", 500)

    // Step 2 — Upload video bytes; response contains the video object directly
    if (!content.mediaUrls?.[0]) {
      throw new YouTubeApiError("YouTube publishPost requires a video URL", 400)
    }

    const videoBlob = await fetch(content.mediaUrls[0]).then((r) => r.blob())
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: videoBlob,
    })

    if (!uploadRes.ok) {
      const body = await uploadRes.text()
      throw new YouTubeApiError(
        `YouTube video upload failed: ${uploadRes.status} — ${body}`,
        uploadRes.status
      )
    }

    // The PUT response IS the video resource — no third API call needed
    const video = await uploadRes.json()
    const videoId: string = video.id

    return {
      externalId: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      platform: "youtube",
    }
  },

  async deletePost(postId: string, token: string): Promise<void> {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(postId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    if (!response.ok) {
      const body = await response.text()
      throw new YouTubeApiError(
        `YouTube delete failed: ${response.status} — ${body}`,
        response.status
      )
    }
  },

  async getPostAnalytics(
    postId: string,
    token: string
  ): Promise<Record<string, number>> {
    const res = await youtubeFetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${encodeURIComponent(postId)}`,
      { method: "GET" },
      token
    )
    // YouTube wraps everything in items[] — Bug 4 fix
    const stats = res.items?.[0]?.statistics ?? {}
    return {
      views: parseInt(stats.viewCount ?? "0", 10),
      likes: parseInt(stats.likeCount ?? "0", 10),
      comments: parseInt(stats.commentCount ?? "0", 10),
      favorites: parseInt(stats.favoriteCount ?? "0", 10),
    }
  },
}