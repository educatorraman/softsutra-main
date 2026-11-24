import { Calculator, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getAppUrl } from '../../config/domain';
import { calculateEmi, calculateGst } from '../../engine/finance';
import { useStoredState } from '../../hooks/useStoredState';
import { siteCopy } from '../../lib/content';

interface SavedInputs {
  mode: 'emi' | 'gst';
  principal: string;
  rate: string;
  months: string;
  amount: string;
  gstRate: string;
  gstMode: 'inclusive' | 'exclusive';
  split: 'intra' | 'inter';
}

const INITIAL: SavedInputs = {
  mode: 'emi',
  principal: '500000',
  rate: '8.5',
  months: '60',
  amount: '11800',
  gstRate: '18',
  gstMode: 'inclusive',
  split: 'intra',
};

const inputClass =
  'min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950';

export function CalculatorWidget(): React.JSX.Element {
  const [inputs, setInputs] = useStoredState<SavedInputs>('widget:calculator', INITIAL);
  const [tab, setTab] = useState<'emi' | 'gst'>(inputs.mode);

  const patch = <K extends keyof SavedInputs>(key: K, value: SavedInputs[K]) => {
    setInputs((previous) => ({ ...previous, [key]: value }));
  };

  const emi = useMemo(
    () =>
      calculateEmi({ principal: inputs.principal, annualRate: inputs.rate, months: Number(inputs.months) }),
    [inputs.principal, inputs.rate, inputs.months],
  );
  const gst = useMemo(
    () =>
      calculateGst({
        amount: inputs.amount,
        rate: inputs.gstRate,
        mode: inputs.gstMode,
        split: inputs.split,
      }),
    [inputs.amount, inputs.gstRate, inputs.gstMode, inputs.split],
  );

  return (
    <section
      data-ui-shield
      aria-labelledby="calculator-preview"
      className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
    >
      <header className="flex items-center gap-2">
        <Calculator size={18} className="text-brand-600 dark:text-brand-50" aria-hidden="true" />
        <h3 id="calculator-preview" className="text-lg font-bold">
          Try the exact-math calculator
        </h3>
      </header>
      <p className="mt-1 text-xs text-slate-500">{siteCopy.widgets.calculator.description}</p>

      <div role="tablist" aria-label="Calculator mode" className="mt-4 flex gap-2">
        {(['emi', 'gst'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={tab === mode}
            onClick={() => {
              setTab(mode);
              patch('mode', mode);
            }}
            className={`min-h-11 flex-1 rounded-lg text-sm font-semibold ${tab === mode ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
          >
            {mode === 'emi' ? 'Loan EMI' : 'GST split'}
          </button>
        ))}
      </div>

      {tab === 'emi' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs font-semibold">
            Principal (₹)
            <input
              inputMode="decimal"
              value={inputs.principal}
              onChange={(event) => patch('principal', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Annual rate (%)
            <input
              inputMode="decimal"
              value={inputs.rate}
              onChange={(event) => patch('rate', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Months
            <input
              inputMode="numeric"
              value={inputs.months}
              onChange={(event) => patch('months', event.target.value)}
              className={inputClass}
            />
          </label>
          <div className="rounded-xl bg-brand-50 p-4 sm:col-span-3 dark:bg-brand-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-50">
              Monthly EMI
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums text-slate-900 dark:text-white">₹{emi.emi}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <dt>Total payable</dt>
                <dd className="font-semibold">₹{emi.totalPayable}</dd>
              </div>
              <div>
                <dt>Total interest</dt>
                <dd className="font-semibold">₹{emi.totalInterest}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-semibold">
            Amount (₹)
            <input
              inputMode="decimal"
              value={inputs.amount}
              onChange={(event) => patch('amount', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            GST rate (%)
            <input
              inputMode="decimal"
              value={inputs.gstRate}
              onChange={(event) => patch('gstRate', event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Price mode
            <select
              value={inputs.gstMode}
              onChange={(event) => patch('gstMode', event.target.value as SavedInputs['gstMode'])}
              className={inputClass}
            >
              <option value="inclusive">Tax inclusive</option>
              <option value="exclusive">Tax exclusive</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Transaction
            <select
              value={inputs.split}
              onChange={(event) => patch('split', event.target.value as SavedInputs['split'])}
              className={inputClass}
            >
              <option value="intra">Within state · CGST + SGST</option>
              <option value="inter">Inter-state · IGST</option>
            </select>
          </label>
          <div className="rounded-xl bg-brand-50 p-4 sm:col-span-2 dark:bg-brand-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-50">
              Taxable value · ₹{gst.taxableValue}
            </p>
            <p className="mt-1 text-2xl font-black tabular-nums">₹{gst.totalAmount}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {gst.componentALabel} ₹{gst.componentA} · {gst.componentBLabel} ₹{gst.componentB}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <a
          href={getAppUrl('calculator')}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-brand-300 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-50 dark:hover:bg-brand-500/10"
        >
          {siteCopy.widgets.calculator.cta} <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
