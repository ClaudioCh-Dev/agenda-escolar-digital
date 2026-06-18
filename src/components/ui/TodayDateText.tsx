import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '@/theme';

function splitTodayPrefix(text: string): { hasToday: boolean; rest: string } {
  if (text.startsWith('Hoy · ')) return { hasToday: true, rest: text.slice(6) };
  if (text === 'Hoy') return { hasToday: true, rest: '' };
  return { hasToday: false, rest: text };
}

interface TodayDateTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  suffix?: string;
}

export function TodayDateText({ text, style, suffix }: TodayDateTextProps) {
  const { theme } = useTheme();
  const { hasToday, rest } = splitTodayPrefix(text);

  if (!hasToday) {
    return (
      <Text style={style}>
        {text}
        {suffix}
      </Text>
    );
  }

  return (
    <Text style={style}>
      <Text style={{ color: theme.colors.primary }}>Hoy</Text>
      {rest ? ` · ${rest}` : null}
      {suffix}
    </Text>
  );
}
