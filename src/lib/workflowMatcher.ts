import { prisma } from "./prisma";

export async function matchTrigger(
  platform: string,
  externalId: string,
  text: string
) {
  // ✅ Guard: empty or whitespace-only messages → skip
  if (!text?.trim()) return null;

  // ✅ Fetch only active workflows that support this platform
  const workflows = await prisma.workflow.findMany({
    where: {
      isActive: true,
      platforms: { has: platform },
    },
    include: { triggers: true },
  });

  const lowerText = text.toLowerCase();

  for (const wf of workflows) {
    for (const t of wf.triggers) {
      // ✅ Skip trigger if it's locked to a different platform
      if (t.platform && t.platform !== platform) continue;

      // ✅ Keyword match — simple case-insensitive substring check
      if (t.type === "keyword") {
        const keyword = (t.pattern || "").toLowerCase().trim();
        if (keyword && lowerText.includes(keyword)) {
          console.log(
            `[workflowMatcher] ✅ Keyword match — ` +
            `workflowId=${wf.id} keyword="${keyword}" externalId=${externalId}`
          );
          return wf;
        }
      }

      // ✅ Regex match — bad pattern in DB skips instead of crashing the worker
      if (t.type === "regex" && t.pattern) {
        let re: RegExp;
        try {
          re = new RegExp(t.pattern, "i");
        } catch (err) {
          console.warn(
            `[workflowMatcher] ⚠️  Invalid regex pattern skipped — ` +
            `triggerId=${t.id} pattern="${t.pattern}":`,
            err
          );
          continue; // skip this trigger, do NOT crash
        }

        if (re.test(text)) {
          console.log(
            `[workflowMatcher] ✅ Regex match — ` +
            `workflowId=${wf.id} pattern="${t.pattern}" externalId=${externalId}`
          );
          return wf;
        }
      }

      // ✅ Exact match — full string equality (case-insensitive)
      if (t.type === "exact") {
        const exact = (t.pattern || "").toLowerCase().trim();
        if (exact && lowerText.trim() === exact) {
          console.log(
            `[workflowMatcher] ✅ Exact match — ` +
            `workflowId=${wf.id} pattern="${exact}" externalId=${externalId}`
          );
          return wf;
        }
      }
    }
  }

  // No workflow matched
  console.log(
    `[workflowMatcher] ℹ️  No match found — ` +
    `platform=${platform} externalId=${externalId} text="${text.slice(0, 60)}"`
  );
  return null;
}