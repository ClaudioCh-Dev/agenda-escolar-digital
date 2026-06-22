export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  fontFamily: 'Nunito_400Regular',
  fontFamilyMedium: 'Nunito_600SemiBold',
  fontFamilyBold: 'Nunito_700Bold',
  fontFamilyBlack: 'Nunito_900Black',
  sizes: {
    xs: 10,
    sm: 11,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    title: 22,
    hero: 24,
  },
} as const;

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  primaryMuted: string;
  primaryMutedText: string;
  primaryShadow: string;
  primaryShadowSm: string;
  primaryDashed: string;
  muted: string;
  mutedForeground: string;
  border: string;
  destructive: string;
  overlay: string;
  summaryBg: string;
  summaryBorder: string;
  summaryShadow: string;
  calFestivo: string;
  calFestivoBg: string;
  calExamen: string;
  calExamenBg: string;
  calReunion: string;
  calReunionBg: string;
  calActuacion: string;
  calActuacionBg: string;
  calEvento: string;
  calEventoBg: string;
  ctaGradient: [string, string];
  heroGradient: [string, string];
}

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  isDark: boolean;
}
