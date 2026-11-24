interface SectionHeadingProps {
  id?: string;
  kicker: string;
  title: string;
  description?: string;
}

export function SectionHeading({ id, kicker, title, description }: SectionHeadingProps): React.JSX.Element {
  return (
    <header className="mb-8 max-w-3xl">
      {id && <span id={id} className="block scroll-mt-24" />}
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-50">
        {kicker}
      </p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
          {description}
        </p>
      )}
    </header>
  );
}
