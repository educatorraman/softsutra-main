interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="safe-bottom fixed bottom-20 left-1/2 z-[120] w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-sm text-white shadow-2xl lg:bottom-8"
    >
      {message}
    </div>
  );
}
