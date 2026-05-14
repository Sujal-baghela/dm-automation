import { WebhookEvent } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const svix_id = headersList.get("svix-id")
  const svix_timestamp = headersList.get("svix-timestamp")
  const svix_signature = headersList.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 })
  }

  let event: WebhookEvent
  try {
    const { Webhook } = await import("svix")
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET ?? "")
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = event.data
    const email = email_addresses[0]?.email_address

    if (email) {
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          id,
          email,
          name: [first_name, last_name].filter(Boolean).join(" ") || null,
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}