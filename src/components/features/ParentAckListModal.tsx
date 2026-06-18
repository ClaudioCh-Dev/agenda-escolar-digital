import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { X, Check, Clock } from 'lucide-react-native';
import type { ParentAckStatus } from '@/utils/ack';
import { useTheme, selectionStyle } from '@/theme';
import { AppModal } from '@/components/ui/Modal';

type AckFilter = 'pendientes' | 'confirmados';

const ACK_MODAL_HEIGHT = Math.min(560, Math.round(Dimensions.get('window').height * 0.72));

interface ParentAckListModalProps {
  visible: boolean;
  onClose: () => void;
  entryTitle?: string;
  parents: ParentAckStatus[];
}

export function ParentAckListModal({ visible, onClose, entryTitle, parents }: ParentAckListModalProps) {
  const { theme } = useTheme();
  const pending = useMemo(() => parents.filter(p => !p.confirmed), [parents]);
  const confirmed = useMemo(() => parents.filter(p => p.confirmed), [parents]);

  const [filter, setFilter] = useState<AckFilter>(pending.length > 0 ? 'pendientes' : 'confirmados');
  const filtered = filter === 'pendientes' ? pending : confirmed;

  return (
    <AppModal visible={visible} onClose={onClose}>
      <View style={{ height: ACK_MODAL_HEIGHT, flexDirection: 'column' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 18, color: theme.colors.foreground }}>
              Confirmación de padres
            </Text>
            {entryTitle ? (
              <Text numberOfLines={2} style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 13, color: theme.colors.mutedForeground, marginTop: 4 }}>
                {entryTitle}
              </Text>
            ) : null}
            <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: theme.colors.primary, marginTop: 8 }}>
              {confirmed.length}/{parents.length} confirmaron
              {pending.length > 0 ? ` · ${pending.length} pendiente${pending.length === 1 ? '' : 's'}` : ''}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} color={theme.colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 12 }}>
          {(['pendientes', 'confirmados'] as const).map(key => {
            const count = key === 'pendientes' ? pending.length : confirmed.length;
            const active = filter === key;
            const label = key === 'pendientes' ? 'Pendientes' : 'Confirmaron';
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                style={[
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: theme.radii.md,
                  },
                  selectionStyle(theme, active),
                ]}
              >
                <Text
                  style={{
                    fontFamily: theme.typography.fontFamilyBold,
                    fontSize: 12,
                    color: active ? theme.colors.primary : theme.colors.mutedForeground,
                  }}
                >
                  {label} ({count})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 6 }}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          {filtered.length === 0 ? (
            <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 13, color: theme.colors.mutedForeground, paddingVertical: 16, textAlign: 'center' }}>
              {filter === 'pendientes' ? 'Nadie pendiente' : 'Nadie confirmó aún'}
            </Text>
          ) : (
            filtered.map(parent => (
              <View
                key={parent.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: theme.colors.muted,
                }}
              >
                {parent.confirmed ? (
                  <Check size={16} color={theme.colors.primary} strokeWidth={2.5} />
                ) : (
                  <Clock size={16} color={theme.colors.mutedForeground} strokeWidth={2} />
                )}
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    fontFamily: theme.typography.fontFamilyBold,
                    fontSize: 13,
                    color: theme.colors.foreground,
                  }}
                >
                  {parent.name}
                </Text>
                <Text
                  style={{
                    fontFamily: theme.typography.fontFamilyBold,
                    fontSize: 11,
                    color: parent.confirmed ? theme.colors.primary : theme.colors.mutedForeground,
                  }}
                >
                  {parent.confirmed ? 'Confirmó' : 'Pendiente'}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </AppModal>
  );
}
