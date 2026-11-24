import { ExternalLink, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { getAppUrl } from '../../config/domain';
import { useStoredState } from '../../hooks/useStoredState';
import { previews, siteCopy } from '../../lib/content';
import { vibrate } from '../../services/platform';

interface ExamState {
  category: 'national' | 'state';
  index: number;
  answered: number;
  correct: number;
}

const INITIAL: ExamState = { category: 'national', index: 0, answered: 0, correct: 0 };

export function ExamWidget(): React.JSX.Element {
  const [state, setState] = useStoredState<ExamState>('widget:exam', INITIAL);
  const [selected, setSelected] = useState<number | null>(null);
  const questions = previews.mcqs.filter((item) => item.category === state.category);
  const question = questions[state.index % questions.length];

  const answer = (option: number) => {
    if (selected !== null) return;
    setSelected(option);
    const isCorrect = option === question.answerIndex;
    setState((previous) => ({
      ...previous,
      answered: previous.answered + 1,
      correct: previous.correct + (isCorrect ? 1 : 0),
    }));
    vibrate(isCorrect ? 12 : [20, 30, 20]);
  };

  const next = () => {
    setSelected(null);
    setState((previous) => ({ ...previous, index: (previous.index + 1) % questions.length }));
  };

  return (
    <section
      data-ui-shield
      aria-labelledby="exam-preview"
      className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} className="text-brand-600 dark:text-brand-50" aria-hidden="true" />
          <h3 id="exam-preview" className="text-lg font-bold">
            Daily quick MCQ
          </h3>
        </div>
        <fieldset className="flex gap-2">
          <legend className="sr-only">Question category</legend>
          {(['national', 'state'] as const).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setSelected(null);
                setState((previous) => ({ ...previous, category, index: 0 }));
              }}
              aria-pressed={state.category === category}
              className={`min-h-11 rounded-lg px-3 text-xs font-bold uppercase tracking-wide ${state.category === category ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
            >
              {category}
            </button>
          ))}
        </fieldset>
      </header>

      <p className="mt-3 text-xs text-slate-500">{siteCopy.widgets.exam.description}</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{question.exam}</p>
      <p className="mt-1 text-sm font-semibold leading-6">{question.question}</p>

      <fieldset className="mt-4 grid gap-2 sm:grid-cols-2" disabled={selected !== null}>
        <legend className="sr-only">Answer options</legend>
        {question.options.map((option, index) => {
          const isAnswer = index === question.answerIndex;
          const isPick = index === selected;
          return (
            <label
              key={option}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${isPick && isAnswer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : isPick ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'border-slate-300 hover:border-brand-400 dark:border-slate-700'}`}
            >
              <input
                type="radio"
                name={`mcq-${question.id}`}
                checked={isPick}
                onChange={() => answer(index)}
                className="size-4 accent-brand-600"
              />
              {option}
              {selected !== null && isAnswer && (
                <span className="ml-auto text-xs font-bold text-emerald-700">✓</span>
              )}
            </label>
          );
        })}
      </fieldset>

      <div className="mt-4 min-h-[72px]" aria-live="polite">
        {selected !== null && (
          <div
            className={`rounded-xl p-3 text-xs leading-6 ${selected === question.answerIndex ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200'}`}
          >
            <strong>{selected === question.answerIndex ? 'Correct.' : 'Not quite.'}</strong>{' '}
            {question.explanation}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {state.correct} correct of {state.answered} answered
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={next}
            disabled={selected === null}
            className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold disabled:opacity-50 dark:border-slate-700"
          >
            Next question
          </button>
          <a
            href={getAppUrl('exam')}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {siteCopy.widgets.exam.cta} <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
