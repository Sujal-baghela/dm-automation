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
    const clientId = process.env.META_APP_ID
    const redirectUri = process.env.META_REDIRECT_URI

    if (!clientId || !redirectUri) {
      return NextResponse.redirect(
        new URL(
          `/auth/error?msg=${encodeURIComponent("Missing OAuth configuration")}`,
          request.url
        )
      )
    }

    const authUrl = new URL("https://www.facebook.com/v20.0/dialog/oauth")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append(
      "scope",
      "instagram_basic,instagram_manage_messages,pages_show_list"
    )
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("state", crypto.randomUUID())

    return NextResponse.redirect(authUrl.toString())
  }

  try {
    const clientId = process.env.META_APP_ID
    const clientSecret = process.env.META_APP_SECRET
    const redirectUri = process.env.META_REDIRECT_URI

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.redirect(
        new URL("/auth/error?msg=Unauthorized", request.url)
      )
    }

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing OAuth configuration")
    }

    const tokenResponse = await fetch(
      "https://graph.facebook.com/v20.0/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        }).toString(),
      }
    )

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${errorText}`)
    }

    const tokenData: { access_token?: string } = await tokenResponse.json()
    const shortToken = tokenData.access_token

    if (!shortToken) {
      throw new Error("No access token in response")
    }

    const profileResponse = await fetch(
      `https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${encodeURIComponent(shortToken)}`
    )

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      throw new Error(`Profile fetch failed: ${errorText}`)
    }

    const profile: { id?: string } = await profileResponse.json()
    const externalId = profile.id

    if (!externalId) {
      throw new Error("No Instagram user ID in profile response")
    }

    const longTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(clientSecret)}&access_token=${encodeURIComponent(shortToken)}`
    )

    if (!longTokenResponse.ok) {
      const errorText = await longTokenResponse.text()
      throw new Error(`Long-lived token exchange failed: ${errorText}`)
    }

    const longTokenData: { access_token?: string; expires_in?: number } = await longTokenResponse.json()
    const longToken = longTokenData.access_token

    if (!longToken) {
      throw new Error("No long-lived access token in response")
    }

    
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)

    await prisma.account.upsert({
      where: {
        platform_externalId: {
          platform: "instagram",
          externalId,
        },
      },
      update: {
        userId,
        accessToken: longToken,
        expiresAt,
      },
      create: {
        userId,
        platform: "instagram",
        externalId,
        accessToken: longToken,
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
