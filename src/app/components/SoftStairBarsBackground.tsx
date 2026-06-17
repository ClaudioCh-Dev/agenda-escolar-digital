type Bar = {
  left: string;
  top: string;
  width: number;
  height: string;
  opacity: number;
};

const BARS: Bar[] = [
  { left: '58%', top: '-18%', width: 112, height: '135%', opacity: 0.42 },
  { left: '68%', top: '-4%', width: 96, height: '125%', opacity: 0.34 },
  { left: '77%', top: '10%', width: 82, height: '112%', opacity: 0.27 },
  { left: '86%', top: '24%', width: 68, height: '98%', opacity: 0.21 },
  { left: '94%', top: '38%', width: 54, height: '82%', opacity: 0.15 },
];

const TOP_RIGHT_ACCENT: Bar[] = [
  { left: '92%', top: '-24%', width: 96, height: '58%', opacity: 0.38 },
  { left: '82%', top: '-16%', width: 78, height: '50%', opacity: 0.3 },
  { left: '72%', top: '-8%', width: 64, height: '42%', opacity: 0.22 },
];

const BOTTOM_LEFT_ACCENT: Bar[] = [
  { left: '6%', top: '28%', width: 112, height: '95%', opacity: 0.42 },
  { left: '15%', top: '42%', width: 96, height: '82%', opacity: 0.34 },
  { left: '24%', top: '54%', width: 82, height: '72%', opacity: 0.27 },
  { left: '32%', top: '66%', width: 68, height: '62%', opacity: 0.21 },
  { left: '40%', top: '76%', width: 54, height: '52%', opacity: 0.15 },
];

function renderBar(bar: Bar, key: number) {
  return (
    <div
      key={key}
      style={{
        position: 'absolute',
        left: bar.left,
        top: bar.top,
        width: bar.width,
        height: bar.height,
        opacity: bar.opacity,
        transform: 'translateX(-50%)',
        background:
          'linear-gradient(180deg, var(--primary-muted) 0%, color-mix(in srgb, var(--primary-muted) 45%, transparent) 38%, transparent 78%)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent 0%, black 22%, black 78%, transparent 100%)',
        maskImage:
          'linear-gradient(90deg, transparent 0%, black 22%, black 78%, transparent 100%)',
        filter: 'blur(10px)',
      }}
    />
  );
}

interface SoftStairBarsBackgroundProps {
  topRightAccent?: boolean;
  bottomLeftAccent?: boolean;
}

export function SoftStairBarsBackground({
  topRightAccent = false,
  bottomLeftAccent = false,
}: SoftStairBarsBackgroundProps) {
  let key = 0;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {BARS.map(bar => renderBar(bar, key++))}
      {topRightAccent && TOP_RIGHT_ACCENT.map(bar => renderBar(bar, key++))}
      {bottomLeftAccent && BOTTOM_LEFT_ACCENT.map(bar => renderBar(bar, key++))}
    </div>
  );
}
