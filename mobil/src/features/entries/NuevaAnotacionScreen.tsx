import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import {
  ChevronLeft, Check, BookOpen, User, Package, Eye, Bell, Megaphone, FileText, Star,
  AlertCircle, PartyPopper, Users, Drama, Paperclip, File, Plus, X,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, selectionStyle, cardShadow } from '@/theme';
import { useAuth } from '@/store/useAuth';
import { useEntries, useCreateEntry, useUpdateEntry } from '@/queries/useEntries';
import { useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent } from '@/queries/useCalendarEvents';
import { useStudentsBySection } from '@/queries/useStudents';
import { TODAY, USE_MOCK } from '@/constants/config';
import { entryTypeConfig, REGISTRO_TYPE_OPTIONS } from '@/constants/entryTypes';
import { calendarEventTypeLabels, SCHOOL_CALENDAR_EVENT_TYPES, getCalendarTypeColors } from '@/constants/calendarTypes';
import { getStudentName } from '@/services';
import { AttachmentSourceModal } from '@/components/features/AttachmentSourceModal';
import {
  cancelStagingAttachment,
  deleteAttachment,
  uploadAttachment,
  type PickedAttachmentFile,
} from '@/services/api/attachments.api';
import { shortSectionLabel } from '@/utils/visibility';
import { defaultRequiresAckForType } from '@/utils/ack';
import type { EntryType, SchoolCalendarEventType, Attachment } from '@/types';
import { Screen } from '@/components/ui/Screen';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { DatePickerField } from '@/components/features/DatePickerField';
import { PersonalizadoStudentsPicker } from '@/components/features/PersonalizadoStudentsPicker';
import { CreateSuccessCelebration } from '@/components/features/CreateSuccessCelebration';

type FormMode = 'registro' | 'calendario';

