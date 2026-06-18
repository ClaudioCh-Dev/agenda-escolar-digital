import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, ChevronRight } from 'lucide-react-native';
import { useTheme, cardShadow } from '@/theme';

interface PendingAckBannerProps {
  count: number;
  onPress?: () => void;
}

export function PendingAckBanner({ count, onPress }: PendingAckBannerProps) {
  const { theme } = useTheme();

  if (count <= 0) return null;

  const label = count === 1
    ? '1 comunicado pendiente de confirmar'
    : `${count} comunicados pendientes de confirmar`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        marginBottom: 16,
        borderRadius: theme.radii.xl,
        overflow: 'hidden',
        opacity: pressed && onPress ? 0.92 : 1,
        ...cardShadow(theme),
      })}
    >
      <LinearGradient
        colors={theme.colors.ctaGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 16,
        }}
      >
        <AlertCircle size={26} color="#fff" strokeWidth={2.25} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: '#fff' }}>
            {label}
          </Text>
          <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            Revisá la lista y confirmá uno por uno
          </Text>
        </View>
        {onPress && <ChevronRight size={20} color="#fff" strokeWidth={2.5} />}
      </LinearGradient>
    </Pressable>
  );
}
