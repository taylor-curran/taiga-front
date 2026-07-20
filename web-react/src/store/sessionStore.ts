import { create } from 'zustand';

export type SessionState = {
  /** Stub until auth is ported; guards read this flag only. */
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: true,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));
