// src/lib/aiReply.ts
// Uses Google Gemini API (free tier) — get key at aistudio.google.com

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export async function getSuggestedReply(context: {
  platform: string;
  senderId: string;
  messages: { text: string; isOutbound: boolean }[];
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const messageThread = context.messages
    .map((msg) => `${msg.isOutbound ? "Business" : "Customer"}: ${msg.text}`)
    .join("\n");

  const prompt = [
    `You are a helpful social media assistant for a business on ${context.platform}.`,
    `Suggest a short, professional reply to the customer in 1-3 sentences only.`,
    `Return only the reply text — no explanation, no labels, no quotes.`,
    ``,
    `Conversation:`,
    messageThread,
    ``,
    `Suggest a reply:`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} — ${err}`);
  }

  const data = (await response.json()) as GeminiResponse;

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no content");
  }

  return text.trim();
}