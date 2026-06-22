import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function Toggle({ value, onChange }: ToggleProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: value ? theme.colors.primary : theme.colors.muted,
        justifyContent: 'center',
        paddingHorizontal: 2,
      }}
    >
      <View style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#fff',
        alignSelf: value ? 'flex-end' : 'flex-start',
      }} />
    </Pressable>
  );
}
