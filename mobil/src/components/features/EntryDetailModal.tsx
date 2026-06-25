import { useState } from 'react';

import { View, Text, Pressable, ScrollView, Alert } from 'react-native';

import {

  X, Check, AlertCircle, Paperclip, Image as ImageIcon, Pencil, Trash2, ChevronRight, Plus,

  BookOpen, Megaphone, Package, Eye, Bell, FileText, Star, User,

} from 'lucide-react-native';

import type { LucideIcon } from 'lucide-react-native';

import type { Entry, EntryType } from '@/types';

import { entryTypeConfig } from '@/constants/entryTypes';

import { getStudentName } from '@/services';

import { getEntryStudentIds, shortSectionLabel } from '@/utils/visibility';

import { entryRequiresAck, getAckStats, getParentAckList, isPendingAck } from '@/utils/ack';
import { formatModalDate } from '@/utils/dates';
import { TodayDateText } from '@/components/ui/TodayDateText';
import { EntryAuthorLabel } from '@/components/features/EntryAuthorLabel';
import { TODAY, USE_MOCK } from '@/constants/config';

import { useTheme, mutedOutlineButtonStyle, cardShadow } from '@/theme';

import { AppModal } from '@/components/ui/Modal';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { Button } from '@/components/ui/Button';

import { ParentAckListModal } from '@/components/features/ParentAckListModal';
import { AttachmentSourceModal } from '@/components/features/AttachmentSourceModal';
import { AttachmentListRow } from '@/components/features/AttachmentListRow';
import { AttachmentImageViewerModal } from '@/components/features/AttachmentImageViewerModal';
import { useParentsBySection, useStudentsBySection } from '@/queries/useStudents';
import { useUploadEntryAttachment } from '@/queries/useEntries';
import { MAX_ATTACHMENT_HINT } from '@/constants/attachments';
import {
  AttachmentSizeError,
  type PickedAttachmentFile,
} from '@/services/api/attachments.api';

const ICONS: Record<EntryType, LucideIcon> = {

  tarea: BookOpen,

  comunicado: Megaphone,

  material: Package,

  observacion: Eye,

  recordatorio: Bell,

  examen: FileText,

  evento: Star,

  nota_personal: User,

  personalizado: User,

};



interface EntryDetailModalProps {

  entry: Entry | null;

  userId: string;

  canManage?: boolean;

  isReadOnly?: boolean;

  showAudienceBadge?: boolean;

  onClose: () => void;

  onEdit?: (entry: Entry) => void;

  onDelete?: (entryId: string) => void;

  onConfirmRead?: (entryId: string) => void | Promise<void>;

}



