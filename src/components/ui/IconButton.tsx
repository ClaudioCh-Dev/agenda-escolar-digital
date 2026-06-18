import { Pressable, View, Text, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function IconButton({ onPress, children, style }: IconButtonProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        width: 40,
        height: 40,
        borderRadius: 16,
        backgroundColor: theme.colors.muted,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      }, style]}
    >
      {children}
    </Pressable>
  );
}

export function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
      <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color }}>{label}</Text>
    </View>
  );
}
