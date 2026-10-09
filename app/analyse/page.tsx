import Link from "next/link";

export const metadata = { title: "Analyse my job · ForwardKakis" };

export default function AnalysePage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Analyse my job</h1>
      <p className="text-ink-soft">Live analysis is coming in the next build phase.</p>
      <Link href="/#demos" className="font-bold text-brand underline">
        Try a demo meanwhile
      </Link>
    </div>
  );
}
