import { NextResponse } from "next/server"
import { dmWorker } from "@/lib/worker"

export async function GET(_: Request) {
  return NextResponse.json({ status: "worker running", workerId: dmWorker.id ?? "active" })
}
