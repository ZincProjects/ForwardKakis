import { z } from "zod";

export const CATEGORIES = ["automated", "augmented", "human_core"] as const;
export type Category = (typeof CATEGORIES)[number];

export const TaskSchema = z.object({
  task: z.string().min(1),
  category: z.enum(CATEGORIES),
  explanation: z.string().min(1),
  ai_tool_idea: z.string().nullable(),
});

export const SkillSchema = z.object({
  skill: z.string().min(1),
  why: z.string().min(1),
});

export const WeekSchema = z.object({
  week: z.number().int().min(1).max(4),
  focus: z.string().min(1),
  actions: z.array(z.string().min(1)).min(2).max(3),
});

/** The shape every analysis (live or demo) must match. */
export const AnalysisSchema = z.object({
  role_summary: z.string().min(1),
  tasks: z.array(TaskSchema).min(6).max(10),
  skills_to_build: z.array(SkillSchema).min(4).max(6),
  plan_30_days: z.array(WeekSchema).length(4),
  encouragement: z.string().min(1),
});

export type Task = z.infer<typeof TaskSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Week = z.infer<typeof WeekSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;

export const LANGUAGES = [
  { code: "en", label: "English", promptName: "English" },
  { code: "zh", label: "中文", promptName: "Simplified Chinese (简体中文)" },
  { code: "ms", label: "Bahasa Melayu", promptName: "Bahasa Melayu" },
  { code: "ta", label: "தமிழ்", promptName: "Tamil (தமிழ்)" },
] as const;
export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const MODELS = [
  { id: "claude-sonnet-5-5", label: "Sonnet 5.5", hint: "Best quality (default)" },
  { id: "claude-haiku-5-5", label: "Haiku 5.5", hint: "Faster and cheaper" },
] as const;
export type ModelId = (typeof MODELS)[number]["id"];
export const DEFAULT_MODEL: ModelId = "claude-sonnet-5-5";

export interface AnalysisInput {
  jobTitle: string;
  jobDescription?: string;
  yearsExperience?: number;
  language: LanguageCode;
  plainLanguage: boolean;
  model: ModelId;
}

export interface StoredAnalysis {
  id: string;
  createdAt: string;
  source: "live" | "demo";
  input: AnalysisInput;
  result: Analysis;
}

export const CATEGORY_META: Record<
  Category,
  { label: string; short: string; description: string; icon: string }
> = {
  automated: {
    label: "AI can likely handle",
    short: "Automated",
    description: "Routine work AI tools can do most of, with you checking the result.",
    icon: "⚙️",
  },
  augmented: {
    label: "AI helps you do it",
    short: "Augmented",
    description: "You stay in charge; AI makes it faster or easier.",
    icon: "🤝",
  },
  human_core: {
    label: "Your human strength",
    short: "Human-core",
    description: "Judgement, care and relationships. This stays with people.",
    icon: "💛",
  },
};
