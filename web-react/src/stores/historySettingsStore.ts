import { create } from 'zustand';

const LS_KEY = 'orderComments';

function readReverse(): boolean {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
  } catch {
    /* ignore */
  }
  return false;
}

type State = {
  orderCommentsReversed: boolean;
  setOrderCommentsReversed: (v: boolean) => void;
  toggleOrderComments: () => void;
};

export const useHistorySettingsStore = create<State>((set) => ({
  orderCommentsReversed: readReverse(),
  setOrderCommentsReversed: (v) => {
    try {
      localStorage.setItem(LS_KEY, String(v));
    } catch {
      /* ignore */
    }
    set({ orderCommentsReversed: v });
  },
  toggleOrderComments: () => {
    set((s) => {
      const next = !s.orderCommentsReversed;
      try {
        localStorage.setItem(LS_KEY, String(next));
      } catch {
        /* ignore */
      }
      return { orderCommentsReversed: next };
    });
  },
}));

export function getOrderCommentsStorageKey() {
  return LS_KEY;
}
