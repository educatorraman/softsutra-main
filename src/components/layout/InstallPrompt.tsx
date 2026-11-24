import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInstall } from '../../context/InstallContext';
import { siteCopy } from '../../lib/content';

export function InstallPrompt(): React.JSX.Element | null {
  const { available, standalone, dismissed, install, dismiss } = useInstall();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!available || standalone || dismissed) return;
    const timer = window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(dismiss, 350);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [available, standalone, dismissed, dismiss]);

  if (standalone || !available || dismissed) return null;

  const hide = () => {
    setLeaving(true);
    window.setTimeout(dismiss, 350);
  };

  return (
    <aside
      aria-label="Install SoftSutra"
      className={`safe-top fixed inset-x-0 top-0 z-[105] mx-auto max-w-xl border-b border-brand-200 bg-white px-4 py-3 shadow-lg transition-transform duration-300 dark:border-brand-500/30 dark:bg-slate-900 ${leaving ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="flex items-center gap-3">
        <Download size={20} className="shrink-0 text-brand-600" aria-hidden="true" />
        <p className="flex-1 text-sm">{siteCopy.chrome.install}</p>
        <button
          type="button"
          onClick={() => void install()}
          className="min-h-11 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white"
        >
          {siteCopy.chrome.installAction}
        </button>
        <button
          type="button"
          onClick={hide}
          aria-label={siteCopy.chrome.installDismiss}
          className="grid size-11 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
