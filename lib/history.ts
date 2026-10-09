import { getJSON, setJSON } from "./storage";
import { AnalysisSchema, type StoredAnalysis } from "./schema";

const KEY = "fk:history";
const MAX = 5;

export function getHistory(): StoredAnalysis[] {
  const list = getJSON<unknown>("local", KEY, []);
  if (!Array.isArray(list)) return [];
  // Drop anything malformed (e.g. edited by hand or from an older version).
  return list.filter(
    (item): item is StoredAnalysis =>
      !!item &&
      typeof item === "object" &&
      typeof (item as StoredAnalysis).id === "string" &&
      AnalysisSchema.safeParse((item as StoredAnalysis).result).success,
  );
}

export function getFromHistory(id: string): StoredAnalysis | undefined {
  return getHistory().find((h) => h.id === id);
}

export function addToHistory(entry: StoredAnalysis): boolean {
  const next = [entry, ...getHistory().filter((h) => h.id !== entry.id)].slice(0, MAX);
  return setJSON("local", KEY, next);
}

export function deleteFromHistory(id: string): void {
  setJSON(
    "local",
    KEY,
    getHistory().filter((h) => h.id !== id),
  );
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
