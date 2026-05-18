import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.post.deleteMany({ where: { id, userId } });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as { caption?: string; scheduledAt?: string | null };

  const updated = await prisma.post.updateMany({
    where: { id, userId },
    data: {
      caption: body.caption,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      status: body.scheduledAt ? "scheduled" : "draft",
    },
  });

  return NextResponse.json({ success: true });
}
