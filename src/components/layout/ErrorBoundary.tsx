import { Component, type ErrorInfo, type ReactNode } from 'react';
import { siteCopy } from '../../lib/content';

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    try {
      console.error('SoftSutra UI error', error, info.componentStack);
    } catch {
      /* logging unavailable */
    }
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <section className="mx-auto grid min-h-96 max-w-xl place-items-center px-4 text-center">
          <div>
            <h1 className="text-2xl font-bold">{siteCopy.chrome.errorTitle}</h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{siteCopy.chrome.errorText}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 min-h-11 rounded-lg bg-brand-600 px-5 font-semibold text-white"
            >
              {siteCopy.chrome.errorAction}
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
