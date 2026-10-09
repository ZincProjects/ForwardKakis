import { CATEGORY_META, type Task } from "@/lib/schema";
import { CATEGORY_CLASSES } from "./categoryStyles";

export default function TaskCard({ task }: { task: Task }) {
  const meta = CATEGORY_META[task.category];
  const cls = CATEGORY_CLASSES[task.category];

  return (
    <li className={`print-avoid-break rounded-2xl border-2 p-4 sm:p-5 ${cls.card}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-bold leading-snug text-ink">{task.task}</h3>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${cls.badge}`}>
          <span aria-hidden="true">{meta.icon}</span>
          {meta.label}
        </span>
      </div>
      <p className="mt-2 text-ink">{task.explanation}</p>
      {task.ai_tool_idea && (
        <div className="mt-3 rounded-xl bg-surface/70 p-3 text-ink">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">Try this with AI</p>
          <p className="mt-1">{task.ai_tool_idea}</p>
        </div>
      )}
    </li>
  );
}
