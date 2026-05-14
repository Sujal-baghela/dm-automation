"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleWorkflow(workflowId: string, isActive: boolean) {
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { isActive: !isActive },
  })
  revalidatePath("/dashboard/workflows")
}