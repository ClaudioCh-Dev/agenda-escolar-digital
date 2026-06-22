import { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal, type LayoutRectangle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme, selectionStyle } from '@/theme';
import type { Child } from '@/types';

interface ChildDropdownProps {
  childList: Child[];
  selectedChild: Child;
  onSelectChild: (child: Child) => void;
}

export function ChildDropdown({ childList, selectedChild, onSelectChild }: ChildDropdownProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const triggerRef = useRef<View>(null);

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

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={{ flexShrink: 0 }}>
        <Pressable
          onPress={openMenu}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: theme.radii.md,
            },
            selectionStyle(theme, open),
          ]}
        >
          <Text
            style={{
              fontFamily: theme.typography.fontFamilyBold,
              fontSize: 14,
              color: open ? theme.colors.primary : theme.colors.foreground,
            }}
          >
            {selectedChild.name.split(' ')[0]}
          </Text>
          <ChevronDown
            size={14}
            color={open ? theme.colors.primary : theme.colors.mutedForeground}
            strokeWidth={2.5}
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
                minWidth: Math.max(anchor.width, 140),
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
                {childList.map(ch => {
                  const isSelected = ch.id === selectedChild.id;
                  return (
                    <Pressable
                      key={ch.id}
                      onPress={() => {
                        onSelectChild(ch);
                        closeMenu();
                      }}
                      style={[
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                        },
                        isSelected ? selectionStyle(theme, true) : undefined,
                      ]}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          backgroundColor: ch.color,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontFamily: theme.typography.fontFamilyBlack, fontSize: 9 }}>
                          {ch.initials}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: theme.typography.fontFamilyBlack,
                          fontSize: 14,
                          color: isSelected ? theme.colors.primary : theme.colors.foreground,
                        }}
                      >
                        {ch.name.split(' ')[0]}
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
