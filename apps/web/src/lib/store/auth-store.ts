import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@autolounge/shared';

export type AuthStatus = 'idle' | 'anonymous' | 'authenticated';

export interface AuthState {
  user: User | null;
  token: string | null;
  /** `idle` until the persisted state has been read on the client */
  status: AuthStatus;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  setStatus: (status: AuthStatus) => void;
}

export const AUTH_STORAGE_KEY = 'autolounge_auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      status: 'idle',
      login: (user, token) => set({ user, token, status: 'authenticated' }),
      logout: () => set({ user: null, token: null, status: 'anonymous' }),
      updateUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
      setStatus: (status) => set({ status }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, token: s.token }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setStatus(state.token && state.user ? 'authenticated' : 'anonymous');
      },
    }
  )
);

/** Legacy-compatible hook: `{ state, login, logout, updateUser }` plus flat helpers. */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const status = useAuthStore((s) => s.status);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'idle';

  return {
    state: { user, token, isAuthenticated, isLoading, status },
    user,
    token,
    status,
    isAuthenticated,
    isLoading,
    isAdmin: isAuthenticated && user?.role === 'admin',
    login,
    logout,
    updateUser,
  };
}

/** Non-hook access for the API client */
export const getAuthToken = () =>
  typeof window === 'undefined' ? null : useAuthStore.getState().token;
