import { useState } from 'react';
import { View, Text, Pressable, Linking, Alert } from 'react-native';
import {
  X, Pencil, Trash2, PartyPopper, FileText, Users, Drama, Star, BookOpen, AlertCircle,
  Paperclip, Image as ImageIcon, Plus,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, mutedOutlineButtonStyle, cardShadow } from '@/theme';
import { AppModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AttachmentSourceModal } from '@/components/features/AttachmentSourceModal';
import { calendarEventTypeLabels, getCalendarTypeColors } from '@/constants/calendarTypes';
import { formatModalDate } from '@/utils/dates';
import { TODAY, USE_MOCK } from '@/constants/config';
import { useUploadCalendarEventAttachment } from '@/queries/useCalendarEvents';
import type { PickedAttachmentFile } from '@/services/api/attachments.api';
import type { CalendarEvent, SchoolCalendarEventType } from '@/types';

const EVENT_ICONS: Record<CalendarEvent['type'], LucideIcon> = {
  festivo: PartyPopper,
  examen: FileText,
  reunion: Users,
  actuacion: Drama,
  evento: Star,
  tarea: BookOpen,
};

interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  canManage?: boolean;
  isDark: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: () => void;
}

export function CalendarEventDetailModal({
  event,
  canManage = false,
  isDark,
  onClose,
  onEdit,
  onDelete,
}: CalendarEventDetailModalProps) {
  const { theme } = useTheme();
  const [showAttachmentSource, setShowAttachmentSource] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadAttachment = useUploadCalendarEventAttachment();

  if (!event) return null;

  const Icon = EVENT_ICONS[event.type];

  const colors = event.type === 'tarea'
    ? { color: theme.colors.primary, bg: theme.colors.primaryMuted }
    : getCalendarTypeColors(event.type as SchoolCalendarEventType, isDark);

  const typeLabel = event.type === 'tarea'
    ? 'Tarea'
    : calendarEventTypeLabels[event.type as SchoolCalendarEventType];

  const attachments = event.attachments ?? [];
  const isUploadingAttachment = uploadAttachment.isPending;

  const handleAttachmentPicked = async (file: PickedAttachmentFile) => {
    setUploadProgress(0);

    try {
      await uploadAttachment.mutateAsync({
        eventId: event.id,
        file,
        onProgress: setUploadProgress,
      });
      setShowAttachmentSource(false);
    } catch {
      Alert.alert('Error', 'No se pudo subir el archivo. Verificá el tipo y que no supere 10 MB.');
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <>
      <AppModal visible={!!event} onClose={onClose}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={22} color={colors.color} />
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: colors.bg,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: theme.typography.fontFamilyBold,
                      fontSize: 11,
                      color: colors.color,
                    }}
                  >
                    {typeLabel}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: theme.typography.fontFamilyMedium,
                    fontSize: 12,
                    color: theme.colors.mutedForeground,
                  }}
                >
                  {formatModalDate(event.date, TODAY)}
                </Text>
                {event.isImportant && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <AlertCircle size={10} color={theme.colors.foreground} />
                    <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.foreground }}>
                      Importante
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontFamily: theme.typography.fontFamilyBlack,
                  fontSize: 18,
                  color: theme.colors.foreground,
                  lineHeight: 24,
                }}
              >
                {event.title}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 14,
                backgroundColor: theme.colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={theme.colors.mutedForeground} />
            </Pressable>
          </View>

          <Text
            style={{
              marginTop: 16,
              fontFamily: theme.typography.fontFamilyMedium,
              fontSize: 14,
              color: theme.colors.mutedForeground,
              lineHeight: 22,
            }}
          >
            {event.description?.trim()
              ? event.description
              : 'Sin descripción adicional para este evento.'}
          </Text>

          {(attachments.length > 0 || (canManage && !USE_MOCK)) && (
            <View style={{ marginTop: 16, gap: 8 }}>
              {attachments.map((att, i) => (
                <Pressable
                  key={att.id ?? i}
                  onPress={() => {
                    if (att.url) void Linking.openURL(att.url);
                  }}
                  disabled={!att.url}
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
                  {att.fileType === 'image' ? (
                    <ImageIcon size={14} color={theme.colors.mutedForeground} />
                  ) : (
                    <Paperclip size={14} color={theme.colors.mutedForeground} />
                  )}
                  <Text numberOfLines={1} style={{ flex: 1, fontFamily: theme.typography.fontFamilyBold, fontSize: 13, color: theme.colors.foreground }}>
                    {att.name}
                  </Text>
                  <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground }}>
                    {att.size}
                  </Text>
                </Pressable>
              ))}

              {canManage && !USE_MOCK && (
                <Pressable
                  onPress={() => setShowAttachmentSource(true)}
                  disabled={isUploadingAttachment}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    opacity: isUploadingAttachment ? 0.5 : 1,
                  }}
                >
                  <Plus size={14} color={theme.colors.primary} />
                  <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 13, color: theme.colors.primary }}>
                    Agregar adjunto
                  </Text>
                </Pressable>
              )}

              {isUploadingAttachment && (
                <View style={{ gap: 6, paddingHorizontal: 4 }}>
                  <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground }}>
                    Subiendo… {uploadProgress}%
                  </Text>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.colors.border, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${uploadProgress}%`,
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {canManage && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <View style={{ flex: 1, ...cardShadow(theme) }}>
                <Button
                  label="Editar"
                  onPress={() => onEdit?.(event)}
                  icon={<Pencil size={16} color="#fff" strokeWidth={2.5} />}
                  style={{ flex: 1 }}
                />
              </View>
              <Pressable
                onPress={onDelete}
                style={[mutedOutlineButtonStyle(theme, { shadow: false }), { flex: 1 }]}
              >
                <Trash2 size={16} color={theme.colors.mutedForeground} strokeWidth={1.8} />
                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 15, color: theme.colors.mutedForeground }}>
                  Eliminar
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </AppModal>

      <AttachmentSourceModal
        visible={showAttachmentSource}
        onClose={() => setShowAttachmentSource(false)}
        onPicked={file => void handleAttachmentPicked(file)}
        uploading={isUploadingAttachment}
        uploadProgress={uploadProgress}
      />
    </>
  );
}
