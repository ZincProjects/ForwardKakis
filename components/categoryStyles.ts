import type { Category } from "@/lib/schema";

export const CATEGORY_CLASSES: Record<
  Category,
  { card: string; badge: string; bar: string; dot: string }
> = {
  automated: {
    card: "border-auto-line bg-auto-bg",
    badge: "bg-auto-line/40 text-auto-ink",
    bar: "bg-auto-line",
    dot: "bg-auto-line",
  },
  augmented: {
    card: "border-aug-line bg-aug-bg",
    badge: "bg-aug-line/40 text-aug-ink",
    bar: "bg-aug-line",
    dot: "bg-aug-line",
  },
  human_core: {
    card: "border-human-line bg-human-bg",
    badge: "bg-human-line/40 text-human-ink",
    bar: "bg-human-line",
    dot: "bg-human-line",
  },
};
