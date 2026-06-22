import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme';
import { IllustrationSvg } from '@/components/ui/IllustrationSvg';
import { TopBar } from '@/components/layout/TopBar';

export function VistaEnConstruccionScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string }>();
  const title = typeof params.title === 'string' ? params.title : 'Sección';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar title={title} showBack onBack={() => router.back()} unreadNotifications={0} rightAction={<View style={{ width: 40 }} />} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <IllustrationSvg name="underConstruction" height={280} style={{ marginBottom: 24 }} />
        <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 22, color: theme.colors.foreground }}>
          Vista en construcción
        </Text>
        <Text
          style={{
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 14,
            color: theme.colors.mutedForeground,
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 260,
          }}
        >
          Estamos trabajando en esta sección. Pronto estará disponible.
        </Text>
      </View>
    </View>
  );
}
