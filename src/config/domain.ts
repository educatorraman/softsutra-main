/**
 * Domain-agnostic resolver. This is the ONLY file in src/ allowed to contain a
 * literal parent-domain fallback. All links, schema URLs and UI copy use these
 * helpers so the portal works unchanged on either active parent domain.
 */
export const APP_KEYS = ['exam', 'jap', 'music', 'calculator', 'speed', 'cafe'] as const;
export type AppKey = (typeof APP_KEYS)[number];

const DEFAULT_ROOT_DOMAIN = 'apptray.in';
const SUBDOMAINS: Record<AppKey, string> = {
  exam: 'exam',
  jap: 'jap',
  music: 'music',
  calculator: 'calculator',
  speed: 'speed',
  cafe: 'cafe',
};

function strip(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');
}

export function getRootDomain(): string {
  const override = strip(import.meta.env.VITE_ROOT_DOMAIN ?? '');
  if (override) return override;

  if (typeof window === 'undefined') return DEFAULT_ROOT_DOMAIN;
  const host = strip(window.location.hostname);
  const localOrPreview =
    !host ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.local') ||
    host.endsWith('.test') ||
    !host.includes('.');
  if (localOrPreview) return DEFAULT_ROOT_DOMAIN;

  const labels = host.split('.');
  return labels.length >= 2 ? labels.slice(-2).join('.') : DEFAULT_ROOT_DOMAIN;
}

export function getAppUrl(key: AppKey): string {
  return `https://${SUBDOMAINS[key]}.${getRootDomain()}`;
}

export function getPortalUrl(path = ''): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `https://${getRootDomain()}${clean === '/' ? '/' : clean}`;
}

/** Replaces runtime tokens in JSON copy: {{ROOT_DOMAIN}}, {{SUPPORT_EMAIL}}, {{FOUNDER_EMAIL}}. */
export function resolveTokens(text: string, supportEmail: string, founderEmail: string): string {
  return text
    .replaceAll('{{ROOT_DOMAIN}}', getRootDomain())
    .replaceAll('{{SUPPORT_EMAIL}}', supportEmail)
    .replaceAll('{{FOUNDER_EMAIL}}', founderEmail);
}
