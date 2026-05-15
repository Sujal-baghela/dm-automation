import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { topic, tone } = await req.json() as { topic: string; tone: string }

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const toneGuide: Record<string, string> = {
      casual: "friendly, conversational, use 1-2 emojis, feel like a real person talking",
      professional: "formal, authoritative, no emojis, thought leadership style",
      sales: "persuasive, urgency-driven, clear CTA at the end, benefit-focused",
    }

    const prompt = `Generate exactly 3 different social media captions about: "${topic}"
Tone: ${toneGuide[tone] ?? toneGuide.casual}

Rules:
- Each caption must be under 300 characters
- Each caption must be meaningfully different from the others
- Short (tweet-style), Medium (Instagram-style), Long (LinkedIn-style)
- Include relevant hashtags at the end of each
- Return ONLY a JSON array with exactly 3 strings, no other text, no markdown:
["caption 1 here","caption 2 here","caption 3 here"]`

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 })
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 600 },
        }),
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "AI request failed" }, { status: 500 })
    }

    const data = await res.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    const clean = raw.replace(/```json|```/g, "").trim()
    const captions = JSON.parse(clean) as string[]

    if (!Array.isArray(captions) || captions.length === 0) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 })
    }

    return NextResponse.json({ captions })
  } catch (err) {
    console.error("[ai/caption]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
