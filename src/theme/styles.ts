import { StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import type { Theme } from './tokens';

export function selectionStyle(theme: Theme, active: boolean): ViewStyle {
  if (active) {
    return {
      backgroundColor: theme.colors.primaryMuted,
      borderColor: 'transparent',
      borderWidth: 1.5,
    };
  }
  return {
    backgroundColor: theme.colors.muted,
    borderColor: 'transparent',
    borderWidth: 1.5,
  };
}

export function datePillStyle(theme: Theme, selected: boolean): ViewStyle {
  return {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: selected ? theme.colors.primaryDashed : theme.colors.border,
  };
}

export function filterPillStyle(theme: Theme, active: boolean): ViewStyle {
  return {
    backgroundColor: active ? theme.colors.primaryMuted : theme.colors.muted,
    borderWidth: 1.5,
    borderColor: 'transparent',
  };
}

export function cardShadow(theme: Theme): ViewStyle {
  return {
    shadowColor: theme.isDark ? '#000' : '#1A1740',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.28 : 0.06,
    shadowRadius: 12,
    elevation: 3,
  };
}

/** Mismo estilo que «Cerrar sesión» en Perfil */
export function mutedOutlineButtonStyle(theme: Theme, options?: { shadow?: boolean }): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(options?.shadow !== false ? cardShadow(theme) : {}),
  };
}

export function createCommonStyles(theme: Theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      fontFamily: theme.typography.fontFamilyBlack,
      fontSize: theme.typography.sizes.title,
      color: theme.colors.foreground,
    },
    body: {
      fontFamily: theme.typography.fontFamilyMedium,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.mutedForeground,
    },
    selectedText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamilyBold,
    } as TextStyle,
  });
}
