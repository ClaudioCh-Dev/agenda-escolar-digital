import { View, type ViewProps } from 'react-native';
import { useTheme, cardShadow } from '@/theme';

export function Card({ style, children, ...props }: ViewProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[{
        backgroundColor: theme.colors.card,
        borderRadius: theme.radii.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
      }, cardShadow(theme), style]}
      {...props}
    >
      {children}
    </View>
  );
}
