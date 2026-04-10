import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  tabInactive: string;
  shadow: string;
  danger: string;
};

const PALETTES: Record<ResolvedTheme, ThemeColors> = {
  light: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceSoft: '#F9FAFB',
    text: '#1C1C1E',
    textMuted: '#8E8E93',
    border: '#E5E7EB',
    primary: '#8B5CF6',
    primaryText: '#FFFFFF',
    tabInactive: '#8E8E93',
    shadow: '#000000',
    danger: '#FF3B30',
  },
  dark: {
    background: '#0F1115',
    surface: '#1A1D24',
    surfaceSoft: '#232734',
    text: '#F4F5F7',
    textMuted: '#A3A8B3',
    border: '#2F3442',
    primary: '#A78BFA',
    primaryText: '#0F1115',
    tabInactive: '#8A90A0',
    shadow: '#000000',
    danger: '#FF6B63',
  },
};

type ThemeContextValue = {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  resolvedTheme: ResolvedTheme;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const colorScheme = useColorScheme();

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (themePreference === 'light') {
      return 'light';
    }

    if (themePreference === 'dark') {
      return 'dark';
    }

    return colorScheme === 'dark' ? 'dark' : 'light';
  }, [colorScheme, themePreference]);

  const value = useMemo(
    () => ({
      themePreference,
      setThemePreference,
      resolvedTheme,
      colors: PALETTES[resolvedTheme],
    }),
    [resolvedTheme, themePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
