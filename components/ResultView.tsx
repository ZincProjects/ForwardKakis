import { CATEGORIES, CATEGORY_META, LANGUAGES, type StoredAnalysis } from "@/lib/schema";
import SplitBar from "./SplitBar";
import TaskCard from "./TaskCard";
import PlanChecklist from "./PlanChecklist";
import CopyPrintBar from "./CopyPrintBar";

export default function ResultView({ analysis }: { analysis: StoredAnalysis }) {
  const { input, result } = analysis;
  const lang = LANGUAGES.find((l) => l.code === input.language);
  // Show tasks grouped in a stable order: automated → augmented → human-core.
  const tasks = [...result.tasks].sort(
    (a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category),
  );

  return (
    <article className="space-y-10" lang={input.language === "en" ? undefined : input.language}>
      <header className="space-y-3">
        {analysis.source === "demo" && (
          <p className="no-print inline-block rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand">
            Demo example (pre-generated)
          </p>
        )}
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{input.jobTitle}</h1>
        <p className="text-sm text-ink-soft">
          {input.yearsExperience != null && `${input.yearsExperience} years' experience · `}
          {lang?.label}
          {input.plainLanguage && " · Plain language"}
        </p>
        <p className="text-xl leading-relaxed">{result.role_summary}</p>
      </header>

      <section aria-labelledby="tasks-heading" className="space-y-4">
        <h2 id="tasks-heading" className="font-display text-2xl font-bold">
          How AI may change your tasks
        </h2>
        <SplitBar tasks={result.tasks} />
        <details className="no-print rounded-xl bg-surface-2 p-3 text-base">
          <summary className="cursor-pointer font-bold">What do the colours mean?</summary>
          <ul className="mt-2 space-y-1">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <span aria-hidden="true">{CATEGORY_META[c].icon}</span> <strong>{CATEGORY_META[c].label}:</strong>{" "}
                {CATEGORY_META[c].description}
              </li>
            ))}
          </ul>
        </details>
        <ul className="space-y-3">
          {tasks.map((t, i) => (
            <TaskCard key={`${t.task}-${i}`} task={t} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="skills-heading" className="space-y-4">
        <h2 id="skills-heading" className="font-display text-2xl font-bold">
          Skills worth building
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {result.skills_to_build.map((s) => (
            <li key={s.skill} className="print-avoid-break rounded-2xl border border-line bg-surface p-4">
              <h3 className="text-lg font-bold">{s.skill}</h3>
              <p className="mt-1 text-ink-soft">{s.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="plan-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="plan-heading" className="font-display text-2xl font-bold">
            Your 30-day plan
          </h2>
          <CopyPrintBar analysis={analysis} />
        </div>
        <PlanChecklist analysisId={analysis.id} weeks={result.plan_30_days} />
      </section>

      <section className="print-avoid-break rounded-2xl bg-brand-soft p-5 sm:p-6">
        <p className="text-xl font-bold text-ink">
          <span aria-hidden="true">💬 </span>
          {result.encouragement}
        </p>
      </section>
    </article>
  );
}
