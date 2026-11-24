import { ExternalLink, Gauge } from 'lucide-react';
import { useState } from 'react';
import { getAppUrl } from '../../config/domain';
import { type LatencySummary, summarizeLatency } from '../../engine/network';
import { useStoredState } from '../../hooks/useStoredState';
import { siteCopy } from '../../lib/content';

const RATING_STYLE: Record<LatencySummary['rating'], string> = {
  Excellent: 'text-emerald-600 dark:text-emerald-400',
  Good: 'text-sky-600 dark:text-sky-400',
  Fair: 'text-amber-600 dark:text-amber-400',
  Poor: 'text-rose-600 dark:text-rose-400',
};

async function singleRtt(): Promise<number> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 3000);
  const started = performance.now();
  try {
    const url = `./?__softsutra_ping=${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    await response.arrayBuffer();
    return performance.now() - started;
  } finally {
    window.clearTimeout(timer);
  }
}

export function SpeedWidget(): React.JSX.Element {
  const [last, setLast] = useStoredState<LatencySummary | null>('widget:speed:last', null);
  const [samples, setSamples] = useState<Array<{ id: number; value: number }>>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    setSamples([]);
    const collected: number[] = [];
    for (let index = 0; index < 6; index += 1) {
      try {
        const value = await singleRtt();
        collected.push(value);
        setSamples((previous) => [...previous, { id: performance.now() + collected.length, value }]);
      } catch {
        setError('The sample timed out. Your network or an extension may be blocking local requests.');
        break;
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
    }
    if (collected.length > 0) setLast(summarizeLatency(collected));
    setRunning(false);
  };

  return (
    <section
      aria-labelledby="speed-preview"
      className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
    >
      <header className="flex items-center gap-2">
        <Gauge size={18} className="text-brand-600 dark:text-brand-50" aria-hidden="true" />
        <h3 id="speed-preview" className="text-lg font-bold">
          Instant latency &amp; jitter check
        </h3>
      </header>
      <p className="mt-1 text-xs text-slate-500">{siteCopy.widgets.speed.description}</p>

      <div className="mt-4 grid min-h-[132px] gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Average RTT</p>
          <p className="mt-1 text-2xl font-black tabular-nums">{last ? `${last.average} ms` : '—'}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Jitter</p>
          <p className="mt-1 text-2xl font-black tabular-nums">{last ? `${last.jitter} ms` : '—'}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Connection</p>
          <p className={`mt-1 text-xl font-black ${last ? RATING_STYLE[last.rating] : ''}`}>
            {last?.rating ?? 'Not tested'}
          </p>
        </div>
      </div>

      <div role="img" aria-label="Sample progress" className="mt-4 flex min-h-6 items-center gap-1">
        {samples.map((sample) => (
          <span
            key={sample.id}
            className="h-6 w-2 rounded-full bg-brand-500/70"
            style={{ height: `${Math.max(8, Math.min(24, sample.value / 8))}px` }}
          />
        ))}
        {running && <span className="ml-2 text-xs text-slate-500">Measuring…</span>}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={running}
          className="min-h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 active:scale-95"
        >
          {running ? 'Testing…' : 'Start ping test'}
        </button>
        <a
          href={getAppUrl('speed')}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-brand-300 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-50 dark:hover:bg-brand-500/10"
        >
          {siteCopy.widgets.speed.cta} <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
