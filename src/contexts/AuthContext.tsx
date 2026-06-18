import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Child, User } from '@/types';
import { authService } from '@/services';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  selectedSection: string;
  selectedChild: Child | null;
  setSelectedSection: (section: string) => void;
  setSelectedChild: (child: Child | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login({ email, password });
      setUser(loggedUser);
      setSelectedSection(loggedUser.sections?.[0] ?? '');
      setSelectedChild(loggedUser.children?.[0] ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setSelectedSection('');
    setSelectedChild(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    selectedSection,
    selectedChild,
    setSelectedSection,
    setSelectedChild,
    login,
    logout,
  }), [user, isLoading, selectedSection, selectedChild, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
