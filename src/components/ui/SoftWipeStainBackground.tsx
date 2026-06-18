import { useState } from 'react';
import { View, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Ellipse,
  Mask,
  G,
  Filter,
  FeGaussianBlur,
} from 'react-native-svg';
import { useTheme } from '@/theme';

type Stain = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  opacity: number;
};

const CENTER_STAIN: Stain = { cx: 52, cy: 38, rx: 46, ry: 38, opacity: 0.28 };

const TOP_RIGHT_STAIN: Stain = { cx: 88, cy: 14, rx: 34, ry: 28, opacity: 0.36 };

const BOTTOM_LEFT_STAIN: Stain = { cx: 14, cy: 82, rx: 40, ry: 36, opacity: 0.4 };

function stainEllipse(stain: Stain, layout: { width: number; height: number }) {
  return {
    cx: (stain.cx / 100) * layout.width,
    cy: (stain.cy / 100) * layout.height,
    rx: (stain.rx / 100) * layout.width,
    ry: (stain.ry / 100) * layout.height,
  };
}

function WipeStains({
  stains,
  layout,
  primaryMuted,
  isDark,
}: {
  stains: Stain[];
  layout: { width: number; height: number };
  primaryMuted: string;
  isDark: boolean;
}) {
  const { width, height } = layout;

  return (
    <>
      <Defs>
        <LinearGradient id="stainFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={primaryMuted} stopOpacity={isDark ? '0.8' : '1'} />
          <Stop offset="0.45" stopColor={primaryMuted} stopOpacity={isDark ? '0.4' : '0.55'} />
          <Stop offset="1" stopColor={primaryMuted} stopOpacity="0" />
        </LinearGradient>

        {/* Diagonal wipe: cloth passed through the center, stains remain in corners */}
        <LinearGradient id="clothWipeMask" x1="0.05" y1="0" x2="0.95" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="0.2" stopColor="#ffffff" stopOpacity="0.82" />
          <Stop offset="0.36" stopColor="#ffffff" stopOpacity="0.35" />
          <Stop offset="0.44" stopColor="#ffffff" stopOpacity="0.08" />
          <Stop offset="0.5" stopColor="#000000" stopOpacity="0" />
          <Stop offset="0.56" stopColor="#ffffff" stopOpacity="0.06" />
          <Stop offset="0.64" stopColor="#ffffff" stopOpacity="0.3" />
          <Stop offset="0.8" stopColor="#ffffff" stopOpacity="0.78" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0.92" />
        </LinearGradient>

        {!isDark && (
          <Filter id="stainBlur" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </Filter>
        )}

        <Mask id="wipeMask">
          <Rect x={0} y={0} width={width} height={height} fill="url(#clothWipeMask)" />
        </Mask>
      </Defs>

      <G mask="url(#wipeMask)">
        {stains.map((stain, index) => {
          const { cx, cy, rx, ry } = stainEllipse(stain, layout);
          return (
            <Ellipse
              key={`stain-${index}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="url(#stainFill)"
              {...(!isDark ? { filter: 'url(#stainBlur)' } : {})}
              opacity={isDark ? stain.opacity * 0.55 : stain.opacity}
            />
          );
        })}
      </G>
    </>
  );
}

interface SoftWipeStainBackgroundProps {
  topRightAccent?: boolean;
  bottomLeftAccent?: boolean;
}

export function SoftWipeStainBackground({
  topRightAccent = false,
  bottomLeftAccent = false,
}: SoftWipeStainBackgroundProps) {
  const { theme } = useTheme();
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== layout.width || height !== layout.height) {
      setLayout({ width, height });
    }
  };

  const stains = [
    CENTER_STAIN,
    ...(topRightAccent ? [TOP_RIGHT_STAIN] : []),
    ...(bottomLeftAccent ? [BOTTOM_LEFT_STAIN] : []),
  ];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={handleLayout}>
      {layout.width > 0 && layout.height > 0 && (
        <Svg width={layout.width} height={layout.height} style={StyleSheet.absoluteFill}>
          <WipeStains
            stains={stains}
            layout={layout}
            primaryMuted={theme.colors.primaryMuted}
            isDark={theme.isDark}
          />
        </Svg>
      )}
    </View>
  );
}
