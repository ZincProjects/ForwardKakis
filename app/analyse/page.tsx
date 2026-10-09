import JobForm from "@/components/JobForm";

export const metadata = { title: "Analyse my job · ForwardKakis" };

export default function AnalysePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Analyse my job</h1>
        <p className="text-lg text-ink-soft">
          A job title is enough to start. The more you tell us, the more useful the result.
        </p>
      </div>
      <JobForm />
    </div>
  );
}
