import crypto from "crypto";
import "dotenv/config";

// ── Config ────────────────────────────────────────────────────────────────────
const PLATFORM = (process.argv[2] ?? "instagram") as "instagram" | "whatsapp";
const BASE_URL  = process.env.TEST_WEBHOOK_URL ?? "http://localhost:3000";

// ── Payloads ──────────────────────────────────────────────────────────────────
// Replace accountId / phone_number_id with what you have in DB (PlatformConnection.accountId)
const ACCOUNT_ID = "YOUR_ACCOUNT_ID"; // ← change this

const payloads: Record<string, unknown> = {
  instagram: {
    object: "instagram",
    entry: [
      {
        id: ACCOUNT_ID,
        messaging: [
          {
            sender:    { id: "FAKE_USER_123" },
            recipient: { id: ACCOUNT_ID },
            timestamp: Date.now(),
            message:   { mid: "mid.test123", text: "hello" },
          },
        ],
      },
    ],
  },

  whatsapp: {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WABA_ID",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: { phone_number_id: ACCOUNT_ID },
              contacts: [{ profile: { name: "Test User" }, wa_id: "911234567890" }],
              messages: [
                {
                  from:      "911234567890",
                  id:        "wamid.test123",
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type:      "text",
                  text:      { body: "hello" },
                },
              ],
            },
          },
        ],
      },
    ],
  },
};

// ── Send ──────────────────────────────────────────────────────────────────────
async function run() {
  const secret =
    PLATFORM === "instagram"
      ? process.env.IG_WEBHOOK_SECRET!
      : process.env.WA_WEBHOOK_SECRET!;

  const url = `${BASE_URL}/api/webhook/${PLATFORM}`;
  const body = JSON.stringify(payloads[PLATFORM]);

  const sig =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(body).digest("hex");

  console.log(`\n→ POST ${url}`);
  console.log(`  Signature: ${sig}\n`);

  const res = await fetch(url, {
    method:  "POST",
    headers: {
      "Content-Type":         "application/json",
      "x-hub-signature-256":  sig,
    },
    body,
  });

  const text = await res.text();
  console.log(`← ${res.status}`, text);
}

run().catch((e) => { console.error(e); process.exit(1); });