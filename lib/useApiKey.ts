"use client";

import { useSyncExternalStore } from "react";
import { loadKey, onKeyChange, type StoredKey } from "./keyStore";

// Cache the snapshot so useSyncExternalStore gets a stable reference.
let cached: StoredKey | null = null;
let cachedSig = "";

function getSnapshot(): StoredKey | null {
  const k = loadKey();
  const sig = k ? `${k.remembered}:${k.key}` : "";
  if (sig !== cachedSig) {
    cachedSig = sig;
    cached = k;
  }
  return cached;
}

/** Current API key (or null). `undefined` during server render. */
export function useApiKey(): StoredKey | null | undefined {
  return useSyncExternalStore<StoredKey | null | undefined>(onKeyChange, getSnapshot, () => undefined);
}

export const OPEN_SETTINGS_EVENT = "fk:open-settings";

export function openSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
