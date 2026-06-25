import { useAuthStore } from './authStore';

export function useAuth() {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  const isHydrated = useAuthStore(s => s.isHydrated);
  const selectedSection = useAuthStore(s => s.selectedSection);
  const selectedChild = useAuthStore(s => s.selectedChild);
  const login = useAuthStore(s => s.login);
  const logout = useAuthStore(s => s.logout);
  const setSelectedSection = useAuthStore(s => s.setSelectedSection);
  const setSelectedChild = useAuthStore(s => s.setSelectedChild);
  const updateUser = useAuthStore(s => s.updateUser);

  return {
    user,
    isLoading,
    isHydrated,
    selectedSection,
    selectedChild,
    login,
    logout,
    setSelectedSection,
    setSelectedChild,
    updateUser,
  };
}

export { useAuthStore };
