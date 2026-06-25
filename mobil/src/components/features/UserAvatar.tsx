import { View, Text, Image, type ImageSourcePropType } from 'react-native';
import { useTheme } from '@/theme';

interface UserAvatarProps {
  name: string;
  initials: string;
  avatar?: string;
  fallbackSource?: ImageSourcePropType;
  size?: number;
  borderRadius?: number;
}

export function UserAvatar({
  name,
  initials,
  avatar,
  fallbackSource,
  size = 64,
  borderRadius = 24,
}: UserAvatarProps) {
  const { theme } = useTheme();

  if (avatar) {
    return (
      <Image
        source={{ uri: avatar }}
        accessibilityLabel={`Foto de perfil de ${name}`}
        style={{ width: size, height: size, borderRadius }}
      />
    );
  }

  if (fallbackSource) {
    return (
      <Image
        source={fallbackSource}
        accessibilityLabel={`Foto de perfil de ${name}`}
        style={{ width: size, height: size, borderRadius }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: theme.colors.foreground,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: theme.typography.fontFamilyBlack,
          fontSize: Math.round(size * 0.34),
          color: theme.colors.primaryForeground,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
