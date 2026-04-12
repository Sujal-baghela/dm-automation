import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Upsert User
  const user = await prisma.user.upsert({
    where: { email: "test@yourdomain.com" },
    update: {},
    create: {
      email: "test@yourdomain.com",
      name: "Test User",
    },
  });
  console.log("✅ User:", user.id);

  // 2. Upsert PlatformConnection — upsert on accountId (unique field)
  const conn = await prisma.platformConnection.upsert({
    where: { accountId: "YOUR_IG_ACCOUNT_ID" },
    update: {},
    create: {
      userId: user.id,
      platform: "instagram",
      accountId: "YOUR_IG_ACCOUNT_ID",
      accessToken: "YOUR_IG_ACCESS_TOKEN",
    },
  });
  console.log("✅ PlatformConnection:", conn.id);

  // 3. Upsert Workflow — upsert on fixed id
  const workflow = await prisma.workflow.upsert({
    where: { id: "seed-workflow" },
    update: {},
    create: {
      id: "seed-workflow",
      userId: user.id,
      name: "Price Inquiry Reply",
      isActive: true,
      platforms: ["instagram"],
      nodes: {
        reply: "Thanks for your message! Our price is ₹999.",
      },
      triggers: {
        create: [
          { type: "keyword", pattern: "price", platform: "instagram" },
          { type: "keyword", pattern: "cost",  platform: "instagram" },
        ],
      },
    },
  });
  console.log("✅ Workflow + Triggers:", workflow.id);
  console.log("🎉 Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());