import { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Image, type LayoutRectangle, type ImageSourcePropType } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme, selectionStyle } from '@/theme';

export interface DropdownItem {
  id: string;
  label: string;
  subtitle?: string;
  initials?: string;
  color?: string;
  image?: ImageSourcePropType;
}

interface DropdownProps {
  items: DropdownItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder?: string;
}

export function Dropdown({ items, selectedId, onSelect, placeholder = 'Seleccionar' }: DropdownProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const triggerRef = useRef<View>(null);
  const selected = items.find(i => i.id === selectedId);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const closeMenu = () => {
    setOpen(false);
    setAnchor(null);
  };

  const renderAvatar = (item: DropdownItem, selectedState: boolean, size = 24) => {
    if (item.image) {
      return (
        <Image
          source={item.image}
          style={{
            width: size,
            height: size,
            borderRadius: 8,
          }}
        />
      );
    }

    if (!item.initials) return null;

    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          backgroundColor: selectedState ? theme.colors.primary : (item.color ?? theme.colors.primary),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontFamily: theme.typography.fontFamilyBlack, fontSize: size <= 24 ? 10 : 12 }}>
          {item.initials}
        </Text>
      </View>
    );
  };

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={{ alignSelf: 'flex-start' }}>
        <Pressable
          onPress={openMenu}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: theme.radii.md,
            backgroundColor: open ? theme.colors.primaryMuted : theme.colors.muted,
          }}
        >
          {selected && renderAvatar(selected, open)}
          <Text
            style={{
              fontFamily: theme.typography.fontFamilyBold,
              fontSize: 13,
              color: theme.colors.foreground,
            }}
          >
            {selected?.label ?? placeholder}
          </Text>
          <ChevronDown
            size={14}
            color={theme.colors.mutedForeground}
            style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
          />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={{ flex: 1 }} onPress={closeMenu}>
          {anchor && (
            <View
              style={{
                position: 'absolute',
                top: anchor.y + anchor.height + 8,
                left: anchor.x,
                width: anchor.width,
                backgroundColor: theme.colors.card,
                borderRadius: theme.radii.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
                overflow: 'hidden',
                maxHeight: 220,
                shadowColor: '#1A1740',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {items.map(item => {
                  const isSelected = item.id === selectedId;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        onSelect(item.id);
                        closeMenu();
                      }}
                      style={[
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                        },
                        isSelected ? selectionStyle(theme, true) : undefined,
                      ]}
                    >
                      {renderAvatar(item, isSelected)}
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: theme.typography.fontFamilyBold,
                          fontSize: 13,
                          color: theme.colors.foreground,
                          flexShrink: 1,
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}
