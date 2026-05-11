import { runScheduler } from "@/lib/scheduler";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Check Bearer token authorization
    const authHeader = request.headers.get("Authorization");
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (!authHeader || authHeader !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run the scheduler
    const result = await runScheduler();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[CRON/SCHEDULER] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
