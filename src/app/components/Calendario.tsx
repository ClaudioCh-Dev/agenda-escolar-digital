import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from './data';

interface CalendarioProps {
  events: CalendarEvent[];
}

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_HEADER = ['D','L','M','X','J','V','S'];

const EVENT_CFG = {
  festivo:  { label: 'Día festivo',   emoji: '🎉', color: '#10CDA0', bg: '#E0FBF5' },
  examen:   { label: 'Examen',        emoji: '📝', color: '#FF5C72', bg: '#FFE8EC' },
  reunion:  { label: 'Reunión',       emoji: '👥', color: '#6C63FF', bg: '#EEECFF' },
  actuacion:{ label: 'Actuación',     emoji: '🎭', color: '#FFCB3D', bg: '#FFF8DC' },
  evento:   { label: 'Evento',        emoji: '⭐', color: '#FF8B5C', bg: '#FFF0E8' },
  tarea:    { label: 'Tarea',         emoji: '📚', color: '#6C63FF', bg: '#EEECFF' },
};

export function Calendario({ events }: CalendarioProps) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-06-13');

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
        <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--foreground)', letterSpacing: -0.5, marginBottom: 16 }}>Calendario Escolar</h1>
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
                      boxShadow: isSelected ? '0 4px 12px rgba(26,23,64,0.2)' : 'none',
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
                        {dayEvents.slice(0,3).map((ev, ei) => (
                          <span
                            key={ei}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : ev.color }}
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
                  {selectedDate === '2026-06-13' && <span className="ml-2 text-sm" style={{ color: '#6C63FF' }}>Hoy</span>}
                </h3>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                  {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''}
                </span>
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
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3.5 rounded-3xl"
                        style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 12px rgba(26,23,64,0.06)', border: '1px solid var(--border)' }}
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          {cfg.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>{event.title}</p>
                          <span
                            className="text-xs px-2.5 py-0.5 rounded-full inline-block mt-1"
                            style={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700 }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </motion.div>
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
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3.5 rounded-3xl"
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
                    <span className="text-xl flex-shrink-0">{cfg.emoji}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
