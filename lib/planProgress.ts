import { getJSON, removeItem, setJSON } from "./storage";

// Checked plan actions per analysis, keyed "week-actionIndex".
const key = (analysisId: string) => `fk:plan:${analysisId}`;

export function getProgress(analysisId: string): Record<string, boolean> {
  const v = getJSON<unknown>("local", key(analysisId), {});
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, boolean>) : {};
}

export function setProgress(analysisId: string, progress: Record<string, boolean>): void {
  setJSON("local", key(analysisId), progress);
}

export function clearProgress(analysisId: string): void {
  removeItem("local", key(analysisId));
}
