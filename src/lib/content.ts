import { founderEmail, getSupportEmail } from '../config/contact';
import { resolveTokens } from '../config/domain';
import appsJson from '../data/apps.json';
import editorialJson from '../data/editorialGuides.json';
import faqsJson from '../data/faqs.json';
import legalJson from '../data/legal.json';
import previewsJson from '../data/previews.json';
import siteCopyJson from '../data/siteCopy.json';
import type { AppMeta, EditorialGuide, Faq, LegalData, PreviewData, SiteCopy } from '../types/content';

export const apps = appsJson as AppMeta[];
export const previews = previewsJson as PreviewData;
export const editorialGuides = editorialJson as Record<string, EditorialGuide>;
export const rawFaqs = faqsJson as Record<string, Faq[]>;
export const legalRaw = legalJson as unknown as LegalData;
export const siteCopy = siteCopyJson as SiteCopy;

export function resolveCopy(text: string): string {
  return resolveTokens(text, getSupportEmail(), founderEmail);
}

export function getApp(key: string): AppMeta | undefined {
  return apps.find((app) => app.key === key);
}

export function getGuide(key: string): EditorialGuide | undefined {
  return editorialGuides[key];
}

export function getFaqs(key: string): Faq[] {
  return rawFaqs[key] ?? [];
}

export function allFaqs(): Array<Faq & { category: string }> {
  return Object.entries(rawFaqs).flatMap(([category, items]) =>
    items.map((item) => ({
      category,
      question: resolveCopy(item.question),
      answer: resolveCopy(item.answer),
    })),
  );
}

export function getLegal(key: keyof LegalData): LegalData[typeof key] {
  return legalRaw[key];
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
