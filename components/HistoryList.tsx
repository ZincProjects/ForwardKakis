"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteFromHistory, getHistory } from "@/lib/history";
import { clearProgress } from "@/lib/planProgress";
import type { StoredAnalysis } from "@/lib/schema";

export default function HistoryList() {
  const [items, setItems] = useState<StoredAnalysis[] | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage
    setItems(getHistory());
  }, []);

  function remove(item: StoredAnalysis) {
    deleteFromHistory(item.id);
    clearProgress(item.id);
    setItems(getHistory());
    setStatus(`Deleted “${item.input.jobTitle}”.`);
  }

  if (items === null) return <p className="text-ink-soft">Loading…</p>;

  return (
    <>
      <p role="status" className="text-ink-soft">
        {status}
      </p>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-surface-2 p-6">
          <p>No saved analyses yet.</p>
          <p className="mt-2">
            <Link href="/analyse" className="font-bold text-brand underline">
              Analyse your job
            </Link>{" "}
            or{" "}
            <Link href="/#demos" className="font-bold text-brand underline">
              try a demo
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
            >
              <Link href={`/results?id=${encodeURIComponent(item.id)}`} className="min-w-0 flex-1 rounded-lg">
                <span className="block text-lg font-bold text-brand underline-offset-4 hover:underline">
                  {item.input.jobTitle}
                </span>
                <span className="block text-sm text-ink-soft">
                  {new Date(item.createdAt).toLocaleString("en-SG", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => remove(item)}
                className="min-h-11 rounded-xl border border-line px-4 py-2 font-semibold hover:bg-danger-bg hover:text-danger-ink"
                aria-label={`Delete ${item.input.jobTitle}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
