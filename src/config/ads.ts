export type AdKind = 'leaderboard' | 'in-article' | 'sidebar' | 'mobile';

const SLOT_ENV: Record<AdKind, string | undefined> = {
  leaderboard: import.meta.env.VITE_AD_SLOT_LEADERBOARD,
  'in-article': import.meta.env.VITE_AD_SLOT_INARTICLE,
  sidebar: import.meta.env.VITE_AD_SLOT_SIDEBAR,
  mobile: import.meta.env.VITE_AD_SLOT_MOBILE,
};

export const adsenseClient = (import.meta.env.VITE_ADSENSE_PUB_ID ?? '').trim();

export function getAdSlot(kind: AdKind): string {
  return (SLOT_ENV[kind] ?? '').trim();
}

export function isAdsConfigured(kind: AdKind = 'leaderboard'): boolean {
  return /^ca-pub-\d{16}$/.test(adsenseClient) && getAdSlot(kind).length > 0;
}
