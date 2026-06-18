import { Image } from 'react-native';

export type IllustrationKey = 'underConstruction' | 'emptyAgenda';

const SOURCES = {
  underConstruction: {
    light: require('../../assets/illustrations/en-construccion-claro.svg'),
    dark: require('../../assets/illustrations/en-construccion-oscuro.svg'),
  },
  emptyAgenda: {
    light: require('../../assets/illustrations/sin-registros-claro.svg'),
    dark: require('../../assets/illustrations/sin-registros-oscuro.svg'),
  },
} as const;

export const ILLUSTRATION_VIEWBOX: Record<IllustrationKey, string> = {
  underConstruction: '0 0 500 500',
  emptyAgenda: '0 0 750 500',
};

export function getIllustrationUri(name: IllustrationKey, isDark: boolean): string {
  const source = isDark ? SOURCES[name].dark : SOURCES[name].light;
  return Image.resolveAssetSource(source).uri;
}
