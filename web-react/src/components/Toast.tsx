import { create } from 'zustand';
import { useEffect } from 'react';

export type ToastKind = 'info' | 'success' | 'error' | 'warning';
export interface Toast {
  id: number;
  kind: ToastKind;
  title?: string;
  message: string;
}

interface ToastState {
  items: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let counter = 1;

export const useToasts = create<ToastState>((set) => ({
  items: [],
  push: (t) => {
    const id = counter++;
    set((s) => ({ items: [...s.items, { ...t, id }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((x) => x.id !== id) })), 5000);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

const KIND_CLASSES: Record<ToastKind, string> = {
  info: 'border-sky-300 bg-sky-50 text-sky-800',
  success: 'border-taiga-300 bg-taiga-50 text-taiga-800',
  error: 'border-red-300 bg-red-50 text-red-800',
  warning: 'border-accent-300 bg-accent-50 text-accent-800',
};

export function ToastsHost() {
  const { items, dismiss } = useToasts();
  useEffect(() => {
    /* keep effect to silence linter — store handles auto dismiss */
  }, []);
  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2"
      data-testid="toasts"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded border px-4 py-3 text-sm shadow ${KIND_CLASSES[t.kind]}`}
          role="status"
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          <div className="flex items-start justify-between gap-3">
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-xs opacity-60 hover:opacity-100">×</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export const toast = {
  info: (message: string, title?: string) => useToasts.getState().push({ kind: 'info', message, title }),
  success: (message: string, title?: string) => useToasts.getState().push({ kind: 'success', message, title }),
  error: (message: string, title?: string) => useToasts.getState().push({ kind: 'error', message, title }),
  warning: (message: string, title?: string) => useToasts.getState().push({ kind: 'warning', message, title }),
};
