import { prisma, Prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(_: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const workflows = await prisma.workflow.findMany({
      where: { userId },
      include: { triggers: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(workflows)
  } catch (err) {
    console.error("[workflows GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json()) as {
      name: string
      platforms: string[]
      isActive: boolean
      nodes: unknown
      triggers: Array<{ type: string; pattern: string | null; platform: string | null }>
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Workflow name is required" }, { status: 400 })
    }

    if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
      return NextResponse.json({ error: "At least one platform is required" }, { status: 400 })
    }

    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name: body.name,
        isActive: body.isActive ?? true,
        platforms: body.platforms,
        nodes: (body.nodes ?? []) as Prisma.InputJsonValue,
        triggers: {
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
        action: "workflow.created " + workflow.name,
      },
    })

    return NextResponse.json(workflow, { status: 201 })
  } catch (err) {
    console.error("[workflows POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
