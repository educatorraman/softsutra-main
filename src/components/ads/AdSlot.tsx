import { useEffect, useState } from 'react';
import { type AdKind, adsenseClient, getAdSlot, isAdsConfigured } from '../../config/ads';
import { siteCopy } from '../../lib/content';
import { isNativeContainer, loadAdsense, pushAd } from '../../services/ads';
import { mayLoadPersonalizedAds } from '../../services/consent';

const HEIGHT: Record<AdKind, string> = {
  leaderboard: 'min-h-[90px]',
  'in-article': 'min-h-[280px]',
  sidebar: 'min-h-[600px]',
  mobile: 'min-h-[50px]',
};

interface AdSlotProps {
  kind: AdKind;
  className?: string;
}

/**
 * Fixed-geometry, zero-CLS ad wrapper. Falls back to a reserved, labelled
 * placeholder before approval, under ad blockers, or inside native containers.
 */
export function AdSlot({ kind, className = '' }: AdSlotProps) {
  const [active, setActive] = useState(false);
  const [native] = useState(() => isNativeContainer());

  useEffect(() => {
    const update = () => setActive(isAdsConfigured(kind) && mayLoadPersonalizedAds() && !native);
    update();
    window.addEventListener('AppTray Labs:consent', update);
    return () => window.removeEventListener('AppTray Labs:consent', update);
  }, [kind, native]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    void loadAdsense().then(() => {
      if (!cancelled) pushAd();
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const slot = getAdSlot(kind);
  const label = kind === 'sidebar' ? siteCopy.chrome.adSidebarLabel : siteCopy.chrome.adLabel;

  return (
    <aside
      className={`ad-frame my-6 ${className}`}
      aria-label={label}
      data-ad-kind={kind}
      data-ad-state={active ? 'live' : 'reserved'}
    >
      <span className="ad-label">{label}</span>
      <div
        className={`relative w-full overflow-hidden rounded-xl border border-dashed border-slate-300/70 bg-slate-100/60 dark:border-slate-700/70 dark:bg-slate-900/50 ${HEIGHT[kind]}`}
      >
        {!active && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center px-4 text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
            <span>
              {siteCopy.chrome.adReserved}
              <br />
              <span className="text-[10px]">{siteCopy.chrome.adGeometry}</span>
            </span>
          </div>
        )}
        {native && (
          <div
            className="absolute inset-0 grid place-items-center bg-slate-100 text-xs text-slate-500 dark:bg-slate-900"
            data-admob-unit-id={slot || 'pending'}
            data-admob-size={kind === 'leaderboard' ? 'BANNER' : 'MEDIUM_RECTANGLE'}
          >
            AdMob bridge · native container
          </div>
        )}
        {active && (
          <ins
            className="adsbygoogle absolute inset-0 block"
            style={{ display: 'block' }}
            data-ad-client={adsenseClient}
            data-ad-slot={slot}
            data-ad-format={kind === 'in-article' ? 'fluid' : 'auto'}
            data-ad-layout={kind === 'in-article' ? 'in-article' : undefined}
            data-full-width-responsive="true"
          />
        )}
      </div>
    </aside>
  );
}
