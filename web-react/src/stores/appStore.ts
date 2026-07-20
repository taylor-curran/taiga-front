import { create } from 'zustand';

/**
 * Foundation store — no data fetching. Extend with slices as features are ported.
 */
export type AppUser = { id: number; username: string; email: string; fullName: string } | null;

export type AppState = {
  user: AppUser;
  /** Skeleton: used by the auth guard placeholder. */
  isAuthenticated: boolean;
  setUser: (user: AppUser) => void;
  setAuthenticated: (v: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: true,
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));
