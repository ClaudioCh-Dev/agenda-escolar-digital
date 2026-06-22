import { TextInput, View, Text, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { theme } = useTheme();
  return (
    <View>
      {label && <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground, marginBottom: 8 }}>{label}</Text>}
      <TextInput
        placeholderTextColor={theme.colors.mutedForeground}
        style={[{
          backgroundColor: theme.colors.card,
          color: theme.colors.foreground,
          borderWidth: error ? 2 : 1.5,
          borderColor: error ? theme.colors.destructive : theme.colors.border,
          borderRadius: theme.radii.lg,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontFamily: theme.typography.fontFamilyMedium,
          fontSize: 14,
        }, style]}
        {...props}
      />
      {error && <Text style={{ color: theme.colors.destructive, fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

export function TextArea({ label, error, style, ...props }: InputProps) {
  const { theme } = useTheme();
  return (
    <View>
      {label && <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground, marginBottom: 8 }}>{label}</Text>}
      <TextInput
        multiline
        textAlignVertical="top"
        placeholderTextColor={theme.colors.mutedForeground}
        style={[{
          backgroundColor: theme.colors.card,
          color: theme.colors.foreground,
          borderWidth: error ? 2 : 1.5,
          borderColor: error ? theme.colors.destructive : theme.colors.border,
          borderRadius: theme.radii.lg,
          paddingHorizontal: 16,
          paddingVertical: 14,
          minHeight: 100,
          fontFamily: theme.typography.fontFamilyMedium,
          fontSize: 14,
        }, style]}
        {...props}
      />
      {error && <Text style={{ color: theme.colors.destructive, fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}
