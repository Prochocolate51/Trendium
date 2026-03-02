import SimplifyForm from '@/components/SimplifyForm';

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-10 md:py-20">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">ExplainItSimple</p>
        <h1 className="text-3xl font-bold text-slate-900 md:text-5xl">Understand difficult text in seconds</h1>
        <p className="mt-3 text-sm text-slate-600 md:text-base">
          Paste any complex text and instantly get a clear explanation, key points, a practical example,
          and a quick recap.
        </p>
      </div>

      <SimplifyForm />
    </main>
  );
}
