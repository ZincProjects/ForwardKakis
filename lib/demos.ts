import { AnalysisSchema, type StoredAnalysis } from "./schema";
import adminExecutive from "@/data/demos/admin-executive.json";
import retailSupervisor from "@/data/demos/retail-supervisor.json";
import accountsAssistant from "@/data/demos/accounts-assistant.json";

export const DEMOS = [
  { slug: "admin-executive", emoji: "🗂️", blurb: "Office coordination, paperwork and vendors" },
  { slug: "retail-supervisor", emoji: "🛍️", blurb: "Leading a shop-floor team at a mall outlet" },
  { slug: "accounts-assistant", emoji: "🧾", blurb: "Invoices, payments and month-end closing" },
] as const;

export type DemoSlug = (typeof DEMOS)[number]["slug"];

const RAW: Record<DemoSlug, unknown> = {
  "admin-executive": adminExecutive,
  "retail-supervisor": retailSupervisor,
  "accounts-assistant": accountsAssistant,
};

export function getDemo(slug: string): StoredAnalysis | undefined {
  const raw = RAW[slug as DemoSlug] as StoredAnalysis | undefined;
  if (!raw) return undefined;
  // Validate demos with the same schema as live results.
  const parsed = AnalysisSchema.safeParse(raw.result);
  return parsed.success ? { ...raw, result: parsed.data } : undefined;
}

export function getDemoTitle(slug: DemoSlug): string {
  return (RAW[slug] as StoredAnalysis).input.jobTitle;
}
