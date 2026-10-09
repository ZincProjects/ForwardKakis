import Link from "next/link";
import ResultView from "@/components/ResultView";
import HistoryResult from "@/components/HistoryResult";
import { getDemo } from "@/lib/demos";

export const metadata = { title: "Your results · ForwardKakis" };

export default async function ResultsPage({ searchParams }: PageProps<"/results">) {
  const params = await searchParams;
  const demo = typeof params.demo === "string" ? params.demo : undefined;
  const id = typeof params.id === "string" ? params.id : undefined;

  if (demo) {
    const analysis = getDemo(demo);
    if (analysis) return <ResultView analysis={analysis} />;
  } else if (id) {
    // Saved analyses live in this browser's localStorage, so load them client-side.
    return <HistoryResult id={id} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">We couldn&apos;t find that result</h1>
      <p>
        <Link href="/#demos" className="font-bold text-brand underline">
          Try a demo
        </Link>{" "}
        or{" "}
        <Link href="/analyse" className="font-bold text-brand underline">
          analyse your job
        </Link>
        .
      </p>
    </div>
  );
}
