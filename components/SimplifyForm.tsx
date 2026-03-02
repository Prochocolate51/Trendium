'use client';

import { FormEvent, useMemo, useState } from 'react';

type Tone = 'Super Simple' | 'Bullet Points Only' | 'With Example' | 'Exam Revision Mode';

type SimplifyResponse = {
  simpleExplanation: string;
  keyPoints: string[];
  example: string;
  quickRecap: string;
};

const TONES: Tone[] = ['Super Simple', 'Bullet Points Only', 'With Example', 'Exam Revision Mode'];
const MIN_CHARACTERS = 50;


function isSimplifyResponse(payload: unknown): payload is SimplifyResponse {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as SimplifyResponse;
  return (
    typeof candidate.simpleExplanation === 'string' &&
    Array.isArray(candidate.keyPoints) &&
    typeof candidate.example === 'string' &&
    typeof candidate.quickRecap === 'string'
  );
}

export default function SimplifyForm() {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState<Tone>('Super Simple');
  const [result, setResult] = useState<SimplifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const characterCount = input.length;
  const isTooShort = characterCount > 0 && characterCount < MIN_CHARACTERS;

  const outputForClipboard = useMemo(() => {
    if (!result) return '';
    return `SIMPLE_EXPLANATION:\n${result.simpleExplanation}\n\nKEY_POINTS:\n${result.keyPoints
      .map((point) => `- ${point}`)
      .join('\n')}\n\nEXAMPLE:\n${result.example}\n\nQUICK_RECAP:\n${result.quickRecap}`;
  }, [result]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!input.trim()) {
      setError('Please paste some content before simplifying.');
      return;
    }

    if (input.trim().length < MIN_CHARACTERS) {
      setError(`Please enter at least ${MIN_CHARACTERS} characters.`);
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim(), tone })
      });

      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          payload && typeof payload === 'object' && 'error' in payload
            ? (payload as { error?: string }).error
            : undefined;
        throw new Error(message ?? 'Something went wrong while simplifying your text.');
      }

      if (!isSimplifyResponse(payload)) {
        throw new Error('Unexpected response format from server.');
      }

      setResult(payload);
    } catch (submissionError) {
      setResult(null);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to simplify the text right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    if (!outputForClipboard) return;
    await navigator.clipboard.writeText(outputForClipboard);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="source-text" className="text-sm font-medium text-slate-700">
            Paste your complex text
          </label>
          <textarea
            id="source-text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste homework notes, textbook paragraphs, or article content here..."
            className="h-48 w-full rounded-xl border border-slate-300 p-4 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Minimum {MIN_CHARACTERS} characters required</span>
            <span className={isTooShort ? 'text-amber-600' : ''}>{characterCount} characters</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value as Tone)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm sm:w-64"
          >
            {TONES.map((toneOption) => (
              <option key={toneOption} value={toneOption}>
                {toneOption}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                Simplifying...
              </>
            ) : (
              'Simplify'
            )}
          </button>
        </div>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </form>

      {result ? (
        <section className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Simplified Output</h2>
            <button
              onClick={copyOutput}
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {copied ? 'Copied!' : 'Copy all'}
            </button>
          </div>

          <OutputSection title="Simple Explanation" content={result.simpleExplanation} />
          <OutputSection title="Key Points" content={result.keyPoints} isList />
          <OutputSection title="Example" content={result.example} />
          <OutputSection title="Quick Recap" content={result.quickRecap} />
        </section>
      ) : null}
    </div>
  );
}

function OutputSection({
  title,
  content,
  isList = false
}: {
  title: string;
  content: string | string[];
  isList?: boolean;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</h3>
      {isList && Array.isArray(content) ? (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-800">
          {content.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-slate-800">{content}</p>
      )}
    </article>
  );
}
