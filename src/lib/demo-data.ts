export const demoWorkflows = [
  { id: "1", name: "Pricing keyword reply", platforms: ["instagram"], isActive: true, triggerCount: 2, triggeredCount: 284 },
  { id: "2", name: "Story reply welcome DM", platforms: ["instagram"], isActive: true, triggerCount: 1, triggeredCount: 157 },
  { id: "3", name: "WhatsApp lead nurture", platforms: ["whatsapp"], isActive: true, triggerCount: 1, triggeredCount: 93 },
];

export const demoInboxMessages = [
  { id: "1", platform: "instagram", senderId: "@aryan.kapoor", text: "Hey! Can you send me the product catalog link?", isRead: false, createdAt: "2 min ago" },
  { id: "2", platform: "whatsapp", senderId: "Priya Rathore", text: "What's the pricing for the business plan?", isRead: true, createdAt: "14 min ago" },
  { id: "3", platform: "linkedin", senderId: "Manish Sharma", text: "Interested in a demo call. When are you free?", isRead: true, createdAt: "1 hour ago" },
  { id: "4", platform: "instagram", senderId: "@rahul_vlogs", text: "Loved your content! Do you do collabs?", isRead: false, createdAt: "3 hours ago" },
];

export const demoStats = {
  totalDMs: 1247,
  autoReplied: 892,
  postsQueued: 18,
  followersGained: 342,
};

export const demoChartData = [
  { day: "Sun", total: 142, auto: 98 },
  { day: "Mon", total: 178, auto: 127 },
  { day: "Tue", total: 165, auto: 118 },
  { day: "Wed", total: 210, auto: 157 },
  { day: "Thu", total: 190, auto: 142 },
  { day: "Fri", total: 185, auto: 138 },
  { day: "Sat", total: 155, auto: 112 },
];
