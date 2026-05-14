import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    const errorDescription = searchParams.get("error_description") || error
    return NextResponse.redirect(
      new URL(`/auth/error?msg=${encodeURIComponent(errorDescription)}`, request.url)
    )
  }

  if (!code) {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI
    const scope = "https://www.googleapis.com/auth/youtube"

    if (!clientId || !redirectUri) {
      return NextResponse.redirect(
        new URL(`/auth/error?msg=${encodeURIComponent("Missing OAuth configuration")}`, request.url)
      )
    }

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("scope", scope)
    authUrl.searchParams.append("access_type", "offline")
    authUrl.searchParams.append("prompt", "consent")
    authUrl.searchParams.append("state", crypto.randomUUID())

    return NextResponse.redirect(authUrl.toString())
  }

  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.redirect(
        new URL(`/auth/error?msg=${encodeURIComponent("Not logged in")}`, request.url)
      )
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing OAuth configuration")
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${err}`)
    }

    const tokenData = await tokenResponse.json()
    const { access_token, expires_in, refresh_token } = tokenData

    if (!access_token) throw new Error("No access token in response")

    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!channelResponse.ok) {
      const err = await channelResponse.text()
      throw new Error(`Channel fetch failed: ${err}`)
    }

    const channelData = await channelResponse.json()
    const channelId = channelData.items?.[0]?.id

    if (!channelId) throw new Error("No YouTube channel found")

    const expiresAt = new Date(Date.now() + expires_in * 1000)

    await prisma.account.upsert({
      where: {
        platform_externalId: {
          platform: "youtube",
          externalId: channelId,
        },
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt,
      },
      create: {
        userId,
        platform: "youtube",
        externalId: channelId,
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt,
      },
    })

    return NextResponse.redirect(new URL("/dashboard/accounts", request.url))
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed"
    return NextResponse.redirect(
      new URL(`/auth/error?msg=${encodeURIComponent(message)}`, request.url)
    )
  }
}