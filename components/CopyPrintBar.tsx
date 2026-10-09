"use client";

import { useState } from "react";
import type { StoredAnalysis } from "@/lib/schema";

function planAsText(a: StoredAnalysis): string {
  const lines = [`ForwardKakis 30-day plan: ${a.input.jobTitle}`, ""];
  for (const w of a.result.plan_30_days) {
    lines.push(`Week ${w.week}: ${w.focus}`);
    for (const action of w.actions) lines.push(`  [ ] ${action}`);
    lines.push("");
  }
  lines.push("Skills to build:");
  for (const s of a.result.skills_to_build) lines.push(`  - ${s.skill}: ${s.why}`);
  return lines.join("\n");
}

export default function CopyPrintBar({ analysis }: { analysis: StoredAnalysis }) {
  const [status, setStatus] = useState<string>("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(planAsText(analysis));
      setStatus("Plan copied to clipboard.");
    } catch {
      setStatus("Couldn't copy automatically. Try Print / save as PDF instead.");
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={copy}
        className="min-h-11 rounded-xl border-2 border-brand px-4 py-2 font-bold text-brand hover:bg-brand-soft"
      >
        📋 Copy plan
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="min-h-11 rounded-xl border-2 border-brand px-4 py-2 font-bold text-brand hover:bg-brand-soft"
      >
        🖨️ Print / save as PDF
      </button>
      <span role="status" className="text-ink-soft">
        {status}
      </span>
    </div>
  );
}
