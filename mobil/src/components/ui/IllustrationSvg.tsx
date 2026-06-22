import { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { getIllustrationUri, ILLUSTRATION_VIEWBOX, type IllustrationKey } from '@/constants/illustrations';
import { useTheme } from '@/theme';

type Props = {
  name: IllustrationKey;
  height?: number;
  maxWidth?: number;
  style?: ViewStyle;
};

export function IllustrationSvg({ name, height = 200, maxWidth = 300, style }: Props) {
  const { isDark } = useTheme();
  const uri = useMemo(() => getIllustrationUri(name, isDark), [name, isDark]);

  return (
    <View style={[{ width: '100%', maxWidth, height, marginBottom: 16 }, style]}>
      <SvgUri uri={uri} width="100%" height="100%" viewBox={ILLUSTRATION_VIEWBOX[name]} />
    </View>
  );
}
