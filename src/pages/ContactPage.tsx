import { Mail, Send } from 'lucide-react';
import { type FormEvent, type JSX, useState } from 'react';
import { z } from 'zod';
import { AdSlot } from '../components/ads/AdSlot';
import { founderEmail, getSupportEmail } from '../config/contact';
import { kvSet } from '../db/local';
import { getLegal, resolveCopy } from '../lib/content';
import { usePageMeta } from '../lib/seo';
import { vibrate } from '../services/platform';
import type { LegalData } from '../types/content';

const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter at least 2 characters.').max(80),
  email: z.string().trim().email('Enter a valid email address.'),
  category: z.enum(['product', 'privacy', 'partnership', 'other']),
  message: z.string().trim().min(10, 'Please write at least 10 characters.').max(2000),
  honeypot: z.string().max(0),
});

type Inquiry = z.infer<typeof inquirySchema>;
const EMPTY: Inquiry = { name: '', email: '', category: 'product', message: '', honeypot: '' };

export function ContactPage(): JSX.Element {
  const doc = getLegal('contact') as LegalData['contact'];
  usePageMeta('Contact AppTray Labs | Support & Partnerships', doc.lead, '/contact');
  const [form, setForm] = useState<Inquiry>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    await kvSet(`inquiry:${Date.now()}`, { ...parsed.data, createdAt: new Date().toISOString() });
    setStatus('Saved on this device. For guaranteed delivery, email one of the addresses above.');
    setForm(EMPTY);
    vibrate(12);
  };

  const field = (key: keyof Inquiry, value: string) => setForm((previous) => ({ ...previous, [key]: value }));

  return (
    <article>
      <header className="rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-50">
          AppTray Labs · Contact desk
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{doc.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{resolveCopy(doc.lead)}</p>
      </header>

      <section aria-labelledby="direct-addresses" className="mt-8 grid gap-4 sm:grid-cols-2">
        <h2 id="direct-addresses" className="sr-only">
          Direct email addresses
        </h2>
        {[founderEmail, getSupportEmail()].map((email) => (
          <a
            key={email}
            href={`mailto:${email}`}
            className="flex min-h-16 items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 text-sm font-semibold text-brand-700 hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/40 dark:text-brand-50"
          >
            <Mail size={18} aria-hidden="true" /> <span className="break-all">{email}</span>
          </a>
        ))}
      </section>

      <AdSlot kind="in-article" className="mt-8" />

      <section
        aria-labelledby="inquiry-form"
        className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/40"
      >
        <h2 id="inquiry-form" className="text-xl font-bold">
          Send an inquiry
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          {doc.responseTime} The form validates locally and stores a copy on this device.
        </p>

        <form onSubmit={(event) => void submit(event)} className="mt-5 grid gap-4" noValidate>
          <label className="grid gap-1 text-sm font-medium">
            Your name
            <input
              value={form.name}
              onChange={(event) => field('name', event.target.value)}
              autoComplete="name"
              className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) => field('email', event.target.value)}
              autoComplete="email"
              className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Topic
            <select
              value={form.category}
              onChange={(event) => field('category', event.target.value as Inquiry['category'])}
              className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="product">Product feedback</option>
              <option value="privacy">Privacy request</option>
              <option value="partnership">Partnership / advertising</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className="hidden" aria-hidden="true">
            <label>
              Leave this field empty
              <input
                value={form.honeypot}
                onChange={(event) => field('honeypot', event.target.value)}
                tabIndex={-1}
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-medium">
            Message
            <textarea
              value={form.message}
              onChange={(event) => field('message', event.target.value)}
              rows={5}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            {errors.message && <span className="text-xs text-red-600">{errors.message}</span>}
          </label>
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 active:scale-95"
          >
            <Send size={16} aria-hidden="true" /> Save inquiry locally
          </button>
          {status && (
            <p
              role="status"
              className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              {status}
            </p>
          )}
        </form>
      </section>

      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-lg font-bold">{resolveCopy(section.heading)}</h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 30)}
              className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400"
            >
              {resolveCopy(paragraph)}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
