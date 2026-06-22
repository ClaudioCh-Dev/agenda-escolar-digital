import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';

type Props = {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  title: string;
  message: string;
};

function PulseRing({ delay, color }: { delay: number; color: string }) {
  const scale = useSharedValue(0.75);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.75, { duration: 0 }),
          withTiming(2.1, { duration: 1400, easing: Easing.out(Easing.cubic) }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.45, { duration: 0 }),
          withTiming(0, { duration: 1400, easing: Easing.out(Easing.cubic) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: 112,
          height: 112,
          borderRadius: 56,
          borderWidth: 2,
          borderColor: color,
        },
        ringStyle,
      ]}
    />
  );
}

export function CreateSuccessCelebration({
  Icon,
  iconBg,
  iconColor,
  accentColor,
  title,
  message,
}: Props) {
  const { theme } = useTheme();
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(-14);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(18);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 11, stiffness: 170 });
    iconRotate.value = withSpring(0, { damping: 13, stiffness: 150 });
    textOpacity.value = withDelay(300, withTiming(1, { duration: 420 }));
    textTranslateY.value = withDelay(300, withSpring(0, { damping: 16, stiffness: 130 }));
    badgeScale.value = withDelay(480, withSpring(1, { damping: 9, stiffness: 220 }));
  }, [badgeScale, iconRotate, iconScale, textOpacity, textTranslateY]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }, { rotate: `${iconRotate.value}deg` }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
      <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
        <PulseRing delay={0} color={accentColor} />
        <PulseRing delay={480} color={accentColor} />

        <Animated.View style={iconStyle}>
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: 36,
              backgroundColor: iconBg,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
              elevation: 10,
            }}
          >
            <Icon size={48} color={iconColor} strokeWidth={2} />
          </View>

          <Animated.View
            style={[
              {
                position: 'absolute',
                right: -4,
                bottom: -4,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#10CDA0',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: theme.colors.background,
              },
              badgeStyle,
            ]}
          >
            <Check size={18} color="#fff" strokeWidth={3} />
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View style={[{ alignItems: 'center' }, textStyle]}>
        <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 24, color: theme.colors.foreground, textAlign: 'center' }}>
          {title}
        </Text>
        <Text
          style={{
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 14,
            color: theme.colors.mutedForeground,
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}
