import { View, Text, Pressable } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import type { Child } from '@/types';
import { Dropdown } from '@/components/features/Dropdown';
import { SectionDropdown } from '@/components/features/SectionDropdown';
import { buildChildDropdownItems } from '@/utils/childPicker';

interface HomeTopBarProps {
  title?: string;
  unreadNotifications: number;
  sections?: string[];
  selectedSection?: string;
  onSelectSection?: (section: string) => void;
  childList?: Child[];
  selectedChild?: Child;
  onSelectChild?: (child: Child) => void;
}

export function HomeTopBar({
  title = 'Inicio',
  unreadNotifications,
  sections,
  selectedSection,
  onSelectSection,
  childList,
  selectedChild,
  onSelectChild,
}: HomeTopBarProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const showSectionPicker =
    !!sections?.length && !!selectedSection && !!onSelectSection && sections.length > 0;

  const childItems = childList ? buildChildDropdownItems(childList) : [];
  const showChildPicker =
    !!childList?.length && !!selectedChild && !!onSelectChild && childItems.length > 1;

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        zIndex: 10,
        elevation: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontFamily: theme.typography.fontFamilyBlack,
              fontSize: theme.typography.sizes.title,
              color: theme.colors.foreground,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Text>
          {showSectionPicker && (
            <SectionDropdown
              sections={sections}
              selectedSection={selectedSection}
              onSelectSection={onSelectSection}
            />
          )}
          {showChildPicker && (
            <Dropdown
              items={childItems}
              selectedId={selectedChild.id}
              onSelect={id => {
                const child = childList!.find(c => c.id === id);
                if (child) onSelectChild!(child);
              }}
            />
          )}
        </View>

        <Pressable
          onPress={() => router.push('/notificaciones')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 16,
            backgroundColor: theme.colors.muted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={20} color={theme.colors.mutedForeground} strokeWidth={1.8} />
          {unreadNotifications > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: theme.colors.destructive,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
                borderWidth: 2,
                borderColor: theme.colors.card,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 9, fontFamily: theme.typography.fontFamilyBold }}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
