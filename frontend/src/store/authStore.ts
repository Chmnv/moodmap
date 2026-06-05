import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SpotifyUser } from '../types/spotify';

interface AuthState {
  token: string | null;
  user: SpotifyUser | null;
  setToken: (token: string) => void;
  setUser: (user: SpotifyUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'moodmap-auth' },
  ),
);
