import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { X, ChevronRight } from 'lucide-react-native';
import type { Entry } from '@/types';
import { entryTypeConfig } from '@/constants/entryTypes';
import { getPendingAckEntries } from '@/utils/ack';
import { formatModalDate } from '@/utils/dates';
import { TodayDateText } from '@/components/ui/TodayDateText';
import { TODAY } from '@/constants/config';
import { useTheme } from '@/theme';
import { AppModal } from '@/components/ui/Modal';
import { EntryDetailModal } from '@/components/features/EntryDetailModal';

const GUIDE_HEIGHT = Math.min(560, Math.round(Dimensions.get('window').height * 0.78));

interface PendingAckGuideModalProps {
  visible: boolean;
  onClose: () => void;
  entries: Entry[];
  userId: string;
  onConfirmRead: (entryId: string) => void | Promise<void>;
}

export function PendingAckGuideModal({
  visible,
  onClose,
  entries,
  userId,
  onConfirmRead,
}: PendingAckGuideModalProps) {
  const { theme } = useTheme();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const advanceAfterConfirm = useRef(false);
  const openedRef = useRef(false);

  const pendingEntries = useMemo(
    () => getPendingAckEntries(entries, userId),
    [entries, userId],
  );

  const remainingLabel = pendingEntries.length === 1
    ? '1 pendiente'
    : `${pendingEntries.length} pendientes`;

  const selectedEntry = selectedEntryId
    ? entries.find(e => e.id === selectedEntryId) ?? null
    : null;

  useEffect(() => {
    if (!visible) {
      setSelectedEntryId(null);
      advanceAfterConfirm.current = false;
      openedRef.current = false;
      return;
    }
    if (pendingEntries.length === 0) {
      onClose();
      return;
    }
    if (!openedRef.current) {
      openedRef.current = true;
      setSelectedEntryId(pendingEntries[0].id);
    }
  }, [visible, pendingEntries, onClose]);

  useEffect(() => {
    if (!visible || !advanceAfterConfirm.current) return;
    advanceAfterConfirm.current = false;
    if (pendingEntries.length === 0) {
      onClose();
      return;
    }
    setSelectedEntryId(pendingEntries[0].id);
  }, [entries, pendingEntries, visible, onClose]);

  const handleConfirmRead = async (entryId: string) => {
    await onConfirmRead(entryId);
    advanceAfterConfirm.current = true;
    setSelectedEntryId(null);
  };

  if (!visible) return null;

  return (
    <>
      <AppModal visible={visible} onClose={onClose}>
        <View style={{ height: GUIDE_HEIGHT }}>
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
                Confirmar lectura
              </Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 13, color: theme.colors.mutedForeground, marginTop: 4 }}>
                Revisá cada comunicado y confirmá uno por uno
              </Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: theme.colors.primary, marginTop: 8 }}>
                {remainingLabel}
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

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, gap: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {pendingEntries.map((entry, index) => {
              const isActive = entry.id === selectedEntryId;
              const config = entryTypeConfig[entry.type];

              return (
                <Pressable
                  key={entry.id}
                  onPress={() => setSelectedEntryId(entry.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: theme.radii.lg,
                    backgroundColor: isActive ? theme.colors.primaryMuted : theme.colors.card,
                    borderWidth: isActive ? 1.5 : 1,
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: theme.colors.muted,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 11, color: theme.colors.mutedForeground }}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.primary, textTransform: 'uppercase' }}>
                      {config.label}
                    </Text>
                    <Text numberOfLines={2} style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground, marginTop: 2 }}>
                      {entry.title}
                    </Text>
                    <TodayDateText
                      text={formatModalDate(entry.date, TODAY)}
                      suffix={` · ${entry.time}`}
                      style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 11, color: theme.colors.mutedForeground, marginTop: 4 }}
                    />
                  </View>
                  <ChevronRight size={18} color={isActive ? theme.colors.primary : theme.colors.mutedForeground} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </AppModal>

      <EntryDetailModal
        entry={selectedEntry}
        userId={userId}
        isReadOnly
        showAudienceBadge
        onClose={() => setSelectedEntryId(null)}
        onConfirmRead={handleConfirmRead}
      />
    </>
  );
}
