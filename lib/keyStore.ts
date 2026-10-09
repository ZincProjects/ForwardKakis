// Bring-your-own-key storage. The key lives only in this browser:
// sessionStorage by default (cleared when the tab closes), or localStorage
// if the user opts in to "Remember on this device". It is never sent to our
// server, never logged, and never put in a URL.

import { getItem, removeItem, setItem } from "./storage";

const KEY = "fk:anthropic-key";
const CHANGE_EVENT = "fk:key-changed";

export interface StoredKey {
  key: string;
  remembered: boolean;
}

export function loadKey(): StoredKey | null {
  const session = getItem("session", KEY);
  if (session) return { key: session, remembered: false };
  const local = getItem("local", KEY);
  if (local) return { key: local, remembered: true };
  return null;
}

export function saveKey(key: string, remember: boolean): boolean {
  const trimmed = key.trim();
  if (!trimmed) return false;
  // Keep the key in exactly one place.
  removeItem(remember ? "session" : "local", KEY);
  const ok = setItem(remember ? "local" : "session", KEY, trimmed);
  notify();
  return ok;
}

export function clearKey(): void {
  removeItem("session", KEY);
  removeItem("local", KEY);
  notify();
}

export function looksLikeAnthropicKey(key: string): boolean {
  return /^sk-ant-[A-Za-z0-9_-]{10,}$/.test(key.trim());
}

/** Safe-to-display hint, e.g. "sk-ant-…a1b2". Never shows the full key. */
export function maskKey(key: string): string {
  const k = key.trim();
  return k.length <= 10 ? "••••" : `${k.slice(0, 7)}…${k.slice(-4)}`;
}

function notify() {
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

export function onKeyChange(cb: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, cb);
  // Also react to changes from other tabs (localStorage only).
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
