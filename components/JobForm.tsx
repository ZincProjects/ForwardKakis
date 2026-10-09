"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { analyseJob, type Stage } from "@/lib/analyse";
import type { FriendlyError } from "@/lib/anthropic";
import { addToHistory, newId } from "@/lib/history";
import { LIMITS } from "@/lib/prompt";
import {
  DEFAULT_MODEL,
  LANGUAGES,
  MODELS,
  type AnalysisInput,
  type LanguageCode,
  type ModelId,
} from "@/lib/schema";
import { getJSON, setJSON } from "@/lib/storage";
import { openSettings, useApiKey } from "@/lib/useApiKey";

const PREFS_KEY = "fk:prefs";
interface Prefs {
  language: LanguageCode;
  plainLanguage: boolean;
  model: ModelId;
}
const DEFAULT_PREFS: Prefs = { language: "en", plainLanguage: false, model: DEFAULT_MODEL };

function loadPrefs(): Prefs {
  const p = getJSON<Partial<Prefs>>("local", PREFS_KEY, {});
  return {
    language: LANGUAGES.some((l) => l.code === p.language) ? (p.language as LanguageCode) : DEFAULT_PREFS.language,
    plainLanguage: typeof p.plainLanguage === "boolean" ? p.plainLanguage : DEFAULT_PREFS.plainLanguage,
    model: MODELS.some((m) => m.id === p.model) ? (p.model as ModelId) : DEFAULT_PREFS.model,
  };
}

const STAGE_TEXT: Record<Stage, string> = {
  thinking: "Reading about your job…",
  summary: "Summarising your role…",
  tasks: "Mapping your tasks…",
  skills: "Picking skills worth building…",
  plan: "Writing your 30-day plan…",
  finishing: "Almost done…",
};
const STAGE_ORDER: Stage[] = ["thinking", "summary", "tasks", "skills", "plan", "finishing"];

