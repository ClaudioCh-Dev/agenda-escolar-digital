import { View, Text, Pressable } from 'react-native';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Dropdown, type DropdownItem } from '@/components/features/Dropdown';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  unreadNotifications?: number;
  dropdownItems?: DropdownItem[];
  selectedDropdownId?: string;
  onDropdownSelect?: (id: string) => void;
  dropdownPlaceholder?: string;
  rightAction?: React.ReactNode;
  /** Sin borde inferior; usar dentro de un contenedor card unificado */
  embedded?: boolean;
}

export function TopBar({
  title,
  showBack,
  onBack,
  unreadNotifications = 0,
  dropdownItems,
  selectedDropdownId,
  onDropdownSelect,
  dropdownPlaceholder,
  rightAction,
  embedded,
}: TopBarProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.card,
        borderBottomWidth: embedded ? 0 : 1,
        borderBottomColor: theme.colors.border,
        zIndex: embedded ? undefined : 10,
        elevation: embedded ? undefined : 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          {showBack && (
            <Pressable
              onPress={handleBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 16,
                backgroundColor: theme.colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={20} color={theme.colors.mutedForeground} />
            </Pressable>
          )}
          <Text
            numberOfLines={1}
            style={{
              fontFamily: theme.typography.fontFamilyBlack,
              fontSize: showBack ? theme.typography.sizes.xxl : theme.typography.sizes.title,
              color: theme.colors.foreground,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Text>
          {dropdownItems && selectedDropdownId && onDropdownSelect && (
            <View style={{ flexShrink: 0 }}>
              <Dropdown
                items={dropdownItems}
                selectedId={selectedDropdownId}
                onSelect={onDropdownSelect}
                placeholder={dropdownPlaceholder}
              />
            </View>
          )}
        </View>

        {rightAction ?? (
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
            <Bell size={20} color={theme.colors.mutedForeground} />
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
        )}
      </View>
    </View>
  );
}
