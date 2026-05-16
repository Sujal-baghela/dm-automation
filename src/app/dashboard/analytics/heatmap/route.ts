import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Returns a 7x24 matrix: grid[dayOfWeek][hour] = count
// dayOfWeek: 0=Sun, 1=Mon, ... 6=Sat
// hour: 0-23

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Initialize 7x24 grid
    const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));

    // 1. Published posts — use publishedAt
    const posts = await prisma.post.findMany({
        where: { userId, status: "published", publishedAt: { not: null } },
        select: { publishedAt: true },
    });

    for (const post of posts) {
        if (!post.publishedAt) continue;
        const d = new Date(post.publishedAt);
        const day = d.getDay();   // 0-6
        const hour = d.getHours(); // 0-23
        grid[day][hour]++;
    }

    // 2. Scheduled posts — use scheduledAt (future intent signal)
    const scheduled = await prisma.post.findMany({
        where: { userId, status: "scheduled", scheduledAt: { not: null } },
        select: { scheduledAt: true },
    });

    for (const post of scheduled) {
        if (!post.scheduledAt) continue;
        const d = new Date(post.scheduledAt);
        const day = d.getDay();
        const hour = d.getHours();
        grid[day][hour]++;
    }

    // 3. Inbox replies sent (outbound messages) — when YOU replied
    const replies = await prisma.inboxMessage.findMany({
        where: { userId, isOutbound: true },
        select: { createdAt: true },
    });

    for (const reply of replies) {
        const d = new Date(reply.createdAt);
        const day = d.getDay();
        const hour = d.getHours();
        grid[day][hour]++;
    }

    // Compute total activity and find top 3 slots
    const slots: { day: number; hour: number; count: number }[] = [];
    let maxCount = 0;

    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const count = grid[day][hour];
            if (count > maxCount) maxCount = count;
            if (count > 0) slots.push({ day, hour, count });
        }
    }

    slots.sort((a, b) => b.count - a.count);
    const topSlots = slots.slice(0, 3);

    const totalActivity = slots.reduce((sum, s) => sum + s.count, 0);

    return NextResponse.json({ grid, maxCount, topSlots, totalActivity });
}