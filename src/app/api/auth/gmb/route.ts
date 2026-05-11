import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // Handle OAuth callback errors
  if (error) {
    const errorDescription = searchParams.get("error_description") || error
    return NextResponse.redirect(
      new URL(`/auth/error?msg=${encodeURIComponent(errorDescription)}`, request.url)
    )
  }

  // Step 1: Start OAuth flow if no code
  if (!code) {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI
    const scope = "https://www.googleapis.com/auth/business.manage"

    if (!clientId || !redirectUri) {
      return NextResponse.redirect(
        new URL(
          `/auth/error?msg=${encodeURIComponent("Missing OAuth configuration")}`,
          request.url
        )
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

  // Step 2: Exchange code for access token
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    const { userId } = await auth()
    if (!userId) {
       return NextResponse.redirect(
    new URL("/auth/error?msg=Unauthorized", request.url)
      )
  }

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing OAuth configuration")
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const tokenData: { access_token?: string; expires_in?: number; refresh_token?: string } = await tokenResponse.json()
    const { access_token, expires_in, refresh_token } = tokenData

    if (!access_token) {
      throw new Error("No access token in response")
    }

    // Step 3: Fetch GMB accounts
    const accountsResponse = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!accountsResponse.ok) {
      const error = await accountsResponse.text()
      throw new Error(`Accounts fetch failed: ${error}`)
    }

    const accountsData: { accounts?: Array<{ name?: string }> } = await accountsResponse.json()
    const accountName = accountsData.accounts?.[0]?.name

    if (!accountName) {
      throw new Error("No GMB account found")
    }

    // Step 4: Upsert account to Prisma
    const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000)

    await prisma.account.upsert({
      where: {
        platform_externalId: {
          platform: "gmb",
          externalId: accountName,
        },
      },
      update: {
        userId,
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt,
      },
      create: {
        userId, 
        platform: "gmb",
        externalId: accountName,
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt,
      },
    })

    // Step 5: Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard/accounts", request.url))
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Authentication failed"
    return NextResponse.redirect(
      new URL(`/auth/error?msg=${encodeURIComponent(message)}`, request.url)
    )
  }
}
