import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ChevronLeft, ChevronDown, BookOpen, User, Package, Eye, Bell, Megaphone, FileText, Star, AlertCircle, Paperclip, File, Plus, PartyPopper, Users, Drama } from 'lucide-react';
import type { Child, Entry, EntryType, Screen, SchoolCalendarEventType, CalendarEvent } from './data';
import { entryTypeConfig, getStudentName, getStudentsBySection, shortSectionLabel, calendarEventTypeLabels, SCHOOL_CALENDAR_EVENT_TYPES, TODAY } from './data';
import { CTA_GRADIENT, CTA_SHADOW, selectionStyle, SELECTED_BG, SELECTED_TEXT } from './uiStyles';
import { DatePickerField } from './DatePickerField';

type FormMode = 'registro' | 'calendario';

interface NuevaAnotacionProps {
  selectedSection: string;
  darkMode?: boolean;
  initialMode?: FormMode;
  initialDate?: string;
  initialCalendarType?: SchoolCalendarEventType;
  editingEntry?: Entry;
  editingCalendarEvent?: CalendarEvent;
  onSubmit: (entry: Omit<Entry, 'id' | 'readBy' | 'author'>, options?: { sendNotification?: boolean }) => void;
  onUpdate?: (id: string, entry: Omit<Entry, 'id' | 'readBy' | 'author'>, options?: { sendNotification?: boolean }) => void;
  onSubmitCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'color'>) => void;
  onUpdateCalendarEvent?: (id: string, event: Omit<CalendarEvent, 'id' | 'color'>) => void;
  onNavigate: (screen: Screen) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: EntryType[] = [
  'tarea',
  'comunicado',
  'personalizado',
  'material',
  'observacion',
  'recordatorio',
];

const CALENDAR_TYPE_ICONS: Record<SchoolCalendarEventType, React.ElementType> = {
  festivo: PartyPopper,
  examen: FileText,
  reunion: Users,
  actuacion: Drama,
  evento: Star,
};

const CALENDAR_TYPE_COLORS: Record<SchoolCalendarEventType, string> = {
  festivo: 'var(--cal-festivo-color)',
  examen: 'var(--cal-examen-color)',
  reunion: 'var(--cal-reunion-color)',
  actuacion: 'var(--cal-actuacion-color)',
  evento: 'var(--cal-evento-color)',
};

const CALENDAR_TYPE_BGS: Record<SchoolCalendarEventType, string> = {
  festivo: 'var(--cal-festivo-bg)',
  examen: 'var(--cal-examen-bg)',
  reunion: 'var(--cal-reunion-bg)',
  actuacion: 'var(--cal-actuacion-bg)',
  evento: 'var(--cal-evento-bg)',
};

