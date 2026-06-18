import { View, ScrollView, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  padded?: boolean;
}

export function Screen({ children, scroll = true, style, padded = false }: ScreenProps) {
  const { theme, styles } = useTheme();
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 100,
        ...(padded
          ? {
              paddingHorizontal: theme.spacing.xl,
              paddingTop: theme.spacing.lg,
            }
          : {}),
      }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, padded ? { paddingHorizontal: theme.spacing.lg } : undefined]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top']}>
      {content}
    </SafeAreaView>
  );
}
