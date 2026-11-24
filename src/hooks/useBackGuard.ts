import { useEffect, useRef } from 'react';

interface NativeAppPlugin {
  addListener?: (event: 'backButton', handler: () => void) => Promise<{ remove: () => void }>;
}

interface NativeCapacitor {
  Plugins?: { App?: NativeAppPlugin };
}

function getNativeApp(): NativeAppPlugin | undefined {
  if (typeof window === 'undefined') return undefined;
  const capacitor = (window as Window & { Capacitor?: NativeCapacitor }).Capacitor;
  return capacitor?.Plugins?.App;
}

/**
 * Pushes a history entry while an overlay is open so Android Back closes the
 * overlay first. Inside a Capacitor shell the hardware button may bypass the
 * WebView history stack, so the native App plugin is bridged as a second path.
 */
export function useBackGuard(open: boolean, close: () => void): void {
  const closed = useRef(false);

  useEffect(() => {
    if (!open) {
      closed.current = false;
      return;
    }
    const marker = { softsutraOverlay: true };
    window.history.pushState(marker, '', window.location.href);
    const onPop = () => {
      if (closed.current) return;
      closed.current = true;
      close();
    };
    window.addEventListener('popstate', onPop, { once: true });

    let listener: { remove: () => void } | undefined;
    const app = getNativeApp();
    if (app?.addListener) {
      void app.addListener('backButton', onPop).then((handle) => {
        listener = handle;
      });
    }

    return () => {
      window.removeEventListener('popstate', onPop);
      listener?.remove();
      if (window.history.state?.softsutraOverlay) window.history.back();
    };
  }, [open, close]);
}
