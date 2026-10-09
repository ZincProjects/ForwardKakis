"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFromHistory } from "@/lib/history";
import type { StoredAnalysis } from "@/lib/schema";
import ResultView from "./ResultView";

export default function HistoryResult({ id }: { id: string }) {
  const [state, setState] = useState<{ loaded: boolean; analysis?: StoredAnalysis }>({ loaded: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage
    setState({ loaded: true, analysis: getFromHistory(id) });
  }, [id]);

  if (!state.loaded) return <p className="text-ink-soft">Loading…</p>;
  if (!state.analysis)
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold">This result isn&apos;t saved on this device</h1>
        <p>
          Results are kept only in this browser (the last 5).{" "}
          <Link href="/history" className="font-bold text-brand underline">
            See your history
          </Link>{" "}
          or{" "}
          <Link href="/analyse" className="font-bold text-brand underline">
            start a new analysis
          </Link>
          .
        </p>
      </div>
    );
  return <ResultView analysis={state.analysis} />;
}
