import { ExternalLink, RotateCcw, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { getAppUrl } from '../../config/domain';
import { advanceMala, BEADS_PER_MALA, toMalaState } from '../../engine/mala';
import { useBackGuard } from '../../hooks/useBackGuard';
import { useStoredState } from '../../hooks/useStoredState';
import { previews, siteCopy } from '../../lib/content';
import { vibrate } from '../../services/platform';

const BEAD_POSITIONS = Array.from({ length: BEADS_PER_MALA }, (_, index) => {
  const angle = (index / BEADS_PER_MALA) * Math.PI * 2 - Math.PI / 2;
  return { cx: 50 + 41 * Math.cos(angle), cy: 50 + 41 * Math.sin(angle) };
});

export function JapWidget(): React.JSX.Element {
  const [total, setTotal] = useStoredState<number>('widget:jap:total', 0);
  const [confirming, setConfirming] = useState(false);
  const closeConfirm = useCallback(() => setConfirming(false), []);
  useBackGuard(confirming, closeConfirm);
  const state = toMalaState(total);
  const panchang = previews.panchang;

  const tap = () => {
    setTotal((previous) => advanceMala(toMalaState(previous)).total);
    vibrate(10);
  };

  return (
    <section
      aria-labelledby="jap-preview"
      className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
    >
      <header className="flex items-center gap-2">
        <Sparkles size={18} className="text-brand-600 dark:text-brand-50" aria-hidden="true" />
        <h3 id="jap-preview" className="text-lg font-bold">
          Digital Rudraksha mala counter
        </h3>
      </header>

      <p className="mt-1 text-xs text-slate-500">{siteCopy.widgets.jap.description}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[220px]">
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label={`${state.beads} of ${BEADS_PER_MALA} beads in the current mala`}
            className="w-full"
          >
            <circle
              cx="50"
              cy="50"
              r="47"
              className="fill-none stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="1"
            />
            {BEAD_POSITIONS.map((position, index) => (
              <circle
                key={`bead-${position.cx.toFixed(3)}-${position.cy.toFixed(3)}`}
                cx={position.cx}
                cy={position.cy}
                r={index === state.beads ? 2.6 : 1.7}
                className={
                  index < state.beads
                    ? 'fill-brand-600'
                    : index === state.beads
                      ? 'fill-amber-500'
                      : 'fill-slate-300 dark:fill-slate-600'
                }
              />
            ))}
            <text x="50" y="47" textAnchor="middle" className="fill-current text-[13px] font-black">
              {state.beads}
            </text>
            <text x="50" y="57" textAnchor="middle" className="fill-slate-400 text-[5px]">
              / {BEADS_PER_MALA} beads
            </text>
          </svg>
          <p className="mt-2 text-center text-xs text-slate-500">
            {state.cycles} completed mala{state.cycles === 1 ? '' : 's'} · {state.total} total jap
          </p>
        </div>

        <div>
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={tap}
              className="min-h-12 rounded-lg bg-brand-600 text-sm font-bold text-white hover:bg-brand-700 active:scale-95"
            >
              Tap jap · +1
            </button>
            <button
              type="button"
              onClick={() => {
                setTotal((previous) =>
                  toMalaState(previous).beads === 0
                    ? previous + BEADS_PER_MALA
                    : previous + (BEADS_PER_MALA - toMalaState(previous).beads),
                );
                vibrate([25, 30, 25]);
              }}
              className="min-h-12 rounded-lg border border-brand-300 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-50 dark:hover:bg-brand-500/10"
            >
              Complete mala
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-slate-300 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <RotateCcw size={14} aria-hidden="true" /> Reset
            </button>
          </div>

          <dl className="mt-5 grid gap-2 rounded-xl bg-amber-50 p-4 text-xs dark:bg-amber-500/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              {panchang.dateContext}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Tithi</dt>
                <dd className="font-semibold">{panchang.tithi}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Nakshatra</dt>
                <dd className="font-semibold">{panchang.nakshatra}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Moon</dt>
                <dd className="font-semibold">{panchang.moonPhase}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Sunrise</dt>
                <dd className="font-semibold">{panchang.sunrise}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Sunset</dt>
                <dd className="font-semibold">{panchang.sunset}</dd>
              </div>
            </div>
            <dt className="sr-only">Preview note</dt>
            <dd className="text-[11px] text-slate-500">{panchang.note}</dd>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <p className="max-w-md text-[11px] leading-5 text-slate-500">
          Full app: 159 mantras, Vedic clock, Sankalp text, Kundli and scripture reader.
        </p>
        <a
          href={getAppUrl('jap')}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-brand-300 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-50 dark:hover:bg-brand-500/10"
        >
          {siteCopy.widgets.jap.cta} <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jap-reset-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h4 id="jap-reset-title" className="text-lg font-bold">
              Reset this counter?
            </h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Your current bead total will return to zero. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirm}
                className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setTotal(0);
                  closeConfirm();
                }}
                className="min-h-11 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
