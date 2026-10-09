import HistoryList from "@/components/HistoryList";

export const metadata = { title: "History · ForwardKakis" };

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold">Your recent analyses</h1>
        <p className="text-ink-soft">The last 5 are saved in this browser only. Nothing is stored on our server.</p>
      </div>
      <HistoryList />
    </div>
  );
}
