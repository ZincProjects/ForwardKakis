import { CATEGORIES, CATEGORY_META, type Task } from "@/lib/schema";
import { CATEGORY_CLASSES } from "./categoryStyles";

export default function SplitBar({ tasks }: { tasks: Task[] }) {
  const counts = CATEGORIES.map((c) => ({
    category: c,
    count: tasks.filter((t) => t.category === c).length,
  }));
  const summary = counts.map((c) => `${c.count} ${CATEGORY_META[c.category].short.toLowerCase()}`).join(" / ");

  return (
    <div className="print-avoid-break">
      <p className="sr-only">Task split: {summary}.</p>
      <div className="flex h-5 w-full overflow-hidden rounded-full border border-line" aria-hidden="true">
        {counts.map(
          (c) =>
            c.count > 0 && (
              <div
                key={c.category}
                className={CATEGORY_CLASSES[c.category].bar}
                style={{ width: `${(c.count / tasks.length) * 100}%` }}
              />
            ),
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base" aria-hidden="true">
        {counts.map((c) => (
          <li key={c.category} className="flex items-center gap-2">
            <span className={`inline-block h-3.5 w-3.5 rounded-full ${CATEGORY_CLASSES[c.category].dot}`} />
            <span>
              <strong>{c.count}</strong> {CATEGORY_META[c.category].short.toLowerCase()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
