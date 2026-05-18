import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import CalendarClient from "./CalendarClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const { userId } = await auth();
  if (!userId) return <div className="content">Unauthorized</div>;

  const posts = await prisma.post.findMany({
    where: { userId },
    include: { platformPosts: true },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <CalendarClient
      posts={posts.map((p) => ({
        id: p.id,
        caption: p.caption,
        status: p.status,
        scheduledAt: p.scheduledAt?.toISOString() ?? null,
        publishedAt: p.publishedAt?.toISOString() ?? null,
        platformPosts: p.platformPosts.map((pp) => ({
          id: pp.id,
          platform: pp.platform,
        })),
      }))}
    />
  );
}
