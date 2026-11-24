/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_ROOT_DOMAIN?: string;
  readonly VITE_ADSENSE_PUB_ID?: string;
  readonly VITE_AD_SLOT_LEADERBOARD?: string;
  readonly VITE_AD_SLOT_INARTICLE?: string;
  readonly VITE_AD_SLOT_SIDEBAR?: string;
  readonly VITE_AD_SLOT_MOBILE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  adsbygoogle?: unknown[];
  Capacitor?: { isNativePlatform?: () => boolean };
  beforeinstallprompt?: Event | null;
}