const TYPE_ICONS: Record<EntryType, React.ElementType> = {
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

const GRADIENT = CTA_GRADIENT;

function StudentDropdown({
  students,
  selectedStudentId,
  onSelectStudent,
}: {
  students: Child[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = students.find(s => s.id === selectedStudentId);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 rounded-2xl text-sm"
        style={{
          ...(open ? selectionStyle(true) : {
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            border: '1.5px solid var(--border)',
            boxShadow: '0 2px 12px rgba(26,23,64,0.06)',
          }),
          fontWeight: 700,
        }}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected && (
            <span
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: open ? SELECTED_BG : selected.color, color: open ? SELECTED_TEXT : '#ffffff', fontWeight: 900, fontSize: 11 }}
            >
              {selected.initials}
            </span>
          )}
          <span className="truncate">{selected ? selected.name : 'Seleccionar alumno'}</span>
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2.5}
          style={{
            color: open ? SELECTED_TEXT : 'var(--muted-foreground)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(26,23,64,0.12)',
            }}
          >
            {students.map(stu => {
              const isSelected = stu.id === selectedStudentId;
              return (
                <button
                  key={stu.id}
                  type="button"
                  onClick={() => {
                    onSelectStudent(stu.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors"
                  style={{
                    ...(isSelected ? selectionStyle(true) : { backgroundColor: 'transparent', color: 'var(--foreground)' }),
                    fontWeight: 800,
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: isSelected ? SELECTED_BG : stu.color,
                      color: isSelected ? SELECTED_TEXT : '#ffffff',
                      fontWeight: 900,
                      fontSize: 11,
                    }}
                  >
                    {stu.initials}
                  </span>
                  <span className="truncate">{stu.name}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NuevaAnotacion({
  selectedSection,
  darkMode = false,
  initialMode = 'registro',
  initialDate = TODAY,
  initialCalendarType = 'evento',
  editingEntry,
  editingCalendarEvent,
  onSubmit,
  onUpdate,
  onSubmitCalendarEvent,
  onUpdateCalendarEvent,
  onNavigate,
  onClose,
}: NuevaAnotacionProps) {
  const isEditingEntry = !!editingEntry;
  const isEditingCalendar = !!editingCalendarEvent;
  const isEditing = isEditingEntry || isEditingCalendar;

  const [mode, setMode] = useState<FormMode>(initialMode);
  const [selectedType, setSelectedType] = useState<EntryType>(editingEntry?.type ?? 'tarea');
  const [calendarType, setCalendarType] = useState<SchoolCalendarEventType>(
    editingCalendarEvent && editingCalendarEvent.type !== 'tarea'
      ? editingCalendarEvent.type
      : initialCalendarType,
  );
  const [eventDate, setEventDate] = useState(() => {
    const raw = editingCalendarEvent?.date ?? initialDate;
    if (isEditingCalendar) return raw;
    return raw < TODAY ? TODAY : raw;
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(editingEntry?.studentId ?? null);
  const [title, setTitle] = useState(editingEntry?.title ?? editingCalendarEvent?.title ?? '');
  const [description, setDescription] = useState(editingEntry?.description ?? editingCalendarEvent?.description ?? '');
  const [isImportant, setIsImportant] = useState(editingEntry?.isImportant ?? false);
  const [sendNotification, setSendNotification] = useState(!isEditing);
  const [attachments, setAttachments] = useState<string[]>(
    editingEntry?.attachments.map(a => a.name) ?? [],
  );
  const [submitted, setSubmitted] = useState(false);
  const [submittedMode, setSubmittedMode] = useState<FormMode>('registro');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sectionStudents = getStudentsBySection(selectedSection);
  const isPersonalizado = selectedType === 'personalizado';
  const isRegistro = mode === 'registro';

  const validateRegistro = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'El título es obligatorio.';
    if (!description.trim()) errs.description = 'La descripción es obligatoria.';
    if (!selectedSection) errs.section = 'Seleccioná una sección en Inicio.';
    if (isPersonalizado && !selectedStudentId) errs.student = 'Seleccioná un alumno.';
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
    const entryDate = editingEntry?.date ?? '2026-06-13';
    const timeStr = editingEntry?.time ?? (() => {
      const now = new Date('2026-06-13T14:30:00');
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    })();
    const studentId = isPersonalizado ? selectedStudentId : undefined;

    const payload = {
      type: selectedType,
      title: title.trim(),
      description: description.trim(),
      date: entryDate,
      time: timeStr,
      isImportant,
      attachments: attachments.map(name => ({ name, size: '1.0 MB', fileType: 'pdf' as const })),
      section: selectedSection,
      studentId,
    };

    if (isEditingEntry && editingEntry && onUpdate) {
      if (sendNotification && studentId) {
        setSuccessMessage(`Se notificó al padre de ${getStudentName(studentId)}.`);
      } else if (sendNotification) {
        setSuccessMessage(`Se notificó a los padres de ${shortSectionLabel(selectedSection)}.`);
      } else {
        setSuccessMessage('Anotación actualizada en la agenda.');
      }
      onUpdate(editingEntry.id, payload, { sendNotification });
    } else {
      if (studentId) {
        setSuccessMessage(`Se notificó al padre de ${getStudentName(studentId)}.`);
      } else if (sendNotification) {
        setSuccessMessage(`Se notificó a los padres de ${shortSectionLabel(selectedSection)}.`);
      } else {
        setSuccessMessage('Visible en la agenda del aula.');
      }
      onSubmit(payload, { sendNotification });
    }

    setSubmittedMode('registro');
    setSubmitted(true);
    await new Promise(r => setTimeout(r, 1400));
    if (isEditing) onClose();
    else onNavigate('agenda');
  };

  const handleSubmitCalendario = async () => {
    if (!validateCalendario()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: eventDate,
      type: calendarType,
    };

    if (isEditingCalendar && editingCalendarEvent && onUpdateCalendarEvent) {
      onUpdateCalendarEvent(editingCalendarEvent.id, payload);
      setSuccessMessage('Evento actualizado en el calendario escolar.');
    } else {
      onSubmitCalendarEvent(payload);
      setSuccessMessage('Visible en el calendario escolar para familias y alumnos.');
    }

    setSubmittedMode('calendario');
    setSubmitted(true);
    await new Promise(r => setTimeout(r, 900));
    if (isEditing) onClose();
    else onNavigate('calendario');
  };

  const handleSubmit = () => {
    if (isRegistro) void handleSubmitRegistro();
    else void handleSubmitCalendario();
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="w-12 h-6 rounded-full transition-colors relative flex-shrink-0"
      style={{ background: value ? GRADIENT : 'var(--muted)' }}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center" style={{ backgroundColor: 'var(--background)' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: '#10CDA0', boxShadow: '0 12px 40px rgba(16,205,160,0.35)' }}
        >
          <Check size={44} className="text-white" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 style={{ fontWeight: 900, fontSize: 24, color: 'var(--foreground)' }}>
            {submittedMode === 'calendario'
              ? (isEditingCalendar ? '¡Evento actualizado!' : '¡Evento programado!')
              : (isEditingEntry ? '¡Anotación actualizada!' : '¡Guardado!')}
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>{successMessage}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <div className="px-5 pt-12 pb-4" style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 16px rgba(26,23,64,0.05)' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <ChevronLeft size={20} style={{ color: 'var(--muted-foreground)' }} />
            </button>
            <h1 className="truncate" style={{ fontWeight: 900, fontSize: 20, color: 'var(--foreground)' }}>
              {isEditingEntry ? 'Editar anotación' : isEditingCalendar ? 'Editar evento' : 'Nueva anotación'}
            </h1>
          </div>
          {selectedSection && (
            <span
              className="flex-shrink-0"
              style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}
            >
              {shortSectionLabel(selectedSection)}
            </span>
          )}
        </div>

        {!isEditing && (
        <div
          className="flex gap-1 p-1 rounded-2xl mt-4"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          {(['registro', 'calendario'] as const).map(tab => {
            const active = mode === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab);
                  setErrors({});
                }}
                className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  ...(active ? selectionStyle(true) : { backgroundColor: 'transparent', color: 'var(--muted-foreground)' }),
                  fontWeight: 800,
                }}
              >
                {tab === 'registro' ? 'Registro' : 'Evento'}
              </button>
            );
          })}
        </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-5">
          {isRegistro ? (
          <div>
            <label className="block text-sm mb-3" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Tipo de registro</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(type => {
                const cfg = entryTypeConfig[type];
                const Icon = TYPE_ICONS[type];
                const isSelected = selectedType === type;
                return (
                  <motion.button
                    key={type}
                    type="button"
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      setSelectedType(type);
                      if (type !== 'personalizado') setSelectedStudentId(null);
                      setErrors(p => ({ ...p, student: '' }));
                    }}
                    className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl"
                    style={
                      isSelected
                        ? selectionStyle(true)
                        : {
                            backgroundColor: 'var(--card)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 1px 6px rgba(26,23,64,0.06)',
                          }
                    }
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? 'var(--primary-muted)' : (darkMode ? cfg.darkBg : cfg.bg),
                      }}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.75}
                        style={{ color: isSelected ? SELECTED_TEXT : cfg.color }}
                      />
                    </div>
                    <span style={{ fontSize: 10, color: isSelected ? SELECTED_TEXT : 'var(--muted-foreground)', fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>
                      {cfg.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          ) : (
          <>
          <div>
            <label className="block text-sm mb-2" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Fecha</label>
            <DatePickerField
              value={eventDate}
              minDate={TODAY}
              onChange={nextDate => {
                setEventDate(nextDate);
                setErrors(p => ({ ...p, date: '' }));
              }}
              error={!!errors.date}
            />
            {errors.date && <p className="text-xs mt-1" style={{ color: '#FF5C72' }}>{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm mb-3" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Tipo de evento</label>
            <div className="grid grid-cols-3 gap-2">
              {SCHOOL_CALENDAR_EVENT_TYPES.map(type => {
                const Icon = CALENDAR_TYPE_ICONS[type];
                const isSelected = calendarType === type;
                return (
                  <motion.button
                    key={type}
                    type="button"
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setCalendarType(type)}
                    className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl"
                    style={
                      isSelected
                        ? selectionStyle(true)
                        : {
                            backgroundColor: 'var(--card)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 1px 6px rgba(26,23,64,0.06)',
                          }
                    }
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: isSelected ? 'var(--primary-muted)' : CALENDAR_TYPE_BGS[type] }}
                    >
                      <Icon size={18} strokeWidth={1.75} style={{ color: isSelected ? SELECTED_TEXT : CALENDAR_TYPE_COLORS[type] }} />
                    </div>
                    <span style={{ fontSize: 10, color: isSelected ? SELECTED_TEXT : 'var(--muted-foreground)', fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>
                      {calendarEventTypeLabels[type]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          </>
          )}

          {isRegistro && isPersonalizado && (
            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Alumno *</label>
              {sectionStudents.length > 0 ? (
                <StudentDropdown
                  students={sectionStudents}
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={id => {
                    setSelectedStudentId(id);
                    setErrors(p => ({ ...p, student: '' }));
                  }}
                />
              ) : (
                <p className="text-sm px-4 py-3 rounded-2xl" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>
                  No hay alumnos en esta sección.
                </p>
              )}
              {errors.student && <p className="text-xs mt-1" style={{ color: '#FF5C72' }}>{errors.student}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm mb-2" style={{ fontWeight: 800, color: 'var(--foreground)' }}>
              Título{isRegistro ? ' *' : ''}
            </label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
              placeholder={isRegistro ? (selectedType === 'tarea' ? 'Ej: Matemáticas – Página 45' : isPersonalizado ? 'Ej: Aviso para el alumno' : 'Ej: Actividad del día') : 'Ej. Reunión de padres'}
              className="w-full px-4 py-4 rounded-2xl text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                border: errors.title ? '2px solid #FF5C72' : '1.5px solid var(--border)',
                boxShadow: '0 2px 12px rgba(26,23,64,0.06)',
                fontFamily: 'Nunito, sans-serif',
              }}
            />
            {errors.title && <p className="text-xs mt-1" style={{ color: '#FF5C72' }}>{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ fontWeight: 800, color: 'var(--foreground)' }}>
              Descripción{isRegistro ? ' *' : ''}
            </label>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
              placeholder={isRegistro ? 'Describí la actividad con detalle...' : 'Detalles del evento, horario, lugar...'}
              rows={4}
              className="w-full px-4 py-4 rounded-2xl text-sm outline-none resize-none leading-relaxed transition-all"
              style={{
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                border: errors.description ? '2px solid #FF5C72' : '1.5px solid var(--border)',
                boxShadow: '0 2px 12px rgba(26,23,64,0.06)',
                fontFamily: 'Nunito, sans-serif',
              }}
            />
            {errors.description && isRegistro && <p className="text-xs mt-1" style={{ color: '#FF5C72' }}>{errors.description}</p>}
          </div>

          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 16px rgba(26,23,64,0.07)' }}>
            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={18} strokeWidth={1.75} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Marcar como importante</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Se mostrará destacado</p>
                </div>
              </div>
              <Toggle value={isImportant} onChange={() => setIsImportant(!isImportant)} />
            </div>

            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <Bell size={18} strokeWidth={1.75} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Notificar a padres</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Enviar notificación push</p>
                </div>
              </div>
              <Toggle value={sendNotification} onChange={() => setSendNotification(!sendNotification)} />
            </div>

            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                    <Paperclip size={18} strokeWidth={1.75} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Adjuntos</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>PDF, imagen, documento</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachments(prev => [...prev, `archivo_${prev.length + 1}.pdf`])}
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--muted-foreground)', fontWeight: 700 }}
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Agregar
                </button>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
                      <File size={14} strokeWidth={1.75} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                      <span className="text-xs flex-1 truncate" style={{ color: 'var(--foreground)', fontWeight: 700 }}>{att}</span>
                      <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}>
                        <X size={13} style={{ color: 'var(--muted-foreground)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2.5 mb-6"
            style={{
              background: GRADIENT,
              fontWeight: 800,
              fontSize: 16,
              boxShadow: CTA_SHADOW,
            }}
          >
            <Check size={20} /> {isEditing ? 'Guardar cambios' : (isRegistro ? 'Guardar anotación' : 'Guardar evento')}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