export function EntryDetailModal({

  entry,

  userId,

  canManage = false,

  isReadOnly = false,

  showAudienceBadge = false,

  onClose,

  onEdit,

  onDelete,

  onConfirmRead,

}: EntryDetailModalProps) {

  const { theme } = useTheme();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAckList, setShowAckList] = useState(false);
  const [showAttachmentSource, setShowAttachmentSource] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewingImage, setViewingImage] = useState<{ url: string; name: string } | null>(null);
  const uploadAttachment = useUploadEntryAttachment();

  const section = entry?.section ?? '';
  const { data: ackParents = [] } = useParentsBySection(section);
  const { data: ackStudents = [] } = useStudentsBySection(section);

  if (!entry) return null;



  const Icon = ICONS[entry.type];

  const config = entryTypeConfig[entry.type];

  const requiresAck = entryRequiresAck(entry);

  const isRead = entry.readBy.includes(userId);

  const pendingAck = isReadOnly && isPendingAck(entry, userId);

  const ackStats = getAckStats(entry, ackParents, ackStudents);
  const parentAckList = getParentAckList(entry, ackParents, ackStudents);

  const targetStudentIds = getEntryStudentIds(entry);

  const studentAudienceLabel =

    targetStudentIds.length > 0

      ? `Para: ${targetStudentIds.map(id => getStudentName(id).split(' ')[0]).join(', ')}`

      : null;



  const handleDelete = () => {

    onDelete?.(entry.id);

    setShowDeleteConfirm(false);

    onClose();

  };



  const handleConfirmRead = async () => {

    if (!onConfirmRead) return;

    await onConfirmRead(entry.id);

    onClose();

  };

  const isUploadingAttachment = uploadAttachment.isPending;

  const handleAttachmentPicked = async (file: PickedAttachmentFile) => {
    setUploadProgress(0);

    try {
      await uploadAttachment.mutateAsync({
        entryId: entry.id,
        file,
        onProgress: setUploadProgress,
      });
      setShowAttachmentSource(false);
    } catch (error) {
      if (error instanceof AttachmentSizeError) {
        Alert.alert('Archivo muy grande', MAX_ATTACHMENT_HINT);
      } else {
        Alert.alert('Error', 'No se pudo subir el archivo. Verificá el tipo y que no supere 10 MB.');
      }
    } finally {
      setUploadProgress(0);
    }
  };



  return (

    <>

      <AppModal visible={!!entry} onClose={onClose}>

        <View style={{ maxHeight: 520 }}>

          <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={false}>

            <View style={{ padding: 20, paddingBottom: pendingAck ? 12 : 20 }}>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 }}>

                  <View style={{ alignItems: 'center', width: 56, flexShrink: 0 }}>

                    <View

                      style={{

                        width: 44,

                        height: 44,

                        borderRadius: 16,

                        backgroundColor: theme.colors.muted,

                        alignItems: 'center',

                        justifyContent: 'center',

                      }}

                    >

                      <Icon size={20} color={theme.colors.primary} />

                    </View>

                    {showAudienceBadge && (

                      <View

                        style={{

                          backgroundColor: theme.colors.muted,

                          paddingHorizontal: 6,

                          paddingVertical: 3,

                          borderRadius: 999,

                          marginTop: 6,

                          maxWidth: 56,

                        }}

                      >

                        <Text

                          numberOfLines={2}

                          style={{

                            fontFamily: theme.typography.fontFamilyBold,

                            fontSize: 9,

                            color: theme.colors.mutedForeground,

                            textAlign: 'center',

                            lineHeight: 12,

                          }}

                        >

                          {studentAudienceLabel ?? shortSectionLabel(entry.section)}

                        </Text>

                      </View>

                    )}

                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>

                      <Text

                        style={{

                          fontFamily: theme.typography.fontFamilyBold,

                          fontSize: 10,

                          color: theme.colors.primary,

                          textTransform: 'uppercase',

                          letterSpacing: 0.4,

                        }}

                      >

                        {config.label}

                      </Text>

                      <TodayDateText
                        text={formatModalDate(entry.date, TODAY)}
                        suffix={` · ${entry.time}`}
                        style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground }}
                      />

                      {entry.isImportant && (

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>

                          <AlertCircle size={10} color={theme.colors.foreground} />

                          <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.foreground }}>

                            Importante

                          </Text>

                        </View>

                      )}

                      {pendingAck && (

                        <View style={{ backgroundColor: theme.colors.primaryMuted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>

                          <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.primary }}>

                            Pendiente

                          </Text>

                        </View>

                      )}

                    </View>

                    <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 16, color: theme.colors.foreground, lineHeight: 22 }}>

                      {entry.title}

                    </Text>

                  </View>

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

                {entry.description}

              </Text>



              {(entry.attachments.length > 0 || (canManage && !USE_MOCK)) && (

                <View style={{ marginTop: 16, gap: 8 }}>

                  {entry.attachments.map((att, i) => (
                    <AttachmentListRow
                      key={att.id ?? i}
                      attachment={att}
                      onOpenImage={(url, name) => setViewingImage({ url, name })}
                    />
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



              <View

                style={{

                  marginTop: 16,

                  paddingTop: 12,

                  borderTopWidth: 1,

                  borderTopColor: theme.colors.border,

                  flexDirection: 'row',

                  alignItems: 'center',

                  justifyContent: 'space-between',

                }}

              >

                <EntryAuthorLabel entry={entry} fontSize={12} />

                {canManage && requiresAck && parentAckList.length === 0 && (

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>

                    <Check size={12} color={theme.colors.mutedForeground} />

                    <Text

                      style={{

                        fontFamily: theme.typography.fontFamilyBold,

                        fontSize: 11,

                        color: theme.colors.mutedForeground,

                      }}

                    >

                      {ackStats.confirmed}/{ackStats.total} padres confirmaron

                    </Text>

                  </View>

                )}

              </View>



              {canManage && requiresAck && parentAckList.length > 0 && (

                <Pressable

                  onPress={() => setShowAckList(true)}

                  style={({ pressed }) => ({

                    marginTop: 16,

                    flexDirection: 'row',

                    alignItems: 'center',

                    gap: 12,

                    paddingHorizontal: 14,

                    paddingVertical: 12,

                    borderRadius: 14,

                    backgroundColor: theme.colors.muted,

                    opacity: pressed ? 0.85 : 1,

                  })}

                >

                  <View

                    style={{

                      width: 36,

                      height: 36,

                      borderRadius: 12,

                      backgroundColor: theme.colors.card,

                      alignItems: 'center',

                      justifyContent: 'center',

                    }}

                  >

                    <Check size={18} color={ackStats.confirmed >= ackStats.total ? theme.colors.mutedForeground : theme.colors.primary} />

                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>

                    <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 13, color: theme.colors.foreground }}>

                      Confirmación de padres

                    </Text>

                    <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>

                      {ackStats.confirmed}/{ackStats.total} confirmaron

                      {ackStats.confirmed < ackStats.total

                        ? ` · ${ackStats.total - ackStats.confirmed} pendiente${ackStats.total - ackStats.confirmed === 1 ? '' : 's'}`

                        : ''}

                    </Text>

                  </View>

                  <ChevronRight size={18} color={theme.colors.mutedForeground} />

                </Pressable>

              )}



              {isReadOnly && requiresAck && isRead && (

                <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>

                  <Check size={14} color={theme.colors.mutedForeground} />

                  <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 13, color: theme.colors.mutedForeground }}>

                    Lectura confirmada

                  </Text>

                </View>

              )}



              {canManage && (

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>

                  <View style={{ flex: 1, ...cardShadow(theme) }}>

                    <Button

                      label="Editar"

                      onPress={() => {

                        onClose();

                        onEdit?.(entry);

                      }}

                      icon={<Pencil size={16} color="#fff" strokeWidth={2.5} />}

                      style={{ flex: 1 }}

                    />

                  </View>

                  <Pressable

                    onPress={() => setShowDeleteConfirm(true)}

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

          </ScrollView>



          {pendingAck && (

            <View

              style={{

                paddingHorizontal: 20,

                paddingTop: 12,

                paddingBottom: 20,

                borderTopWidth: 1,

                borderTopColor: theme.colors.border,

                backgroundColor: theme.colors.card,

              }}

            >

              <Text

                style={{

                  fontFamily: theme.typography.fontFamilyMedium,

                  fontSize: 12,

                  color: theme.colors.mutedForeground,

                  textAlign: 'center',

                  marginBottom: 12,

                }}

              >

                Solo confirma que leyó el comunicado

              </Text>

              <Button

                label="Confirmo que he leído"

                onPress={() => void handleConfirmRead()}

              />

            </View>

          )}

        </View>

      </AppModal>



      <ConfirmDialog

        visible={showDeleteConfirm}

        title="Eliminar anotación"

        description="¿Estás seguro? Esta acción no se puede deshacer."

        onConfirm={handleDelete}

        onCancel={() => setShowDeleteConfirm(false)}

      />

      <ParentAckListModal

        visible={showAckList}

        onClose={() => setShowAckList(false)}

        entryTitle={entry.title}

        parents={parentAckList}

      />

      <AttachmentSourceModal
        visible={showAttachmentSource}
        onClose={() => setShowAttachmentSource(false)}
        onPicked={file => void handleAttachmentPicked(file)}
        uploading={isUploadingAttachment}
        uploadProgress={uploadProgress}
      />

      <AttachmentImageViewerModal
        visible={!!viewingImage}
        url={viewingImage?.url ?? null}
        name={viewingImage?.name}
        onClose={() => setViewingImage(null)}
      />

    </>

  );

}

