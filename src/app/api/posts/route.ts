import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      include: { platformPosts: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(posts)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch posts"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { caption, mediaUrls, platforms, scheduledAt } = body

    if (!caption || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields: caption, platforms" },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        userId,
        caption,
        mediaUrls: mediaUrls || [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: "draft",
        platformPosts: {
          create: platforms.map((platform: string) => ({
            platform,
            status: "pending",
          })),
        },
      },
      include: { platformPosts: true },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { postId, caption, scheduledAt, status } = body

    if (!postId) {
      return NextResponse.json(
        { error: "Missing required field: postId" },
        { status: 400 }
      )
    }

    const updateData: Partial<{ caption: string; scheduledAt: Date | null; status: string }> = {}
    if (caption !== undefined) updateData.caption = caption
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
    if (status !== undefined) updateData.status = status

    const post = await prisma.post.update({
      where: { id: postId, userId },
      data: updateData,
      include: { platformPosts: true },
    })

    return NextResponse.json(post)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update post"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = request.nextUrl.searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "Missing required query parameter: postId" },
        { status: 400 }
      )
    }

    await prisma.platformPost.deleteMany({ where: { postId } })
    await prisma.post.delete({ where: { id: postId, userId } })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete post"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}