export type ConsentLevel = 'personalized' | 'essential';

const STORAGE_KEY = 'softsutra-consent';

export function getConsent(): ConsentLevel | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'personalized' || value === 'essential' ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(level: ConsentLevel): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, level);
  } catch {
    /* storage can be disabled; continue with in-memory state */
  }
  window.dispatchEvent(new CustomEvent<ConsentLevel>('softsutra:consent', { detail: level }));
}

function requiresConsentRegion(): boolean {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return /^(Europe\/|Etc\/GMT|Atlantic\/Reykjavik)/.test(zone);
  } catch {
    return false;
  }
}

export function mayLoadPersonalizedAds(): boolean {
  const consent = getConsent();
  if (consent === 'personalized') return true;
  if (consent === 'essential') return false;
  return !requiresConsentRegion();
}
