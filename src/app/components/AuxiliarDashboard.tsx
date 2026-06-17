import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, ClipboardList } from 'lucide-react';
import type { Entry, User, Screen } from './data';
import { isEntryVisible, shortSectionLabel } from './data';
import { EntryCard } from './EntryCard';
import { EntryDetailModal } from './EntryDetailModal';
import { HomeTopBar } from './HomeTopBar';
import { CTA_GRADIENT, CTA_SHADOW, SUMMARY_CARD_BG, SUMMARY_CARD_BORDER, SUMMARY_CARD_SHADOW, datePillStyle, SELECTED_TEXT } from './uiStyles';

interface AuxiliarDashboardProps {
  user: User;
  entries: Entry[];
  selectedSection: string;
  onSelectSection: (section: string) => void;
  onNavigate: (screen: Screen) => void;
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
  unreadNotifications: number;
  unreadMessages: number;
}

const todayStr = '2026-06-13';

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function getDateLabel() {
  const d = new Date('2026-06-13T12:00:00');
  const day = DAYS_ES[d.getDay()];
  return `${day.charAt(0).toUpperCase() + day.slice(1)}, ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}

const WEEK = [
  { label: 'L', date: '2026-06-09', day: 9 },
  { label: 'M', date: '2026-06-10', day: 10 },
  { label: 'X', date: '2026-06-11', day: 11 },
  { label: 'J', date: '2026-06-12', day: 12 },
  { label: 'V', date: '2026-06-13', day: 13 },
  { label: 'S', date: '2026-06-14', day: 14 },
  { label: 'D', date: '2026-06-15', day: 15 },
];

export function AuxiliarDashboard({
  user,
  entries,
  selectedSection,
  onSelectSection,
  onNavigate,
  onEditEntry,
  onDeleteEntry,
  unreadNotifications,
  unreadMessages,
}: AuxiliarDashboardProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const sections = user.sections ?? [];
  const context = { selectedSection };
  const sectionEntries = entries.filter(e => isEntryVisible(e, user, context));
  const todayEntries = sectionEntries.filter(e => e.date === todayStr);
  const tasksToday = todayEntries.filter(e => e.type === 'tarea').length;
  const comunicadosToday = todayEntries.filter(e => e.type === 'comunicado').length;
  const unconfirmed = todayEntries.filter(e => e.type === 'comunicado' && e.readBy.length === 0).length;
  const important = todayEntries.filter(e => e.isImportant).length;

  const stats = [
    { label: 'Registros', value: todayEntries.length },
    { label: 'Comunicados', value: comunicadosToday },
    { label: 'Sin leer', value: unconfirmed },
    { label: 'Importantes', value: important },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <HomeTopBar
        unreadNotifications={unreadNotifications}
        unreadMessages={unreadMessages}
        onNavigate={onNavigate}
        sections={sections}
        selectedSection={selectedSection}
        onSelectSection={onSelectSection}
      />
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header card — fecha + sección + stats en una sola tarjeta */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-4 mb-4 rounded-3xl relative overflow-hidden"
          style={{
            backgroundColor: SUMMARY_CARD_BG,
            border: SUMMARY_CARD_BORDER,
            boxShadow: SUMMARY_CARD_SHADOW,
          }}
        >

          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
            <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', backgroundColor: 'var(--primary-muted)', opacity: 0.45, top: -60, right: -40 }} />
            <div style={{ position: 'absolute', width: 110, height: 110, borderRadius: '50%', backgroundColor: 'var(--primary-muted)', opacity: 0.35, bottom: -30, left: -30 }} />
            <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--primary-muted)', opacity: 0.3, top: 10, left: '40%' }} />
          </div>

          <div className="relative z-10">
          <div className="px-5 pt-5 pb-5 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-shrink-0">
              <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{getDateLabel()}</p>
              <p className="mt-2" style={{ fontWeight: 900, fontSize: 34, color: 'var(--foreground)', lineHeight: 1, letterSpacing: -1 }}>
                {shortSectionLabel(selectedSection)}
              </p>
            </div>

            <div
              className="grid grid-cols-2 flex-shrink-0 pl-4"
              style={{ borderLeft: '1px solid var(--border)' }}
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex flex-col items-center text-center min-w-[4.5rem] px-3 py-2"
                  style={{
                    borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--foreground)', lineHeight: 1 }}>{s.value}</p>
                  <p className="mt-1 text-[10px] leading-tight" style={{ color: 'var(--muted-foreground)', fontWeight: 700 }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
          </div>
        </motion.div>

        {/* Week strip */}
        <div className="px-5 mb-4">
          <div className="flex gap-1.5">
            {WEEK.map(w => {
              const isToday = w.date === todayStr;
              const hasEntries = sectionEntries.filter(e => e.date === w.date).length > 0;
              return (
                <div
                  key={w.date}
                  className="flex-1 flex flex-col items-center py-2.5 rounded-2xl"
                  style={datePillStyle(isToday)}
                >
                  <span className="text-[10px] mb-1" style={{ color: isToday ? 'var(--primary-muted-text)' : 'var(--muted-foreground)', fontWeight: 700 }}>
                    {w.label}
                  </span>
                  <span style={{ fontWeight: 900, fontSize: 15, color: isToday ? SELECTED_TEXT : 'var(--foreground)' }}>
                    {w.day}
                  </span>
                  {hasEntries && (
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5"
                      style={{ backgroundColor: isToday ? SELECTED_TEXT : 'var(--primary)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Nueva anotación CTA */}
        <div className="px-5 mb-5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('nueva-anotacion')}
            className="w-full flex items-center justify-between px-5 py-4 rounded-3xl"
            style={{
              background: CTA_GRADIENT,
              boxShadow: CTA_SHADOW,
            }}
          >
            <div>
              <p className="text-white text-sm" style={{ fontWeight: 900 }}>Nueva anotación</p>
              <p className="text-white/60 text-xs">Registrar actividad del día</p>
            </div>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Plus size={22} className="text-white" strokeWidth={2.5} />
            </div>
          </motion.button>
        </div>

        {/* Today's entries */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>Registros de hoy</h2>
            <button onClick={() => onNavigate('agenda')} className="text-sm" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Ver todos →
            </button>
          </div>

          {todayEntries.length === 0 ? (
            <div
              className="flex flex-col items-center py-10 px-6 text-center rounded-3xl"
              style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 16px rgba(26,23,64,0.06)' }}
            >
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <ClipboardList size={28} strokeWidth={1.75} style={{ color: 'var(--primary)' }} />
              </div>
              <p className="mt-3" style={{ fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>Sin registros aún</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Comenzá registrando la primera actividad.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEntries.slice(0, 3).map(entry => (
                <EntryCard key={entry.id} entry={entry} userId="" compact showAudienceBadge onPress={setSelectedEntry} />
              ))}
              {todayEntries.length > 3 && (
                <button
                  onClick={() => onNavigate('agenda')}
                  className="w-full py-3.5 rounded-2xl text-sm"
                  style={{ backgroundColor: 'var(--card)', color: 'var(--primary)', fontWeight: 800, border: '1.5px dashed var(--primary-dashed)', boxShadow: '0 1px 6px rgba(26,23,64,0.05)' }}
                >
                  Ver {todayEntries.length - 3} más →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <EntryDetailModal
        entry={selectedEntry}
        userId=""
        canManage
        showAudienceBadge
        onClose={() => setSelectedEntry(null)}
        onEdit={(entry) => {
          setSelectedEntry(null);
          onEditEntry?.(entry);
        }}
        onDelete={onDeleteEntry}
      />
    </div>
  );
}
