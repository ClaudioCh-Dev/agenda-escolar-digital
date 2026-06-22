import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors } from './dark';
import { lightColors } from './light';
import { spacing, radii, typography, type Theme } from './tokens';
import { createCommonStyles } from './styles';

const STORAGE_KEY = '@agenda/theme-mode';

interface ThemeContextValue {
  theme: Theme;
  styles: ReturnType<typeof createCommonStyles>;
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(value => {
      if (value === 'dark') setIsDark(true);
    });
  }, []);

  const setDarkMode = useCallback((value: boolean) => {
    setIsDark(value);
    AsyncStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode(!isDark);
  }, [isDark, setDarkMode]);

  const theme = useMemo<Theme>(() => ({
    colors: isDark ? darkColors : lightColors,
    spacing,
    radii,
    typography,
    isDark,
  }), [isDark]);

  const styles = useMemo(() => createCommonStyles(theme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, styles, isDark, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