export default function JobForm() {
  const router = useRouter();
  const apiKey = useApiKey();
  const ids = {
    title: useId(),
    desc: useId(),
    descHelp: useId(),
    years: useId(),
    lang: useId(),
    plain: useId(),
  };

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [years, setYears] = useState("");
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [titleError, setTitleError] = useState("");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<Stage>("thinking");
  const [error, setError] = useState<FriendlyError | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage
    setPrefs(loadPrefs());
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function updatePrefs(patch: Partial<Prefs>) {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      setJSON("local", PREFS_KEY, next);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const title = jobTitle.trim();
    if (!title) {
      setTitleError("Please enter your job title.");
      titleRef.current?.focus();
      return;
    }
    setTitleError("");

    if (!apiKey) {
      openSettings();
      return;
    }

    const yearsNum = years.trim() === "" ? undefined : Math.round(Number(years));
    const input: AnalysisInput = {
      jobTitle: title.slice(0, LIMITS.jobTitle),
      jobDescription: jobDescription.trim().slice(0, LIMITS.jobDescription) || undefined,
      yearsExperience:
        yearsNum != null && Number.isFinite(yearsNum) && yearsNum >= 0 && yearsNum <= LIMITS.yearsMax
          ? yearsNum
          : undefined,
      ...prefs,
    };

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setStage("thinking");

    const result = await analyseJob(apiKey.key, input, { signal: controller.signal, onStage: setStage });
    abortRef.current = null;

    if (!result.ok) {
      setRunning(false);
      if (result.error.kind !== "cancelled") setError(result.error);
      return;
    }

    const id = newId();
    const saved = addToHistory({ id, createdAt: new Date().toISOString(), source: "live", input, result: result.analysis });
    if (!saved) {
      setRunning(false);
      setError({
        kind: "unknown",
        title: "Couldn't save your result",
        message: "Your browser blocked storage (private mode or full storage), so the result can't be shown. Please allow site data and try again.",
      });
      return;
    }
    router.push(`/results?id=${encodeURIComponent(id)}`);
  }

  if (running) {
    const idx = STAGE_ORDER.indexOf(stage);
    return (
      <div className="space-y-6 rounded-3xl border border-line bg-surface p-6 sm:p-8" aria-busy="true">
        <div role="status" aria-live="polite" className="space-y-2">
          <p className="font-display text-2xl font-bold">
            <span aria-hidden="true" className="mr-2 inline-block animate-pulse">
              🤝
            </span>
            {STAGE_TEXT[stage]}
          </p>
          <p className="text-ink-soft">This usually takes 20–60 seconds. Hang tight, kaki.</p>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-label="Analysis progress"
          aria-valuemin={0}
          aria-valuemax={STAGE_ORDER.length}
          aria-valuenow={idx + 1}
        >
          <div
            className="h-full rounded-full bg-brand transition-all duration-700"
            style={{ width: `${((idx + 1) / STAGE_ORDER.length) * 100}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => abortRef.current?.abort()}
          className="min-h-12 rounded-xl border-2 border-line px-5 font-bold hover:bg-surface-2"
        >
          Cancel
        </button>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border-2 border-line bg-surface px-3 py-2.5 text-lg";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {apiKey === null && (
        <div className="rounded-2xl border-2 border-accent/40 bg-surface p-4 sm:p-5">
          <p className="font-bold">You&apos;ll need your own Anthropic API key to analyse your job.</p>
          <p className="mt-1 text-ink-soft">
            Your key stays in your browser and is sent only to Anthropic. No key?{" "}
            <Link href="/#demos" className="font-bold text-brand underline">
              Try a demo
            </Link>{" "}
            instead.
          </p>
          <button
            type="button"
            onClick={openSettings}
            className="mt-3 min-h-12 rounded-xl bg-brand px-5 font-bold text-brand-ink hover:opacity-90"
          >
            Add API key
          </button>
        </div>
      )}

      {error && (
        <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-2xl bg-danger-bg p-4 text-danger-ink sm:p-5">
          <p className="text-lg font-bold">{error.title}</p>
          <p className="mt-1">{error.message}</p>
          {(error.kind === "invalid_key" || error.kind === "no_credit" || error.kind === "permission") && (
            <button
              type="button"
              onClick={openSettings}
              className="mt-3 min-h-11 rounded-xl border-2 border-danger-ink px-4 font-bold"
            >
              Open settings
            </button>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor={ids.title} className="block text-lg font-bold">
          Job title <span className="font-normal text-ink-soft">(required)</span>
        </label>
        <input
          ref={titleRef}
          id={ids.title}
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          maxLength={LIMITS.jobTitle}
          placeholder="e.g. Customer Service Officer"
          autoComplete="organization-title"
          aria-invalid={!!titleError}
          aria-describedby={titleError ? `${ids.title}-err` : undefined}
          className={inputCls}
        />
        {titleError && (
          <p id={`${ids.title}-err`} className="font-semibold text-danger-ink">
            {titleError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={ids.desc} className="block text-lg font-bold">
          Job description <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <p id={ids.descHelp} className="text-ink-soft">
          Paste your job ad or list your main duties for a sharper result. Leave out names, NRIC numbers and other
          personal details.
        </p>
        <textarea
          id={ids.desc}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          maxLength={LIMITS.jobDescription}
          rows={6}
          aria-describedby={ids.descHelp}
          className={inputCls}
        />
        <p className="text-right text-sm text-ink-soft">
          {jobDescription.length} / {LIMITS.jobDescription}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={ids.years} className="block text-lg font-bold">
            Years of experience <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <input
            id={ids.years}
            type="number"
            inputMode="numeric"
            min={0}
            max={LIMITS.yearsMax}
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={ids.lang} className="block text-lg font-bold">
            Answer in
          </label>
          <select
            id={ids.lang}
            value={prefs.language}
            onChange={(e) => updatePrefs({ language: e.target.value as LanguageCode })}
            className={`${inputCls} min-h-[3.25rem]`}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} lang={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4">
        <input
          id={ids.plain}
          type="checkbox"
          checked={prefs.plainLanguage}
          onChange={(e) => updatePrefs({ plainLanguage: e.target.checked })}
          className="mt-1 h-6 w-6 shrink-0 accent-[var(--brand)]"
        />
        <label htmlFor={ids.plain}>
          <span className="text-lg font-bold">Plain-language mode</span>
          <span className="block text-ink-soft">Shorter sentences and simpler words.</span>
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-lg font-bold">AI model</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODELS.map((m) => (
            <label
              key={m.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-line bg-surface p-4 has-[:checked]:border-brand"
            >
              <input
                type="radio"
                name="model"
                value={m.id}
                checked={prefs.model === m.id}
                onChange={() => updatePrefs({ model: m.id })}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--brand)]"
              />
              <span>
                <span className="block font-bold">{m.label}</span>
                <span className="block text-ink-soft">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        className="min-h-14 w-full rounded-2xl bg-brand px-7 text-lg font-bold text-brand-ink shadow-sm hover:opacity-90 sm:w-auto"
      >
        {apiKey === null ? "Add API key to continue" : "Analyse my job →"}
      </button>
    </form>
  );
}
