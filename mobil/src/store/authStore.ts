import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Child, User } from '@/types';
import { login as authLogin, logout as authLogout, restoreAuthSession } from '@/services/auth.service';
import { queryClient } from '@/queries/queryClient';

interface AuthState {
  user: User | null;
  selectedSection: string;
  selectedChild: Child | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedSection: (section: string) => void;
  setSelectedChild: (child: Child | null) => void;
  restoreSession: () => Promise<void>;
  setHydrated: () => void;
}

function applyUserDefaults(user: User) {
  return {
    user,
    selectedSection: user.sections?.[0] ?? '',
    selectedChild: user.children?.[0] ?? null,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      selectedSection: '',
      selectedChild: null,
      isLoading: false,
      isHydrated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const loggedUser = await authLogin({ email, password });
          set({ ...applyUserDefaults(loggedUser), isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await authLogout();
        queryClient.clear();
        set({ user: null, selectedSection: '', selectedChild: null });
      },

      setSelectedSection: (section) => set({ selectedSection: section }),

      setSelectedChild: (child) => set({ selectedChild: child }),

      restoreSession: async () => {
        const { user: persistedUser } = get();
        if (!persistedUser) return;

        set({ isLoading: true });
        try {
          const sessionUser = await restoreAuthSession(persistedUser);
          if (sessionUser) {
            set({
              ...applyUserDefaults(sessionUser),
              isLoading: false,
            });
          } else {
            queryClient.clear();
            set({ user: null, selectedSection: '', selectedChild: null, isLoading: false });
          }
        } catch {
          queryClient.clear();
          set({ user: null, selectedSection: '', selectedChild: null, isLoading: false });
        }
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        selectedSection: state.selectedSection,
        selectedChild: state.selectedChild,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
