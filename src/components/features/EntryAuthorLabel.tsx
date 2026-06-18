import { Text } from 'react-native';
import type { Entry } from '@/types';
import { useTheme } from '@/theme';
import { getEntryAuthorRoleLabel } from '@/utils/entryAuthor';

interface EntryAuthorLabelProps {
  entry: Entry;
  fontSize?: number;
}

export function EntryAuthorLabel({ entry, fontSize = 11 }: EntryAuthorLabelProps) {
  const { theme } = useTheme();

  return (
    <Text
      numberOfLines={1}
      style={{ fontSize, color: theme.colors.mutedForeground, flexShrink: 1 }}
    >
      <Text style={{ fontFamily: theme.typography.fontFamilyBold }}>
        {getEntryAuthorRoleLabel(entry)}{' '}
      </Text>
      <Text style={{ fontFamily: theme.typography.fontFamilyMedium }}>
        {entry.author}
      </Text>
    </Text>
  );
}
