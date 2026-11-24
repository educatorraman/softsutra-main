import { X } from 'lucide-react';
import { useState } from 'react';
import { siteCopy } from '../../lib/content';
import { AdSlot } from '../ads/AdSlot';

export function MobileStickyAd(): React.JSX.Element | null {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200 bg-white/95 px-2 pt-1 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label={siteCopy.chrome.adHide}
        className="absolute right-2 top-1 z-10 grid size-11 place-items-center rounded-full bg-white/90 text-slate-500 shadow dark:bg-slate-900/90"
      >
        <X size={16} aria-hidden="true" />
      </button>
      <AdSlot kind="mobile" className="!my-0" />
    </div>
  );
}
