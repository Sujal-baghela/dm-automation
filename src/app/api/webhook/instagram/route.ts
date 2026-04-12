import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dmQueue } from "@/lib/queue";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (token === process.env.IG_VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const sigHash = signature.split("=")[1];
    const expectedHash = crypto
      .createHmac("sha256", process.env.IG_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    const sigBuffer = Buffer.from(sigHash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const body = JSON.parse(rawBody);

    for (const entry of body.entry || []) {
      const conn = await prisma.platformConnection.findUnique({
        where: { accountId: entry.id },
        select: { accountId: true },
      });
      if (!conn) continue;

      for (const msg of entry.messaging || []) {
        await dmQueue.add(
          "dm-event",
          {
            platform: "instagram" as const,
            accountId: conn.accountId,
            rawPayload: msg,
          },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
          }
        );
      }
    }

    return NextResponse.json({ status: "queued" });
  } catch (err) {
    console.error("IG Webhook Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}