const TYPE_ICONS: Record<EntryType, LucideIcon> = {
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

const CALENDAR_ICONS: Record<SchoolCalendarEventType, LucideIcon> = {
  festivo: PartyPopper,
  examen: FileText,
  reunion: Users,
  actuacion: Drama,
  evento: Star,
};

function TypeOptionCard({
  label,
  selected,
  onPress,
  iconBg,
  iconColor,
  Icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: '31%',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 12,
          paddingHorizontal: 4,
          borderRadius: theme.radii.md,
        },
        selected
          ? selectionStyle(theme, true)
          : {
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
              ...cardShadow(theme),
            },
      ]}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected ? theme.colors.primaryMuted : iconBg,
        }}
      >
        <Icon
          size={18}
          color={selected ? theme.colors.primary : iconColor}
          strokeWidth={1.75}
        />
      </View>
      <Text
        style={{
          fontFamily: theme.typography.fontFamilyBlack,
          fontSize: 10,
          color: selected ? theme.colors.primary : theme.colors.mutedForeground,
          textAlign: 'center',
          lineHeight: 12,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function OptionIcon({ children }: { children: ReactNode }) {
  return (
    <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

function FormOptionsCard({
  isImportant,
  onImportantChange,
  showParentsOnly = false,
  parentsOnly,
  onParentsOnlyChange,
  showRequiresAck = false,
  requiresAck,
  onRequiresAckChange,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  uploadingIndex = null,
  uploadProgress = 0,
  addDisabled = false,
}: {
  isImportant: boolean;
  onImportantChange: (value: boolean) => void;
  showParentsOnly?: boolean;
  parentsOnly?: boolean;
  onParentsOnlyChange?: (value: boolean) => void;
  showRequiresAck?: boolean;
  requiresAck?: boolean;
  onRequiresAckChange?: (value: boolean) => void;
  attachments: Attachment[];
  onAddAttachment: () => void;
  onRemoveAttachment: (index: number) => void;
  uploadingIndex?: number | null;
  uploadProgress?: number;
  addDisabled?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        marginTop: 20,
        borderRadius: theme.radii.xl,
        backgroundColor: theme.colors.card,
        overflow: 'hidden',
        ...cardShadow(theme),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <OptionIcon>
            <AlertCircle size={18} color={theme.colors.primary} strokeWidth={1.75} />
          </OptionIcon>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground }}>
              Marcar como importante
            </Text>
            <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
              Se mostrará destacado
            </Text>
          </View>
        </View>
        <Toggle value={isImportant} onChange={onImportantChange} />
      </View>

      {showRequiresAck && onRequiresAckChange !== undefined && requiresAck !== undefined && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <OptionIcon>
              <Check size={18} color={theme.colors.primary} strokeWidth={1.75} />
            </OptionIcon>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground }}>
                Requiere confirmación de lectura
              </Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
                El padre confirma que vio el registro
              </Text>
            </View>
          </View>
          <Toggle value={requiresAck} onChange={onRequiresAckChange} />
        </View>
      )}

      {showParentsOnly && onParentsOnlyChange !== undefined && parentsOnly !== undefined && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <OptionIcon>
              <Users size={18} color={theme.colors.primary} strokeWidth={1.75} />
            </OptionIcon>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground }}>
                Informar solo a los padres
              </Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
                No aparecerá en la agenda del alumno
              </Text>
            </View>
          </View>
          <Toggle value={parentsOnly} onChange={onParentsOnlyChange} />
        </View>
      )}

      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: attachments.length > 0 ? 8 : 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <OptionIcon>
              <Paperclip size={18} color={theme.colors.primary} strokeWidth={1.75} />
            </OptionIcon>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground }}>
                Adjuntos
              </Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
                Foto, PDF o documento
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onAddAttachment}
            disabled={addDisabled}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 4, opacity: addDisabled ? 0.5 : 1 }}
          >
            <Plus size={14} color={theme.colors.mutedForeground} strokeWidth={2.5} />
            <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: theme.colors.mutedForeground }}>
              Agregar
            </Text>
          </Pressable>
        </View>

        {(attachments.length > 0 || uploadingIndex !== null) && (
          <View style={{ gap: 6, marginTop: 8 }}>
            {attachments.map((att, index) => (
              <View
                key={`${att.name}-${att.publicId ?? att.id ?? index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: theme.colors.muted,
                }}
              >
                <File size={14} color={theme.colors.mutedForeground} strokeWidth={1.75} />
                <Text
                  numberOfLines={1}
                  style={{ flex: 1, fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: theme.colors.foreground }}
                >
                  {att.name}
                </Text>
                <Pressable onPress={() => onRemoveAttachment(index)} hitSlop={8} disabled={uploadingIndex !== null}>
                  <X size={13} color={theme.colors.mutedForeground} />
                </Pressable>
              </View>
            ))}
            {uploadingIndex !== null && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: theme.colors.muted,
                  gap: 6,
                }}
              >
                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: theme.colors.foreground }}>
                  Subiendo archivo…
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
                <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 10, color: theme.colors.mutedForeground }}>
                  {uploadProgress}%
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export function NuevaAnotacionScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    editEntryId?: string;
    editEventId?: string;
    mode?: string;
    date?: string;
  }>();
  const { selectedSection } = useAuth();
  const { data: entries = [] } = useEntries();
  const { data: calendarEvents = [] } = useCalendarEvents();
  const createEntryMutation = useCreateEntry();
  const updateEntryMutation = useUpdateEntry();
  const createCalendarEventMutation = useCreateCalendarEvent();
  const updateCalendarEventMutation = useUpdateCalendarEvent();
  const addEntry = (data: Parameters<typeof createEntryMutation.mutateAsync>[0]['data'], options?: { sendNotification?: boolean }) =>
    createEntryMutation.mutateAsync({ data, sendNotification: options?.sendNotification });
  const updateEntry = (id: string, data: Parameters<typeof updateEntryMutation.mutateAsync>[0]['data'], options?: { sendNotification?: boolean }) =>
    updateEntryMutation.mutateAsync({ id, data, sendNotification: options?.sendNotification });
  const addCalendarEvent = (data: Parameters<typeof createCalendarEventMutation.mutateAsync>[0]) =>
    createCalendarEventMutation.mutateAsync(data);
  const updateCalendarEvent = (id: string, data: Parameters<typeof updateCalendarEventMutation.mutateAsync>[0]['data']) =>
    updateCalendarEventMutation.mutateAsync({ id, data });
  const { data: sectionStudents = [] } = useStudentsBySection(selectedSection);

  const editingEntry = useMemo(
    () => entries.find(e => e.id === params.editEntryId),
    [entries, params.editEntryId],
  );
  const editingCalendarEvent = useMemo(
    () => calendarEvents.find(e => e.id === params.editEventId),
    [calendarEvents, params.editEventId],
  );

  const isEditingEntry = !!editingEntry;
  const isEditingCalendar = !!editingCalendarEvent;
  const isEditing = isEditingEntry || isEditingCalendar;

  const initialMode: FormMode =
    params.mode === 'calendario' || isEditingCalendar ? 'calendario' : 'registro';

  const [mode, setMode] = useState<FormMode>(initialMode);
  const [selectedType, setSelectedType] = useState<EntryType>(editingEntry?.type ?? 'tarea');
  const [calendarType, setCalendarType] = useState<SchoolCalendarEventType>(
    editingCalendarEvent && editingCalendarEvent.type !== 'tarea'
      ? editingCalendarEvent.type
      : 'evento',
  );
  const [eventDate, setEventDate] = useState(() => {
    const raw = editingCalendarEvent?.date ?? params.date ?? TODAY;
    if (isEditingCalendar) return raw;
    return raw < TODAY ? TODAY : raw;
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() => {
    if (editingEntry?.studentIds?.length) return editingEntry.studentIds;
    if (editingEntry?.studentId) return [editingEntry.studentId];
    return [];
  });
  const [title, setTitle] = useState(editingEntry?.title ?? editingCalendarEvent?.title ?? '');
  const [description, setDescription] = useState(editingEntry?.description ?? editingCalendarEvent?.description ?? '');
  const [isImportant, setIsImportant] = useState(
    editingEntry?.isImportant ?? editingCalendarEvent?.isImportant ?? false,
  );
  const [parentsOnly, setParentsOnly] = useState(editingEntry?.parentsOnly ?? false);
  const [requiresAck, setRequiresAck] = useState(
    editingEntry?.requiresAck ?? defaultRequiresAckForType(editingEntry?.type ?? 'tarea'),
  );
  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    if (editingEntry?.attachments?.length) return [...editingEntry.attachments];
    if (editingCalendarEvent?.attachments?.length) return [...editingCalendarEvent.attachments];
    return [];
  });
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;
  const [submitted, setSubmitted] = useState(false);
  const [submittedMode, setSubmittedMode] = useState<FormMode>('registro');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAttachmentSource, setShowAttachmentSource] = useState(false);

  const isPersonalizado = selectedType === 'personalizado';
  const isRegistro = mode === 'registro';
  const isUploading = uploadingIndex !== null;

  useEffect(() => {
    return () => {
      if (USE_MOCK) return;
      for (const att of attachmentsRef.current) {
        if (!att.id && att.publicId) {
          void cancelStagingAttachment(att.publicId).catch(() => undefined);
        }
      }
    };
  }, []);

  const handleAddAttachment = () => {
    if (isUploading) return;

    if (USE_MOCK) {
      setAttachments(prev => [
        ...prev,
        { name: `archivo_${prev.length + 1}.pdf`, size: '1.0 MB', fileType: 'pdf' },
      ]);
      return;
    }

    setShowAttachmentSource(true);
  };

  const handleAttachmentPicked = async (file: PickedAttachmentFile) => {
    setShowAttachmentSource(false);

    const nextIndex = attachments.length;
    setUploadingIndex(nextIndex);
    setUploadProgress(0);

    try {
      const uploaded = await uploadAttachment(file, {
        onProgress: setUploadProgress,
      });
      setAttachments(prev => [...prev, uploaded]);
    } catch {
      Alert.alert('Error', 'No se pudo subir el archivo. Verificá el tipo y que no supere 10 MB.');
    } finally {
      setUploadingIndex(null);
      setUploadProgress(0);
    }
  };

  const handleRemoveAttachment = async (index: number) => {
    const att = attachments[index];
    if (!att) return;

    if (!USE_MOCK) {
      try {
        if (att.id) {
          await deleteAttachment(att.id);
        } else if (att.publicId) {
          await cancelStagingAttachment(att.publicId);
        }
      } catch {
        Alert.alert('Error', 'No se pudo eliminar el adjunto.');
        return;
      }
    }

    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateRegistro = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'El título es obligatorio.';
    if (!description.trim()) errs.description = 'La descripción es obligatoria.';
    if (!selectedSection) errs.section = 'Seleccioná una sección en Inicio.';
    if (isPersonalizado && selectedStudentIds.length === 0) errs.student = 'Agregá al menos un alumno.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateCalendario = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Ingresá un título.';
    if (!eventDate) errs.date = 'Seleccioná una fecha.';
    else if (eventDate < TODAY) errs.date = 'No podés programar eventos en fechas pasadas.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitRegistro = async () => {
    if (!validateRegistro()) return;
    setIsLoading(true);
    const entryDate = editingEntry?.date ?? TODAY;
    const timeStr = editingEntry?.time ?? '14:30';
    const studentIds = isPersonalizado ? selectedStudentIds : undefined;
    const studentId = isPersonalizado && selectedStudentIds.length === 1 ? selectedStudentIds[0] : undefined;

    const payload = {
      type: selectedType,
      title: title.trim(),
      description: description.trim(),
      date: entryDate,
      time: timeStr,
      isImportant,
      parentsOnly,
      requiresAck,
      attachments,
      section: selectedSection,
      studentId,
      studentIds: studentIds && studentIds.length > 1 ? studentIds : undefined,
    };

    if (isEditingEntry && editingEntry) {
      setSuccessMessage('Anotación actualizada en la agenda.');
      await updateEntry(editingEntry.id, payload, { sendNotification: true });
    } else {
      const studentNames = selectedStudentIds.map(id => getStudentName(id).split(' ')[0]);
      if (parentsOnly && studentNames.length > 1) {
        setSuccessMessage(`Visible solo para los padres de ${studentNames.join(', ')}.`);
      } else if (parentsOnly && studentNames.length === 1) {
        setSuccessMessage(`Visible solo para los padres de ${studentNames[0]}.`);
      } else if (parentsOnly) {
        setSuccessMessage(`Visible solo para los padres de ${shortSectionLabel(selectedSection)}.`);
      } else if (studentNames.length > 1) {
        setSuccessMessage(`Registro visible para ${studentNames.join(', ')}.`);
      } else {
        setSuccessMessage('Visible en la agenda del aula.');
      }
      await addEntry(payload, { sendNotification: true });
    }

    setSubmittedMode('registro');
    setSubmitted(true);
    setIsLoading(false);
    setTimeout(() => {
      if (isEditing) router.back();
      else router.replace('/agenda');
    }, 1400);
  };

  const handleSubmitCalendario = async () => {
    if (!validateCalendario()) return;
    setIsLoading(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: eventDate,
      type: calendarType,
      isImportant,
      attachments,
    };

    if (isEditingCalendar && editingCalendarEvent) {
      await updateCalendarEvent(editingCalendarEvent.id, payload);
      setSuccessMessage('Evento actualizado en el calendario escolar.');
    } else {
      await addCalendarEvent(payload);
      setSuccessMessage('Visible en el calendario escolar para familias y alumnos.');
    }

    setSubmittedMode('calendario');
    setSubmitted(true);
    setIsLoading(false);
    setTimeout(() => {
      if (isEditing) router.back();
      else router.replace('/calendario');
    }, 900);
  };

  const handleSubmit = () => {
    if (isRegistro) void handleSubmitRegistro();
    else void handleSubmitCalendario();
  };

  if (submitted) {
    const isRegistroSuccess = submittedMode === 'registro';
    const registroCfg = entryTypeConfig[selectedType];
    const calendarColors = getCalendarTypeColors(calendarType, isDark);
    const SuccessIcon = isRegistroSuccess ? TYPE_ICONS[selectedType] : CALENDAR_ICONS[calendarType];
    const successTitle =
      submittedMode === 'calendario'
        ? (isEditingCalendar ? '¡Evento actualizado!' : '¡Evento programado!')
        : (isEditingEntry ? '¡Anotación actualizada!' : '¡Guardado!');

    return (
      <CreateSuccessCelebration
        Icon={SuccessIcon}
        iconBg={isRegistroSuccess ? (isDark ? registroCfg.darkBg : registroCfg.bg) : calendarColors.bg}
        iconColor={isRegistroSuccess ? registroCfg.color : calendarColors.color}
        accentColor={isRegistroSuccess ? registroCfg.color : calendarColors.color}
        title={successTitle}
        message={successMessage}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
          backgroundColor: theme.colors.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={20} color={theme.colors.mutedForeground} />
            </Pressable>
            <Text numberOfLines={1} style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 20, color: theme.colors.foreground, flex: 1 }}>
              {isEditingEntry ? 'Editar anotación' : isEditingCalendar ? 'Editar evento' : 'Nueva anotación'}
            </Text>
          </View>
          {selectedSection ? (
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 16, color: theme.colors.foreground }}>
              {shortSectionLabel(selectedSection)}
            </Text>
          ) : null}
        </View>

        {!isEditing && (
          <View style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16, backgroundColor: theme.colors.muted, marginTop: 16 }}>
            {(['registro', 'calendario'] as const).map(tab => {
              const active = mode === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => { setMode(tab); setErrors({}); }}
                  style={[{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' }, selectionStyle(theme, active)]}
                >
                  <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: active ? theme.colors.primary : theme.colors.mutedForeground }}>
                    {tab === 'registro' ? 'Registro' : 'Evento'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <Screen scroll padded>
        {isRegistro ? (
          <>
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground, marginBottom: 12 }}>
              Tipo de registro
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {REGISTRO_TYPE_OPTIONS.map(type => {
                const cfg = entryTypeConfig[type];
                const Icon = TYPE_ICONS[type];
                return (
                  <TypeOptionCard
                    key={type}
                    label={cfg.label}
                    selected={selectedType === type}
                    onPress={() => {
                      setSelectedType(type);
                      setRequiresAck(defaultRequiresAckForType(type));
                      if (type !== 'personalizado') setSelectedStudentIds([]);
                      setErrors(p => ({ ...p, student: '' }));
                    }}
                    iconBg={isDark ? cfg.darkBg : cfg.bg}
                    iconColor={cfg.color}
                    Icon={Icon}
                  />
                );
              })}
            </View>

            {isPersonalizado && (
              <View style={{ marginBottom: 16 }}>
                <PersonalizadoStudentsPicker
                  students={sectionStudents}
                  selectedIds={selectedStudentIds}
                  onChange={ids => {
                    setSelectedStudentIds(ids);
                    setErrors(p => ({ ...p, student: '' }));
                  }}
                  error={errors.student}
                />
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground, marginBottom: 12 }}>
              Tipo de evento
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {SCHOOL_CALENDAR_EVENT_TYPES.map(type => {
                const Icon = CALENDAR_ICONS[type];
                const colors = getCalendarTypeColors(type, isDark);
                return (
                  <TypeOptionCard
                    key={type}
                    label={calendarEventTypeLabels[type]}
                    selected={calendarType === type}
                    onPress={() => setCalendarType(type)}
                    iconBg={colors.bg}
                    iconColor={colors.color}
                    Icon={Icon}
                  />
                );
              })}
            </View>

            <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground, marginBottom: 8 }}>
              Fecha del evento
            </Text>
            <DatePickerField value={eventDate} onChange={setEventDate} minDate={TODAY} error={!!errors.date} />
            {errors.date && <Text style={{ color: theme.colors.destructive, fontSize: 12, marginTop: 4 }}>{errors.date}</Text>}
          </>
        )}

        <View style={{ marginTop: 20, gap: 16 }}>
          <Input
            label="Título"
            value={title}
            onChangeText={v => { setTitle(v); setErrors(p => ({ ...p, title: '' })); }}
            placeholder={isRegistro ? 'Ej: Tarea de matemáticas' : 'Ej: Reunión de padres'}
            error={errors.title}
          />
          <TextArea
            label="Descripción"
            value={description}
            onChangeText={v => { setDescription(v); setErrors(p => ({ ...p, description: '' })); }}
            placeholder="Detalles adicionales..."
            error={errors.description}
          />
        </View>

        <FormOptionsCard
          isImportant={isImportant}
          onImportantChange={setIsImportant}
          showRequiresAck={isRegistro}
          requiresAck={requiresAck}
          onRequiresAckChange={setRequiresAck}
          showParentsOnly={isRegistro}
          parentsOnly={parentsOnly}
          onParentsOnlyChange={setParentsOnly}
          attachments={attachments}
          onAddAttachment={() => void handleAddAttachment()}
          onRemoveAttachment={index => void handleRemoveAttachment(index)}
          uploadingIndex={uploadingIndex}
          uploadProgress={uploadProgress}
          addDisabled={isUploading || isLoading}
        />

        {errors.section && (
          <Text style={{ color: theme.colors.destructive, fontSize: 12, marginTop: 8 }}>{errors.section}</Text>
        )}

        <View style={{ marginTop: 28, marginBottom: 20 }}>
          <Button
            label={isLoading ? '' : isEditing ? 'Guardar cambios' : isRegistro ? 'Guardar registro' : 'Programar evento'}
            onPress={handleSubmit}
            disabled={isLoading || isUploading}
            icon={isLoading ? <ActivityIndicator color="#fff" /> : <Check size={20} color="#fff" />}
          />
        </View>
      </Screen>

      <AttachmentSourceModal
        visible={showAttachmentSource}
        onClose={() => setShowAttachmentSource(false)}
        onPicked={file => void handleAttachmentPicked(file)}
      />
    </View>
  );
}
