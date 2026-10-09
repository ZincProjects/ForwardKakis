import Link from "next/link";
import { DEMOS, getDemoTitle } from "@/lib/demos";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-5 pt-2 sm:pt-6">
        <p className="font-bold text-accent">Hello, kaki 👋</p>
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
          See how AI will change your job, and what to do next.
        </h1>
        <p className="max-w-2xl text-xl text-ink-soft">
          Tell us your job. We&apos;ll break it into tasks, show which ones AI may take over, help with, or leave to
          you, and give you a practical 30-day plan.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="#demos"
            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-brand px-7 py-3 text-lg font-bold text-brand-ink shadow-sm hover:opacity-90"
          >
            ✨ Try a demo
          </Link>
          <Link
            href="/analyse"
            className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-brand px-7 py-3 text-lg font-bold text-brand hover:bg-brand-soft"
          >
            Analyse my job
          </Link>
        </div>
        <p className="text-base text-ink-soft">The demo needs no sign-up and no API key.</p>
      </section>

      <section id="demos" aria-labelledby="demos-heading" className="scroll-mt-6 space-y-4">
        <h2 id="demos-heading" className="font-display text-2xl font-bold">
          Try a demo: pick a job
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {DEMOS.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/results?demo=${d.slug}`}
                className="flex h-full flex-col gap-2 rounded-2xl border-2 border-line bg-surface p-5 hover:border-brand"
              >
                <span className="text-3xl" aria-hidden="true">
                  {d.emoji}
                </span>
                <span className="text-lg font-bold">{getDemoTitle(d.slug)}</span>
                <span className="text-ink-soft">{d.blurb}</span>
                <span className="mt-auto pt-2 font-bold text-brand">See results →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="space-y-4">
        <h2 id="how-heading" className="font-display text-2xl font-bold">
          How it works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Tell us your job", "A job title is enough. Paste a job description for a sharper result."],
            ["2", "See your task map", "Each task is marked: AI can likely handle it, AI helps you, or it's your human strength."],
            ["3", "Take your next step", "Get skills to build and a week-by-week plan you can tick off."],
          ].map(([n, title, body]) => (
            <li key={n} className="rounded-2xl bg-surface-2 p-5">
              <span className="font-display text-3xl font-bold text-accent">{n}</span>
              <h3 className="mt-1 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
        <p className="text-ink-soft">
          To analyse your own job you&apos;ll use your own Anthropic API key. It stays in your browser and is sent only to
          Anthropic.
        </p>
      </section>
    </div>
  );
}
