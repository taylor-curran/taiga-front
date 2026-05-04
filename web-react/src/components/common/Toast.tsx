import { create } from 'zustand';
import { useEffect } from 'react';
import clsx from 'clsx';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (message: string, type?: ToastType) => void;
  remove: (id: number) => void;
}

let _nextId = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add(message, type = 'info') {
    const id = ++_nextId;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  remove(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export function toast(message: string, type?: ToastType) {
  useToastStore.getState().add(message, type);
}

const typeClass: Record<ToastType, string> = {
  success: 'toast-success',
  error: 'toast-error',
  info: 'toast-info',
  warning: 'toast-warning',
};

function ToastItem({ item }: { item: ToastItem }) {
  const remove = useToastStore((s) => s.remove);

  useEffect(() => {
    const t = setTimeout(() => remove(item.id), 4000);
    return () => clearTimeout(t);
  }, [item.id, remove]);

  return (
    <div className={clsx(typeClass[item.type], 'relative pr-8')} role="alert">
      {item.message}
      <button
        className="absolute top-2 right-2 text-white/80 hover:text-white text-lg leading-none"
        onClick={() => remove(item.id)}
        aria-label="Dismiss"
      >
        {'\u00D7'}
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-toast flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} />
      ))}
    </div>
  );
}
