export function vibrate(pattern: number | number[] = 10): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* haptics are best effort */
  }
}

export async function shareText(
  title: string,
  text: string,
  url: string,
): Promise<'shared' | 'copied' | 'unavailable'> {
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title, text, url });
      return 'shared';
    }
  } catch {
    /* user cancelled or unsupported; fall through */
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      return 'copied';
    }
  } catch {
    /* clipboard blocked */
  }
  return 'unavailable';
}

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}
