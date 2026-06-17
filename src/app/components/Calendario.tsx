import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, PartyPopper, FileText, Users, Drama, Star, BookOpen, Bell, X, Pencil, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CalendarEvent, Screen } from './data';
import { SectionDropdown } from './SectionDropdown';
import { ConfirmDialog } from './ConfirmDialog';

interface CalendarioProps {
  events: CalendarEvent[];
  canManage?: boolean;
  sections?: string[];
  selectedSection?: string;
  onSelectSection?: (section: string) => void;
  onScheduleEvent?: (date: string) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (id: string) => void;
  onNavigate?: (screen: Screen) => void;
  unreadNotifications?: number;
}

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_HEADER = ['D','L','M','X','J','V','S'];

const EVENT_CFG: Record<CalendarEvent['type'], { label: string; icon: LucideIcon; color: string; bg: string }> = {
  festivo:  { label: 'Día festivo',   icon: PartyPopper, color: 'var(--cal-festivo-color)', bg: 'var(--cal-festivo-bg)' },
  examen:   { label: 'Examen',        icon: FileText,    color: 'var(--cal-examen-color)', bg: 'var(--cal-examen-bg)' },
  reunion:  { label: 'Reunión',       icon: Users,       color: 'var(--cal-reunion-color)', bg: 'var(--cal-reunion-bg)' },
  actuacion:{ label: 'Actuación',     icon: Drama,       color: 'var(--cal-actuacion-color)', bg: 'var(--cal-actuacion-bg)' },
  evento:   { label: 'Evento',        icon: Star,        color: 'var(--cal-evento-color)', bg: 'var(--cal-evento-bg)' },
  tarea:    { label: 'Tarea',         icon: BookOpen,    color: 'var(--primary)', bg: 'var(--primary-muted)' },
};

function EventIcon({ type, size = 20 }: { type: CalendarEvent['type']; size?: number }) {
  const cfg = EVENT_CFG[type];
  const Icon = cfg.icon;
  return <Icon size={size} strokeWidth={1.75} style={{ color: cfg.color }} />;
}

function formatEventDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function Calendario({
  events,
  canManage = false,
  sections = [],
  selectedSection,
  onSelectSection,
  onScheduleEvent,
  onEditEvent,
  onDeleteEvent,
  onNavigate,
  unreadNotifications = 0,
}: CalendarioProps) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-06-13');
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const getDateStr = (day: number) => `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const getEventsForDay = (day: number) => events.filter(e => e.date === getDateStr(day));

  const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];
  const selectedDay = selectedDate ? parseInt(selectedDate.split('-')[2]) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 16px rgba(26,23,64,0.05)' }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--foreground)', letterSpacing: -0.5 }}>Calendario Escolar</h1>
            {canManage && sections.length > 0 && onSelectSection && selectedSection && (
              <SectionDropdown
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={onSelectSection}
              />
            )}
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('notificaciones')}
              aria-label="Notificaciones"
              className="relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <Bell size={20} strokeWidth={1.8} style={{ color: 'var(--muted-foreground)' }} />
              {unreadNotifications > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-card"
                  style={{ backgroundColor: 'var(--destructive)', fontSize: 9, fontWeight: 800, color: '#ffffff' }}
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)' }}>
            <ChevronLeft size={18} style={{ color: 'var(--muted-foreground)' }} />
          </button>
          <h2 style={{ fontWeight: 900, fontSize: 18, color: 'var(--foreground)' }}>{MONTHS_ES[month]} {year}</h2>
          <button onClick={nextMonth} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)' }}>
            <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Calendar grid */}
        <div className="px-4 pt-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_HEADER.map(d => (
              <div key={d} className="text-center py-1.5" style={{ fontWeight: 800, fontSize: 11, color: 'var(--muted-foreground)' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div
            className="rounded-3xl overflow-hidden p-2"
            style={{ backgroundColor: 'var(--card)', boxShadow: '0 4px 24px rgba(26,23,64,0.08)' }}
          >
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: totalCells }, (_, i) => {
                const day = i - firstDay + 1;
                if (day < 1 || day > daysInMonth) return <div key={i} />;

                const dateStr = getDateStr(day);
                const dayEvents = getEventsForDay(day);
                const isToday = dateStr === '2026-06-13';
                const isSelected = dateStr === selectedDate;
                const isWeekend = (i % 7) === 0 || (i % 7) === 6;

                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className="flex flex-col items-center py-2 rounded-2xl transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--primary)' : isToday ? 'var(--muted)' : 'transparent',
                      boxShadow: isSelected ? '0 4px 12px var(--primary-shadow-sm)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: isToday || isSelected ? 900 : isWeekend ? 500 : 700,
                        fontSize: 14,
                        color: isSelected ? 'white' : isToday ? 'var(--primary)' : isWeekend ? 'var(--muted-foreground)' : 'var(--foreground)',
                      }}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 justify-center">
                        {dayEvents.slice(0, 5).map((ev, ei) => (
                          <span
                            key={ei}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: EVENT_CFG[ev.type].color }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {Object.entries(EVENT_CFG).filter(([k]) => k !== 'tarea').map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day events */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="px-5 pb-2"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
                  {selectedDay} de {MONTHS_ES[month]}
                  {selectedDate === '2026-06-13' && <span className="ml-2 text-sm" style={{ color: 'var(--primary)' }}>Hoy</span>}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                    {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''}
                  </span>
                  {canManage && onScheduleEvent && selectedDate && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onScheduleEvent(selectedDate)}
                      className="text-xs px-3 py-1.5 rounded-xl"
                      style={{ background: 'var(--primary-gradient-cta)', color: '#ffffff', fontWeight: 700 }}
                    >
                      Programar evento
                    </motion.button>
                  )}
                </div>
              </div>

              {selectedEvents.length === 0 ? (
                <div
                  className="p-6 text-center rounded-3xl"
                  style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 12px rgba(26,23,64,0.06)' }}
                >
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Sin eventos para este día</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedEvents.map(event => {
                    const cfg = EVENT_CFG[event.type];
                    return (
                      <motion.button
                        key={event.id}
                        type="button"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDetailEvent(event)}
                        className="flex w-full items-start gap-3 p-3.5 rounded-3xl text-left"
                        style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 12px rgba(26,23,64,0.06)', border: '1px solid var(--border)' }}
                      >
                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full text-center leading-tight whitespace-nowrap"
                            style={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700 }}
                          >
                            {cfg.label}
                          </span>
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: cfg.bg }}
                          >
                            <EventIcon type={event.type} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>{event.title}</p>
                          {event.description && (
                            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                              {event.description}
                            </p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming */}
        <div className="px-5 pb-4">
          <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--foreground)', marginBottom: 12 }}>Próximos eventos</h3>
          <div className="space-y-2.5">
            {[...events]
              .filter(e => e.date >= '2026-06-13')
              .sort((a,b) => a.date.localeCompare(b.date))
              .slice(0,5)
              .map(event => {
                const cfg = EVENT_CFG[event.type];
                const d = new Date(event.date + 'T12:00:00');
                const daysDiff = Math.round((d.getTime() - new Date('2026-06-13T12:00:00').getTime()) / 86400000);
                return (
                  <motion.button
                    key={event.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDetailEvent(event)}
                    className="flex w-full items-center gap-3 p-3.5 rounded-3xl text-left"
                    style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 12px rgba(26,23,64,0.06)', border: '1px solid var(--border)' }}
                  >
                    <div className="w-12 text-center flex-shrink-0">
                      <p className="text-[10px]" style={{ color: 'var(--muted-foreground)', fontWeight: 700 }}>
                        {MONTHS_ES[d.getMonth()].slice(0,3).toUpperCase()}
                      </p>
                      <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--foreground)', lineHeight: 1 }}>{d.getDate()}</p>
                    </div>
                    <div className="w-px h-10 flex-shrink-0" style={{ backgroundColor: 'var(--border)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ fontWeight: 800, color: 'var(--foreground)' }}>{event.title}</p>
                      <p className="text-xs" style={{ color: cfg.color, fontWeight: 700 }}>
                        {daysDiff === 0 ? 'Hoy' : daysDiff === 1 ? 'Mañana' : `En ${daysDiff} días`}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                      <EventIcon type={event.type} />
                    </div>
                  </motion.button>
                );
              })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {detailEvent && (() => {
          const cfg = EVENT_CFG[detailEvent.type];
          return (
            <>
              <motion.button
                type="button"
                aria-label="Cerrar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDetailEvent(null)}
                className="fixed inset-0 z-50"
                style={{ backgroundColor: 'rgba(26, 23, 64, 0.45)' }}
              />
              <motion.div
                initial={{ opacity: 0, y: '-40%', scale: 0.96 }}
                animate={{ opacity: 1, y: '-50%', scale: 1 }}
                exit={{ opacity: 0, y: '-45%', scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="fixed left-5 right-5 top-1/2 z-[60] mx-auto max-w-[390px] rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 24px 64px rgba(26,23,64,0.22)',
                  maxHeight: 'min(80vh, 520px)',
                }}
              >
                <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <EventIcon type={detailEvent.type} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full inline-block"
                          style={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700 }}
                        >
                          {cfg.label}
                        </span>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                          {formatEventDate(detailEvent.date)}
                        </p>
                      </div>
                      <h3 className="text-base leading-snug" style={{ fontWeight: 900, color: 'var(--foreground)' }}>
                        {detailEvent.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailEvent(null)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <X size={18} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                </div>
                <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: 'calc(min(80vh, 520px) - 96px)' }}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    {detailEvent.description || 'Sin descripción adicional para este evento.'}
                  </p>

                  {canManage && onEditEvent && onDeleteEvent && (
                    <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          onEditEvent(detailEvent);
                          setDetailEvent(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm"
                        style={{ background: 'var(--primary-gradient-cta)', color: '#ffffff', fontWeight: 800 }}
                      >
                        <Pencil size={16} strokeWidth={2.5} /> Editar
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm"
                        style={{ backgroundColor: 'var(--muted)', color: '#FF5C72', fontWeight: 800 }}
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="¿Eliminar este evento?"
        description="Esta acción no se puede deshacer. El evento desaparecerá del calendario escolar."
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => {
          if (detailEvent && onDeleteEvent) {
            onDeleteEvent(detailEvent.id);
            setDetailEvent(null);
          }
          setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
}
