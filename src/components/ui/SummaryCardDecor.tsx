import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

export function SummaryCardDecor() {
  const { theme } = useTheme();
  const color = theme.colors.primaryMuted;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: color,
          opacity: 0.45,
          top: -60,
          right: -40,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: color,
          opacity: 0.35,
          bottom: -30,
          left: -30,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: color,
          opacity: 0.3,
          top: 10,
          left: '40%',
        }}
      />
    </View>
  );
}
