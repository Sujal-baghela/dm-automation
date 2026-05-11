import type {
  PlatformAdapter,
  NormalizedMessage,
  MessageContent,
  PostContent,
  PublishResult,
} from "./base"

export class GMBApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "GMBApiError"
    this.statusCode = statusCode
  }
}

const gmbFetch = async (
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
    throw new GMBApiError(
      `GMB API error: ${response.status} — ${body}`,
      response.status
    )
  }
  return response.json()
}

export const GMBAdapter: PlatformAdapter = {
  normalizePayload(raw: any): NormalizedMessage {
    return {
      platform: "gmb",
      externalId: raw.name ?? "",
      text: raw.summary,
      timestamp: new Date(raw.createTime),
      isOutbound: false,
    }
  },

  async sendMessage(
    externalId: string,
    content: MessageContent,
    accountId: string,
    token: string
  ): Promise<void> {
    if (!content.text) throw new Error("GMB requires text content")
    const locationName = accountId
    await gmbFetch(
      `https://mybusiness.googleapis.com/v4/${locationName}/reviews/${externalId}/reply`,
      {
        method: "PUT",
        body: JSON.stringify({
          comment: content.text,
        }),
      },
      token
    )
  },

  getSessionExpiry(lastMessageAt: Date): Date {
    return new Date(lastMessageAt.getTime() + 60 * 60 * 1000)
  },

  async publishPost(
    accountId: string,
    token: string,
    content: PostContent
  ): Promise<PublishResult> {
    const locationName = accountId
    const postRes = await gmbFetch(
      `https://mybusiness.googleapis.com/v4/${locationName}/localPosts`,
      {
        method: "POST",
        body: JSON.stringify({
          languageCode: "en",
          summary: content.caption,
          topicType: "STANDARD",
        }),
      },
      token
    )

    return {
      externalId: postRes.name.split("/").pop(),
      url: "https://business.google.com/",
      platform: "gmb",
    }
  },

  async deletePost(postId: string, token: string): Promise<void> {
    await gmbFetch(
      `https://mybusiness.googleapis.com/v4/${postId}`,
      { method: "DELETE" },
      token
    )
  },

  async getPostAnalytics(
    postId: string,
    token: string
  ): Promise<Record<string, number>> {
    const res = await gmbFetch(
      `https://businessprofileperformance.googleapis.com/v1/${postId}:fetchMultiDailyMetricsTimeSeries?dailyMetrics=LOCAL_POST_VIEWS_BY_MEDIA_TYPE`,
      { method: "GET" },
      token
    )
    const metrics =
      res.multiDailyMetricTimeSeries?.[0]?.dailyMetricTimeSeries?.[0]?.values ?? []
    const total = metrics.reduce(
      (sum: number, v: any) => sum + (v.value ?? 0),
      0
    )
    return { views: total, clicks: 0 }
  },
}
