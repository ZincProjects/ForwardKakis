// Safe wrappers around Web Storage. Storage can throw (private mode, blocked
// site data, quota) or be missing entirely (SSR), so every access is guarded.

type Area = "local" | "session";

function area(which: Area): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return which === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function getItem(which: Area, key: string): string | null {
  try {
    return area(which)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function setItem(which: Area, key: string, value: string): boolean {
  try {
    const s = area(which);
    if (!s) return false;
    s.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeItem(which: Area, key: string): void {
  try {
    area(which)?.removeItem(key);
  } catch {
    // ignore
  }
}

export function getJSON<T>(which: Area, key: string, fallback: T): T {
  const raw = getItem(which, key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON(which: Area, key: string, value: unknown): boolean {
  try {
    return setItem(which, key, JSON.stringify(value));
  } catch {
    return false;
  }
}
