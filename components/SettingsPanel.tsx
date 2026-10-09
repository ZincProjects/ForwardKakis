"use client";

import { useEffect, useId, useRef, useState } from "react";
import { clearKey, looksLikeAnthropicKey, maskKey, saveKey } from "@/lib/keyStore";
import { testKey } from "@/lib/anthropic";
import { OPEN_SETTINGS_EVENT, useApiKey } from "@/lib/useApiKey";

type Status = { tone: "info" | "ok" | "error"; title?: string; text: string } | null;

export default function SettingsPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stored = useApiKey();
  const [draft, setDraft] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const ids = { key: useId(), remember: useId(), help: useId(), title: useId() };

  useEffect(() => {
    function open() {
      // Pre-fill from storage each time the panel opens.
      setDraft(stored?.key ?? "");
      setRemember(stored?.remembered ?? false);
      setShow(false);
      setStatus(null);
      dialogRef.current?.showModal();
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, [stored]);

  const trimmed = draft.trim();
  const formatWarning = trimmed && !looksLikeAnthropicKey(trimmed);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed) {
      setStatus({ tone: "error", text: "Please paste your API key first." });
      return;
    }
    const ok = saveKey(trimmed, remember);
    setStatus(
      ok
        ? {
            tone: "ok",
            text: remember
              ? "Saved on this device. It stays until you clear it."
              : "Saved for this tab. It's cleared when you close the tab.",
          }
        : { tone: "error", text: "Your browser blocked storage (private mode?). The key couldn't be saved." },
    );
  }

  async function handleTest() {
    if (!trimmed) {
      setStatus({ tone: "error", text: "Please paste your API key first." });
      return;
    }
    setTesting(true);
    setStatus({ tone: "info", text: "Testing your key with Anthropic…" });
    const result = await testKey(trimmed);
    setTesting(false);
    setStatus(
      result.ok
        ? { tone: "ok", title: "Your key works! 🎉", text: "Remember to press Save key if you haven't." }
        : { tone: "error", title: result.error.title, text: result.error.message },
    );
  }

  function handleClear() {
    clearKey();
    setDraft("");
    setRemember(false);
    setStatus({ tone: "ok", text: "Key cleared from this browser." });
  }

  const statusClass =
    status?.tone === "ok"
      ? "bg-ok-bg text-ok-ink"
      : status?.tone === "error"
        ? "bg-danger-bg text-danger-ink"
        : "bg-surface-2 text-ink";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={ids.title}
      className="m-auto w-[min(100%-2rem,34rem)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50"
      onClick={(e) => {
        // Click on the backdrop closes the dialog.
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <form onSubmit={handleSave} className="space-y-5 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h2 id={ids.title} className="font-display text-2xl font-bold">
            Settings: your API key
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl hover:bg-surface-2"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <p id={ids.help} className="rounded-2xl bg-brand-soft p-4 text-ink">
          🔒 Your key stays in your browser and is sent only to Anthropic. Get one at{" "}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand underline"
          >
            console.anthropic.com
          </a>
          .
        </p>

        {stored && (
          <p className="text-ink-soft">
            Current key: <span className="font-mono">{maskKey(stored.key)}</span> (
            {stored.remembered ? "remembered on this device" : "this tab only"})
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor={ids.key} className="block font-bold">
            Anthropic API key
          </label>
          <div className="flex gap-2">
            <input
              id={ids.key}
              type={show ? "text" : "password"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              data-1p-ignore
              data-lpignore="true"
              aria-describedby={ids.help}
              className="min-h-12 w-full min-w-0 rounded-xl border-2 border-line bg-bg px-3 font-mono text-base"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-pressed={show}
              className="min-h-12 shrink-0 rounded-xl border-2 border-line px-3 font-semibold hover:bg-surface-2"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {formatWarning && (
            <p className="text-sm text-danger-ink">This doesn&apos;t look like an Anthropic key (they start with “sk-ant-”).</p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <input
            id={ids.remember}
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="mt-1 h-6 w-6 shrink-0 accent-[var(--brand)]"
          />
          <label htmlFor={ids.remember}>
            <span className="font-bold">Remember on this device</span>
            <span className="block text-sm text-ink-soft">
              Off: the key is forgotten when you close this tab. Only turn on for a personal device you trust.
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="min-h-12 rounded-xl bg-brand px-5 font-bold text-brand-ink hover:opacity-90"
          >
            Save key
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="min-h-12 rounded-xl border-2 border-brand px-5 font-bold text-brand hover:bg-brand-soft disabled:opacity-60"
          >
            {testing ? "Testing…" : "Test key"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="min-h-12 rounded-xl border-2 border-line px-5 font-bold hover:bg-danger-bg hover:text-danger-ink"
          >
            Clear key
          </button>
        </div>

        <div role="status" aria-live="polite">
          {status && (
            <div className={`rounded-xl p-3 ${statusClass}`}>
              {status.title && <p className="font-bold">{status.title}</p>}
              <p>{status.text}</p>
            </div>
          )}
        </div>

        <p className="text-sm text-ink-soft">
          Testing makes one tiny request (a few tokens) to check the key and your credit. Each analysis typically costs a
          few cents on your Anthropic account.
        </p>
      </form>
    </dialog>
  );
}
