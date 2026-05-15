import { prisma, Prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params;
    const body = (await req.json()) as {
      name: string
      platforms: string[]
      isActive: boolean
      nodes: unknown[]
      triggers: Array<{ type: string; pattern: string | null; platform: string | null }>
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Workflow name is required" }, { status: 400 })
    }

    if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
      return NextResponse.json({ error: "At least one platform is required" }, { status: 400 })
    }

    const workflow = await prisma.workflow.update({
      where: { id, userId },
      data: {
        name: body.name,
        isActive: body.isActive ?? true,
        platforms: body.platforms,
        nodes: (body.nodes ?? []) as Prisma.InputJsonValue,
        triggers: {
          deleteMany: {},
          create: body.triggers.map((t) => ({
            type: t.type,
            pattern: t.pattern ?? null,
            platform: t.platform ?? null,
          })),
        },
      },
      include: { triggers: true },
    })

    await prisma.auditLog.create({
      data: {
        userId,
        action: "workflow.updated " + workflow.name,
      },
    })

    return NextResponse.json(workflow)
  } catch (err) {
    console.error("[workflows PATCH]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params;

    const workflow = await prisma.workflow.delete({
      where: { id, userId },
    })

    await prisma.auditLog.create({
      data: {
        userId,
        action: "workflow.deleted " + workflow.name,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[workflows DELETE]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
