import { adsenseClient } from '../config/ads';

let loader: Promise<void> | null = null;

export function isNativeContainer(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = window.Capacitor;
  try {
    return (
      Boolean(cap?.isNativePlatform?.()) ||
      ['capacitor:', 'android-app:', 'file:'].includes(window.location.protocol)
    );
  } catch {
    return false;
  }
}

export function loadAdsense(): Promise<void> {
  if (loader) return loader;
  if (!adsenseClient || isNativeContainer()) return Promise.resolve();

  loader = new Promise<void>((resolve) => {
    try {
      const existing = document.querySelector<HTMLScriptElement>('script[data-softsutra-ads]');
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.softsutraAds = 'true';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`;
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => resolve(), { once: true });
      document.head.appendChild(script);
    } catch {
      resolve();
    }
  });
  return loader;
}

export function pushAd(): boolean {
  if (!adsenseClient || isNativeContainer()) return false;
  try {
    if (!window.adsbygoogle) window.adsbygoogle = [];
    window.adsbygoogle.push({});
    return true;
  } catch {
    return false;
  }
}
