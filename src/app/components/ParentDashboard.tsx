import { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, ChevronRight, CheckCircle2, CalendarDays } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Entry, User, Screen, Child, AppNotification } from './data';
import { isEntryVisible } from './data';
import { EntryCard } from './EntryCard';
import { EntryDetailModal } from './EntryDetailModal';
import { HomeTopBar } from './HomeTopBar';
import { datePillStyle, SELECTED_TEXT, SUMMARY_CARD_BG, SUMMARY_CARD_BORDER, SUMMARY_CARD_SHADOW } from './uiStyles';

interface ParentDashboardProps {
  user: User;
  entries: Entry[];
  notifications: AppNotification[];
  selectedChild: Child | null;
  onNavigate: (screen: Screen) => void;
  onConfirmRead: (entryId: string) => void;
  onSelectChild: (child: Child) => void;
  unreadNotifications: number;
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

export function ParentDashboard({
  user,
  entries,
  notifications,
  selectedChild,
  onNavigate,
  onConfirmRead,
  onSelectChild,
  unreadNotifications,
}: ParentDashboardProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const isAlumno = user.role === 'alumno';
  const child = selectedChild || user.children?.[0];
  const visibilityContext = { selectedChildId: child?.id };
  const visibleEntries = entries.filter(e => isEntryVisible(e, user, visibilityContext));
  const todayEntries = visibleEntries.filter(e => e.date === todayStr);
  const pendingTasks = visibleEntries.filter(e => e.type === 'tarea' && e.date >= todayStr).length;
  const unreadComm = todayEntries.filter(e => e.type === 'comunicado' && !e.readBy.includes(user.id)).length;
  const unreadNotifs = unreadNotifications;
  const upcomingExam = visibleEntries.find(e => e.type === 'examen' && e.date > todayStr);

  const stats = [
    { label: 'Tareas pendientes', value: pendingTasks },
    { label: 'Comunicados sin leer', value: unreadComm },
    { label: 'Notificaciones', value: unreadNotifs },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <HomeTopBar
        unreadNotifications={unreadNotifications}
        onNavigate={onNavigate}
        showChat={false}
        childList={user.children}
        selectedChild={child ?? undefined}
        onSelectChild={onSelectChild}
      />
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header card — fecha + hijo + stats */}
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
            <div className="px-5 pt-5 pb-4 relative" style={{ borderBottom: '1px solid var(--border)' }}>
              {isAlumno ? (
                <>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{getDateLabel()}</p>
                  <div className="flex items-center justify-start gap-3 mt-3">
                    <div className="shrink-0 px-1.5">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="block w-16 h-16 rounded-2xl object-cover"
                          style={{ border: '2px solid var(--border)' }}
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
                          style={{ backgroundColor: 'var(--primary)', fontWeight: 900, fontSize: 18, border: '2px solid var(--border)' }}
                        >
                          {user.initials}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 px-1.5">
                      <p style={{ fontWeight: 900, fontSize: 34, color: 'var(--foreground)', lineHeight: 1, letterSpacing: -1 }}>
                        {user.name.split(' ')[0]}
                      </p>
                      {user.section && (
                        <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                          {user.section}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
              <div className="flex items-stretch">
                <div className="w-max max-w-[calc(100%-5rem)] min-w-0">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{getDateLabel()}</p>
                  <p className="mt-3 ml-1.5" style={{ fontWeight: 900, fontSize: 34, color: 'var(--foreground)', lineHeight: 1, letterSpacing: -1 }}>
                    {child ? child.name.split(' ')[0] : user.name.split(' ')[0]}
                  </p>
                  {child && (
                    <p className="text-xs mt-1.5 ml-1.5" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                      {child.section} · {child.grade}
                    </p>
                  )}
                </div>
                {child && (
                  <div className="flex-1 min-w-0 flex items-end justify-center pl-3">
                    {child.avatar ? (
                      <img
                        src={child.avatar}
                        alt={child.name}
                        className="block w-16 h-16 rounded-2xl object-cover"
                        style={{ border: '2px solid var(--border)' }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
                        style={{ backgroundColor: child.color, fontWeight: 900, fontSize: 18, border: '2px solid var(--border)' }}
                      >
                        {child.initials}
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}
            </div>

            <div className="grid grid-cols-3 relative">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex flex-col items-center py-4"
                  style={{ borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <p style={{ fontWeight: 900, fontSize: 22, color: 'var(--foreground)', lineHeight: 1 }}>{s.value}</p>
                  <p className="mt-1.5 text-[10px] leading-tight text-center px-1" style={{ color: 'var(--muted-foreground)', fontWeight: 700 }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Week strip */}
        <div className="px-5 mb-4">
          <div className="flex gap-1.5">
            {WEEK.map(w => {
              const isToday = w.date === todayStr;
              const hasEntries = visibleEntries.filter(e => e.date === w.date).length > 0;
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
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: isToday ? SELECTED_TEXT : 'var(--primary)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming exam alert */}
        {upcomingExam && (
          <div className="px-5 mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 rounded-3xl"
              style={{ backgroundColor: '#FFF8DC', border: '1px solid rgba(255,203,61,0.3)' }}
            >
              <span style={{ fontSize: 22 }}>📝</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: '#92610A', fontWeight: 800 }}>Examen próximo</p>
                <p className="text-xs truncate" style={{ color: '#B07820' }}>{upcomingExam.title}</p>
              </div>
              <button onClick={() => onNavigate('agenda')} className="text-xs flex-shrink-0" style={{ color: '#92610A', fontWeight: 800 }}>Ver →</button>
            </motion.div>
          </div>
        )}

        {/* Today's agenda */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>Agenda de hoy</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate('agenda')} className="text-sm" style={{ color: 'var(--primary)', fontWeight: 700 }}>Ver todo →</button>
            </div>
          </div>

          {todayEntries.length === 0 ? (
            <div
              className="flex flex-col items-center py-10 text-center rounded-3xl"
              style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 16px rgba(26,23,64,0.06)' }}
            >
              <CheckCircle2 size={36} style={{ color: '#10CDA0', marginBottom: 8 }} strokeWidth={2.5} />
              <p style={{ fontWeight: 800, color: 'var(--foreground)' }}>Sin actividades hoy</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>La auxiliar no ha registrado nada aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEntries.slice(0, 3).map(entry => (
                <EntryCard key={entry.id} entry={entry} userId={user.id} onConfirmRead={onConfirmRead} onPress={setSelectedEntry} isReadOnly compact={false} showAudienceBadge />
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

        {/* Quick links */}
        <div className="px-5">
          <h2 style={{ fontWeight: 800, fontSize: 17, color: 'var(--foreground)', marginBottom: 12 }}>Acceso rápido</h2>
          <div className="space-y-2.5">
            {([
              { label: 'Calendario escolar', desc: 'Fechas importantes y eventos', screen: 'calendario' as Screen, color: 'var(--primary)', icon: CalendarDays },
              { label: 'Notificaciones', desc: `${unreadNotifs} sin leer`, screen: 'notificaciones' as Screen, color: 'var(--primary)', icon: Bell },
            ] as { label: string; desc: string; screen: Screen; color: string; icon: LucideIcon }[]).map(item => {
              const Icon = item.icon;
              return (
              <motion.button
                key={item.screen}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(item.screen)}
                className="w-full flex items-center gap-3.5 p-4 rounded-3xl text-left"
                style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 12px rgba(26,23,64,0.06)', border: '1px solid var(--border)' }}
              >
                <Icon size={28} style={{ color: item.color, flexShrink: 0 }} strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} strokeWidth={2.5} />
              </motion.button>
            );
            })}
          </div>
        </div>
      </div>

      <EntryDetailModal
        entry={selectedEntry}
        userId={user.id}
        isReadOnly
        showAudienceBadge
        onClose={() => setSelectedEntry(null)}
        onConfirmRead={onConfirmRead}
      />
    </div>
  );
}
