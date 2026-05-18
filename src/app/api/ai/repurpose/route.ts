import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { caption } = (await req.json()) as { caption?: string };
  if (!caption?.trim()) {
    return NextResponse.json({ error: "Caption is required" }, { status: 400 });
  }

  const prompt = `You are a social media expert. Rewrite this caption for 3 different platforms. Return ONLY a valid JSON object, no markdown, no backticks.

ORIGINAL CAPTION:
${caption}

Return exactly this JSON shape:
{
  "instagram": "rewritten caption with emojis and hashtags, casual and visual, max 150 words",
  "linkedin": "rewritten caption professional tone, insight-driven, no hashtag spam, max 100 words",
  "twitter": "rewritten caption punchy and concise, under 280 characters, one strong hook"
}

Rules:
- Keep the core message and intent intact
- Each version should feel native to that platform
- Instagram: emojis, line breaks, 3-5 hashtags at end
- LinkedIn: no fluff, add a thought-leadership angle, 1-2 hashtags max
- Twitter: short, punchy, conversational, can use 1-2 hashtags inline`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      instagram: string;
      linkedin: string;
      twitter: string;
    };

    return NextResponse.json({
      repurposed: {
        instagram: parsed.instagram ?? "",
        linkedin: parsed.linkedin ?? "",
        twitter: parsed.twitter ?? "",
      },
    });
  } catch (err) {
    console.error("Repurpose error:", err);
    return NextResponse.json({ error: "AI repurposing failed. Check GEMINI_API_KEY." }, { status: 500 });
  }
}
