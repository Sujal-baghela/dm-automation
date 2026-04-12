import { prisma } from "./prisma";

export async function matchTrigger(
  platform: string,
  externalId: string,
  text: string
) {
  if (!text?.trim()) return null;

  const workflows = await prisma.workflow.findMany({
    where: { isActive: true, platforms: { has: platform } },
    include: { triggers: true },
  });

  const lowerText = text.toLowerCase();

  for (const wf of workflows) {
    for (const t of wf.triggers) {
      if (t.platform && t.platform !== platform) continue;

      if (
        t.type === "keyword" &&
        lowerText.includes((t.pattern || "").toLowerCase())
      ) {
        return wf;
      }

      if (t.type === "regex" && t.pattern) {
        // ✅ Fix: bad regex in DB should skip, not crash the worker
        let re: RegExp;
        try {
          re = new RegExp(t.pattern, "i");
        } catch (err) {
          console.warn(
            `[workflowMatcher] Invalid regex pattern skipped — ` +
            `triggerId=${t.id} pattern="${t.pattern}":`,
            err
          );
          continue;
        }
        if (re.test(text)) return wf;
      }
    }
  }

  return null;
}