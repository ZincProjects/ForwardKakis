"use client";

import { openSettings, useApiKey } from "@/lib/useApiKey";
import SettingsPanel from "./SettingsPanel";

export default function SettingsButton() {
  const stored = useApiKey();

  return (
    <>
      <button
        type="button"
        onClick={openSettings}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold text-ink hover:bg-surface-2"
      >
        <span aria-hidden="true">{stored ? "🔑" : "⚙️"}</span>
        Settings
        {stored && <span className="sr-only"> (API key saved)</span>}
      </button>
      <SettingsPanel />
    </>
  );
}
