import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal, BookOpen, Megaphone, Package, Eye, Bell, FileText, Star } from 'lucide-react';
import type { Entry, User, EntryType, Screen } from './data';
import { entryTypeConfig } from './data';
import { EntryCard } from './EntryCard';

interface AgendaDiariaProps {
  user: User;
  entries: Entry[];
  onNavigate: (screen: Screen) => void;
  onConfirmRead: (entryId: string) => void;
}

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS_SHORT = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const ICONS: Record<EntryType, React.ElementType> = {
  tarea: BookOpen, comunicado: Megaphone, material: Package,
  observacion: Eye, recordatorio: Bell, examen: FileText, evento: Star,
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_ES[d.getMonth()]}`;
}

const ALL_TYPES = ['tarea','comunicado','material','observacion','recordatorio','examen','evento'] as EntryType[];

export function AgendaDiaria({ user, entries, onNavigate, onConfirmRead }: AgendaDiariaProps) {
  const [currentDate, setCurrentDate] = useState('2026-06-13');
  const [filterType, setFilterType] = useState<EntryType | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const isAuxiliar = user.role === 'auxiliar';
  const isToday = currentDate === '2026-06-13';
  const isFuture = currentDate > '2026-06-13';

  const filteredEntries = entries
    .filter(e => e.date === currentDate)
    .filter(e => !filterType || e.type === filterType)
    .sort((a, b) => a.time.localeCompare(b.time));

  const typeCounts = entries.filter(e => e.date === currentDate).reduce<Record<string,number>>((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1; return acc;
  }, {});

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-4"
        style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--foreground)', letterSpacing: -0.5 }}>Agenda</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm"
              style={{
                backgroundColor: showFilters ? 'var(--primary)' : 'var(--muted)',
                color: showFilters ? '#ffffff' : 'var(--muted-foreground)',
                fontWeight: 700,
              }}
            >
              <SlidersHorizontal size={14} strokeWidth={2.5} /> Filtrar
            </button>
            {isAuxiliar && isToday && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => onNavigate('nueva-anotacion')}
                className="w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)', boxShadow: '0 4px 12px rgba(108,79,232,0.28)' }}
              >
                <Plus size={17} style={{ color: 'var(--primary-foreground)' }} strokeWidth={2.5} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setCurrentDate(prev => addDays(prev, -1))}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <ChevronLeft size={18} style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.8} />
          </button>
          <div className="flex-1 text-center">
            <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>
              {isToday ? 'Hoy · ' : ''}{formatDate(currentDate)}
            </p>
            {isAuxiliar && !isToday && !isFuture && (
              <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>Solo lectura</p>
            )}
          </div>
          <button
            onClick={() => { if (!isToday) setCurrentDate(prev => addDays(prev, 1)); }}
            disabled={isToday}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--muted)', opacity: isToday ? 0.35 : 1 }}
          >
            <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.8} />
          </button>
        </div>

        {/* Week strip */}
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[-3,-2,-1,0].map(offset => {
            const d = addDays('2026-06-13', offset);
            const date = new Date(d + 'T12:00:00');
            const isSelected = d === currentDate;
            const count = entries.filter(e => e.date === d).length;
            return (
              <button
                key={d}
                onClick={() => setCurrentDate(d)}
                className="flex flex-col items-center px-3.5 py-2.5 rounded-2xl flex-shrink-0 transition-all"
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)' : 'var(--muted)',
                  boxShadow: isSelected ? '0 4px 14px rgba(108,79,232,0.28)' : 'none',
                }}
              >
                <span className="text-[10px]" style={{ color: isSelected ? 'rgba(255,255,255,0.55)' : 'var(--muted-foreground)', fontWeight: 700 }}>
                  {DAYS_SHORT[date.getDay()]}
                </span>
                <span style={{ fontWeight: 900, fontSize: 16, color: isSelected ? 'white' : 'var(--foreground)' }}>
                  {date.getDate()}
                </span>
                {count > 0 && (
                  <span
                    className="w-1 h-1 rounded-full mt-1"
                    style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.5)' : 'var(--muted-foreground)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex gap-2 px-5 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setFilterType(null)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs"
                style={{
                  backgroundColor: !filterType ? 'var(--primary)' : 'var(--muted)',
                  color: !filterType ? '#ffffff' : 'var(--muted-foreground)',
                  fontWeight: 700,
                }}
              >
                Todos ({entries.filter(e => e.date === currentDate).length})
              </button>
              {ALL_TYPES.map(type => {
                const count = typeCounts[type] || 0;
                if (!count) return null;
                const config = entryTypeConfig[type];
                const isActive = filterType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(isActive ? null : type)}
                    className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs"
                    style={{
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--muted)',
                      color: isActive ? '#ffffff' : 'var(--muted-foreground)',
                      fontWeight: 700,
                    }}
                  >
                    {config.label} ({count})
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto pb-24 px-5 py-4">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <BookOpen size={28} style={{ color: 'var(--muted-foreground)' }} strokeWidth={2.5} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>Sin registros</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {isAuxiliar && isToday ? 'Empezá registrando la primera actividad.' : 'No hay actividades para este día.'}
            </p>
            {isAuxiliar && isToday && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('nueva-anotacion')}
                className="mt-5 flex items-center gap-2 px-6 py-3.5 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)', color: '#ffffff', fontWeight: 800, boxShadow: '0 6px 20px rgba(108,79,232,0.30)' }}
              >
                <Plus size={16} strokeWidth={2.5} /> Nueva anotación
              </motion.button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Thin timeline line */}
            <div
              className="absolute top-4 bottom-4"
              style={{ left: 19, width: 1, backgroundColor: 'var(--border)' }}
            />

            <div className="space-y-4">
              {filteredEntries.map((entry, i) => {
                const Icon = ICONS[entry.type];
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4"
                  >
                    {/* Minimal dot — just an icon on neutral bg */}
                    <div className="flex flex-col items-center flex-shrink-0 z-10">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: 'var(--muted)' }}
                      >
                        <Icon size={16} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
                      </div>
                      <span
                        className="text-[10px] mt-1"
                        style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}
                      >
                        {entry.time}
                      </span>
                    </div>

                    {/* Card */}
                    <div className="flex-1 min-w-0 pb-2">
                      <EntryCard
                        entry={entry}
                        userId={user.id}
                        onConfirmRead={onConfirmRead}
                        isReadOnly={user.role !== 'auxiliar'}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
