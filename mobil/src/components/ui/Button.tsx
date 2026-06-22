import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({ label, onPress, variant = 'primary', disabled, style, icon }: ButtonProps) {
  const { theme } = useTheme();

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.base, { opacity: disabled ? 0.5 : pressed ? 0.9 : 1 }, style]}>
        <LinearGradient colors={theme.colors.ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          {icon}
          <Text style={[styles.label, { color: '#fff', fontFamily: theme.typography.fontFamilyBold }]}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const bg = variant === 'destructive' ? theme.colors.destructive
    : variant === 'secondary' ? theme.colors.muted
    : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles.solid,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, {
        color: variant === 'destructive' ? '#fff' : theme.colors.foreground,
        fontFamily: theme.typography.fontFamilyBold,
      }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 16, overflow: 'hidden' },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 20 },
  solid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 20 },
  label: { fontSize: 16 },
});
