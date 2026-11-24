import { createContext, type JSX, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { isStandaloneMode } from '../services/platform';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

interface InstallValue {
  available: boolean;
  standalone: boolean;
  dismissed: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

const InstallContext = createContext<InstallValue | null>(null);

export function InstallProvider({ children }: { children: ReactNode }): JSX.Element {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [standalone, setStandalone] = useState(() => isStandaloneMode());

  useEffect(() => {
    const capture = (candidate: Event) => setEvent(candidate as InstallEvent);
    window.addEventListener('beforeinstallprompt', capture);
    const update = () => setStandalone(isStandaloneMode());
    window.addEventListener('appinstalled', update);
    return () => {
      window.removeEventListener('beforeinstallprompt', capture);
      window.removeEventListener('appinstalled', update);
    };
  }, []);

  const value = useMemo<InstallValue>(
    () => ({
      available: Boolean(event) && !standalone,
      standalone,
      dismissed,
      install: async () => {
        if (!event) return;
        await event.prompt();
        await event.userChoice.catch(() => ({ outcome: 'dismissed' as const }));
        setEvent(null);
      },
      dismiss: () => setDismissed(true),
    }),
    [event, standalone, dismissed],
  );

  return <InstallContext.Provider value={value}>{children}</InstallContext.Provider>;
}

export function useInstall(): InstallValue {
  const context = useContext(InstallContext);
  if (!context) throw new Error('useInstall must be used inside InstallProvider');
  return context;
}
