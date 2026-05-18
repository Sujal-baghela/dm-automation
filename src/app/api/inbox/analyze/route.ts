import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findFirst({ where: { id: clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { senderId, messageId } = body as { senderId?: string; messageId?: string };
  if (!senderId) return NextResponse.json({ error: "senderId is required" }, { status: 400 });

  const messages = await prisma.inboxMessage.findMany({
    where: { userId: user.id, senderId },
    orderBy: { createdAt: "asc" },
  });
  if (messages.length === 0) return NextResponse.json({ error: "No messages found for this contact" }, { status: 404 });

  const transcript = messages
    .map((m) => `${m.isOutbound ? "You" : "Contact"}: ${m.text ?? "[media message]"}`)
    .join("\n");

  const prompt = `You are a CRM conversation analyst. Analyze this DM conversation and return ONLY a valid JSON object with no markdown, no explanation, no backticks.

CONVERSATION:
${transcript}

Return this exact JSON shape:
{
  "sentiment": "positive" | "neutral" | "negative",
  "intent": "interested" | "price-inquiry" | "support" | "objection" | "casual" | "ready-to-buy",
  "tags": ["tag1", "tag2"],
  "summary": "one sentence summary of this conversation"
}

Rules:
- sentiment: overall tone of the contact (not your replies)
- intent: the contact's primary goal in this conversation
- tags: 2-4 short descriptive tags from this list only: high-intent, warm-lead, cold-lead, asked-price, needs-followup, objection-raised, support-issue, already-bought, vip-candidate, price-sensitive, very-engaged, quick-reply
- summary: max 15 words, plain English, no jargon`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as { sentiment: string; intent: string; tags: string[]; summary: string };

    const validSentiments = ["positive", "neutral", "negative"];
    const validIntents = ["interested", "price-inquiry", "support", "objection", "casual", "ready-to-buy"];
    const sentiment = validSentiments.includes(parsed.sentiment) ? parsed.sentiment : "neutral";
    const intent = validIntents.includes(parsed.intent) ? parsed.intent : "casual";
    const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : [];
    const summary = typeof parsed.summary === "string" ? parsed.summary : "Conversation analyzed.";

    const existingInsight = await prisma.conversationInsight.findFirst({ where: { userId: user.id, senderId } });
    let insight;
    if (existingInsight) {
      insight = await prisma.conversationInsight.update({
        where: { id: existingInsight.id },
        data: { sentiment, intent, tags, summary, analyzedAt: new Date(), messageId: messageId ?? null },
      });
    } else {
      insight = await prisma.conversationInsight.create({
        data: { userId: user.id, senderId, sentiment, intent, tags, summary, messageId: messageId ?? null },
      });
    }

    if (messageId) {
      await prisma.inboxMessage.update({ where: { id: messageId }, data: { tags } });
    }

    return NextResponse.json({ insight });
  } catch (err) {
    console.error("Gemini analyze error:", err);
    return NextResponse.json({ error: "AI analysis failed. Check GEMINI_API_KEY." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findFirst({ where: { id: clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const senderId = searchParams.get("senderId");
  const where = senderId ? { userId: user.id, senderId } : { userId: user.id };
  const insights = await prisma.conversationInsight.findMany({ where, orderBy: { analyzedAt: "desc" } });

  return NextResponse.json(insights);
}
