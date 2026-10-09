"use client";

import { useEffect, useState } from "react";
import type { Week } from "@/lib/schema";
import { getProgress, setProgress } from "@/lib/planProgress";

export default function PlanChecklist({ analysisId, weeks }: { analysisId: string; weeks: Week[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Load saved ticks after mount (localStorage isn't available on the server).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage
    setChecked(getProgress(analysisId));
  }, [analysisId]);

  const total = weeks.reduce((n, w) => n + w.actions.length, 0);
  const done = Object.values(checked).filter(Boolean).length;

  function toggle(key: string) {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setProgress(analysisId, next);
      return next;
    });
  }

  return (
    <div>
      <p className="mb-4 text-ink-soft" aria-live="polite">
        {done} of {total} actions done{done === total && total > 0 ? ". Well done, kaki! 🎉" : ""}
      </p>
      <ol className="grid gap-4 sm:grid-cols-2">
        {weeks.map((w) => (
          <li key={w.week} className="print-avoid-break rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-accent">Week {w.week}</p>
            <h3 className="mt-1 text-lg font-bold">{w.focus}</h3>
            <ul className="mt-3 space-y-2">
              {w.actions.map((a, i) => {
                const key = `${w.week}-${i}`;
                const id = `plan-${analysisId}-${key}`;
                return (
                  <li key={key} className="flex items-start gap-3">
                    <input
                      id={id}
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={() => toggle(key)}
                      className="mt-1 h-6 w-6 shrink-0 cursor-pointer accent-[var(--brand)]"
                    />
                    <label htmlFor={id} className={`cursor-pointer ${checked[key] ? "text-ink-soft line-through" : ""}`}>
                      {a}
                    </label>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
