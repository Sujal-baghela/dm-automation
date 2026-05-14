import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...");

  // 1. User
  const user = await prisma.user.upsert({
    where: { email: "demo@dm-automation.com" },
    update: {},
    create: {
      email: "demo@dm-automation.com",
      name: "Test User",
    },
  });
  console.log("✅ User:", user.id);

  // 2. Platform Connection
  await prisma.platformConnection.upsert({
  where: { accountId: "DEMO_IG_ACCOUNT" },
  update: {},
  create: {
    id: "seed-platform-conn-1",
    userId: user.id,
    platform: "instagram",
    accountId: "DEMO_IG_ACCOUNT",
    accessToken: "DEMO_TOKEN",
    updatedAt: new Date(),
  },
});
console.log("✅ PlatformConnection done");
  // 3. Workflows
  await prisma.workflow.upsert({
    where: { id: "seed-workflow-1" },
    update: {},
    create: {
      id: "seed-workflow-1",
      userId: user.id,
      name: "Price Inquiry Reply",
      isActive: true,
      platforms: ["instagram"],
      nodes: [{ type: "send_message", message: "Thanks! Our price starts from ₹999. Reply YES for details." }],
      triggers: {
        create: [
          { type: "keyword", pattern: "price", platform: "instagram" },
          { type: "keyword", pattern: "cost", platform: "instagram" },
        ],
      },
    },
  });

  await prisma.workflow.upsert({
    where: { id: "seed-workflow-2" },
    update: {},
    create: {
      id: "seed-workflow-2",
      userId: user.id,
      name: "Order Status Reply",
      isActive: true,
      platforms: ["whatsapp"],
      nodes: [{ type: "send_message", message: "Your order is being processed! We'll update you within 24 hours." }],
      triggers: {
        create: [
          { type: "keyword", pattern: "order", platform: "whatsapp" },
          { type: "keyword", pattern: "status", platform: "whatsapp" },
        ],
      },
    },
  });

  await prisma.workflow.upsert({
    where: { id: "seed-workflow-3" },
    update: {},
    create: {
      id: "seed-workflow-3",
      userId: user.id,
      name: "Support Auto-Reply",
      isActive: false,
      platforms: ["instagram", "whatsapp"],
      nodes: [{ type: "send_message", message: "Hi! Our support team will get back to you within 2 hours." }],
      triggers: {
        create: [
          { type: "keyword", pattern: "help", platform: null },
          { type: "exact", pattern: "support", platform: null },
        ],
      },
    },
  });
  console.log("✅ Workflows done");

  // 4. Conversations + Messages (DM Automation side)
  const conversations = [
    { platform: "instagram", externalId: "user_ig_001", name: "Rahul Sharma" },
    { platform: "instagram", externalId: "user_ig_002", name: "Priya Patel" },
    { platform: "whatsapp", externalId: "919876543210", name: "Amit Kumar" },
    { platform: "whatsapp", externalId: "919988776655", name: "Sneha Joshi" },
    { platform: "instagram", externalId: "user_ig_003", name: "Vikram Singh" },
  ];

  for (const c of conversations) {
    const conv = await prisma.conversation.upsert({
      where: { platform_externalId: { platform: c.platform, externalId: c.externalId } },
      update: { lastMessageAt: new Date() },
      create: {
        platform: c.platform,
        externalId: c.externalId,
        lastMessageAt: new Date(),
        status: "active",
      },
    });

    // Inbound message
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        direction: "inbound",
        content: "Hi, what is the price of your product?",
        status: "received",
      },
    });

    // Outbound auto-reply
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        direction: "outbound",
        content: "Thanks! Our price starts from ₹999. Reply YES for details.",
        status: "sent",
      },
    });
  }
  console.log("✅ Conversations + Messages done");

  // 5. InboxMessages (Social Media inbox side)
  const inboxMessages = [
    { platform: "instagram", senderId: "user_ig_001", text: "Hey! What are your pricing plans?", isRead: false },
    { platform: "instagram", senderId: "user_ig_002", text: "I love your content! Can we collaborate?", isRead: true },
    { platform: "linkedin",  senderId: "li_user_001", text: "Interested in your services for our company.", isRead: false },
    { platform: "youtube",   senderId: "yt_user_001", text: "Great video! Can you make one about pricing?", isRead: true },
    { platform: "instagram", senderId: "user_ig_003", text: "Do you ship to Bangalore?", isRead: false },
    { platform: "gmb",       senderId: "gmb_user_001", text: "What are your business hours?", isRead: false },
  ];

  for (const msg of inboxMessages) {
    await prisma.inboxMessage.create({
      data: {
        userId: user.id,
        platform: msg.platform,
        externalId: `ext_${Math.random().toString(36).slice(2, 9)}`,
        senderId: msg.senderId,
        text: msg.text,
        isRead: msg.isRead,
        isOutbound: false,
      },
    });
  }
  console.log("✅ InboxMessages done");

  // 6. Posts + PlatformPosts
  const posts = [
    {
      caption: "🚀 Exciting news! We just launched our new product line. Check it out now!",
      status: "published",
      platforms: ["instagram", "linkedin"],
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      caption: "💡 5 tips to grow your Instagram following in 2025. Save this post!",
      status: "published",
      platforms: ["instagram"],
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      caption: "📊 Our Q1 results are in — and they're incredible. Thread below 👇",
      status: "scheduled",
      platforms: ["linkedin", "youtube"],
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      caption: "🎯 Behind the scenes of our latest campaign shoot!",
      status: "scheduled",
      platforms: ["instagram"],
      scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      caption: "We're hiring! Join our growing team of passionate creators.",
      status: "draft",
      platforms: ["linkedin"],
    },
  ];

  for (const p of posts) {
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        caption: p.caption,
        status: p.status,
        mediaUrls: [],
        scheduledAt: p.scheduledAt ?? null,
        publishedAt: p.publishedAt ?? null,
      },
    });

    for (const platform of p.platforms) {
      await prisma.platformPost.create({
        data: {
          postId: post.id,
          platform,
          status: p.status === "published" ? "published" : p.status === "scheduled" ? "pending" : "pending",
          externalId: p.status === "published" ? `ext_${Math.random().toString(36).slice(2, 9)}` : null,
        },
      });
    }
  }
  console.log("✅ Posts done");

  // 7. Audit Logs
  const logs = [
    { action: "workflow.matched instagram user_ig_001", metadata: { workflowId: "seed-workflow-1" } },
    { action: "workflow.matched whatsapp 919876543210", metadata: { workflowId: "seed-workflow-2" } },
    { action: "stripe.checkout.completed", metadata: { plan: "pro" } },
    { action: "workflow.created Price Inquiry Reply", metadata: {} },
    { action: "workflow.matched instagram user_ig_002", metadata: { workflowId: "seed-workflow-1" } },
    { action: "stripe.subscription.cancelled", metadata: { subscriptionId: "sub_demo" } },
  ];

  for (const log of logs) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: log.action,
        metadata: log.metadata,
      },
    });
  }
  console.log("✅ AuditLogs done");

  // 8. Account (Social Media connected accounts)
  const accountsToSeed = [
    { platform: "instagram", externalId: "ig_demo_account" },
    { platform: "linkedin",  externalId: "li_demo_account" },
  ];

  for (const acc of accountsToSeed) {
    await prisma.account.upsert({
      where: { platform_externalId: { platform: acc.platform, externalId: acc.externalId } },
      update: {},
      create: {
        userId: user.id,
        platform: acc.platform,
        externalId: acc.externalId,
        accessToken: "DEMO_TOKEN",
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log("✅ Accounts done");

  console.log("🎉 All seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());