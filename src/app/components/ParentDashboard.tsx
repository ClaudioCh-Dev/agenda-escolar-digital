import { motion } from 'motion/react';
import { BookOpen, Megaphone, Bell, ChevronRight, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import type { Entry, User, Screen, Child, AppNotification } from './data';
import { EntryCard } from './EntryCard';

interface ParentDashboardProps {
  user: User;
  entries: Entry[];
  notifications: AppNotification[];
  selectedChild: Child | null;
  onNavigate: (screen: Screen) => void;
  onConfirmRead: (entryId: string) => void;
  onSelectChild: (child: Child) => void;
}

const todayStr = '2026-06-13';

const WEEK = [
  { label: 'L', date: '2026-06-09', day: 9 },
  { label: 'M', date: '2026-06-10', day: 10 },
  { label: 'X', date: '2026-06-11', day: 11 },
  { label: 'J', date: '2026-06-12', day: 12 },
  { label: 'V', date: '2026-06-13', day: 13 },
  { label: 'S', date: '2026-06-14', day: 14 },
  { label: 'D', date: '2026-06-15', day: 15 },
];

export function ParentDashboard({ user, entries, notifications, selectedChild, onNavigate, onConfirmRead, onSelectChild }: ParentDashboardProps) {
  const child = selectedChild || user.children?.[0];
  const todayEntries = entries.filter(e => e.date === todayStr);
  const pendingTasks = entries.filter(e => e.type === 'tarea' && e.date >= todayStr).length;
  const unreadComm = todayEntries.filter(e => e.type === 'comunicado' && !e.readBy.includes(user.id)).length;
  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const upcomingExam = entries.find(e => e.type === 'examen' && e.date > todayStr);

  const stats = [
    { label: 'Tareas\npendientes', value: pendingTasks },
    { label: 'Comunicados\nsin leer', value: unreadComm },
    { label: 'Notifi-\ncaciones', value: unreadNotifs },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Greeting */}
        <div className="px-5 pt-12 pb-2">
          <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>Sábado, 13 de junio · 2026</p>
          <div className="flex items-start justify-between">
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 28, color: 'var(--foreground)', letterSpacing: -0.8, lineHeight: 1.1 }}>
                ¡Hola,<br />{user.name.split(' ')[0]}! 👋
              </h1>
            </div>
            <div className="relative">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: '#10CDA0', fontWeight: 900, fontSize: 17 }}
              >
                {user.initials}
              </div>
              {unreadNotifs > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-background"
                  style={{ backgroundColor: '#FF5C72', fontSize: 9, fontWeight: 800 }}
                >
                  {unreadNotifs}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Child selector */}
        {user.children && user.children.length > 0 && (
          <div className="px-5 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {user.children.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => onSelectChild(ch)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: child?.id === ch.id ? 'var(--primary)' : 'var(--card)',
                    boxShadow: child?.id === ch.id ? '0 4px 16px rgba(108,79,232,0.28)' : '0 1px 6px rgba(26,23,64,0.06)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: child?.id === ch.id ? 'rgba(255,255,255,0.2)' : ch.color, fontWeight: 900, fontSize: 11 }}
                  >
                    {ch.initials}
                  </div>
                  <span
                    className="text-sm whitespace-nowrap"
                    style={{ color: child?.id === ch.id ? 'white' : 'var(--foreground)', fontWeight: 800 }}
                  >
                    {ch.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Week strip */}
        <div className="px-5 py-2 mb-2">
          <div className="flex gap-1.5">
            {WEEK.map(w => {
              const isToday = w.date === todayStr;
              const hasEntries = entries.filter(e => e.date === w.date).length > 0;
              return (
                <div
                  key={w.date}
                  className="flex-1 flex flex-col items-center py-2.5 rounded-2xl"
                  style={{
                    backgroundColor: isToday ? 'var(--primary)' : 'var(--card)',
                    boxShadow: isToday ? '0 4px 16px rgba(108,79,232,0.28)' : '0 1px 6px rgba(26,23,64,0.05)',
                  }}
                >
                  <span className="text-[10px] mb-1" style={{ color: isToday ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)', fontWeight: 700 }}>
                    {w.label}
                  </span>
                  <span style={{ fontWeight: 900, fontSize: 15, color: isToday ? 'white' : 'var(--foreground)' }}>
                    {w.day}
                  </span>
                  {hasEntries && (
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: isToday ? '#B8FF6B' : '#6C63FF' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 mb-4">
          <div className="grid grid-cols-3 gap-2.5">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-3 text-center"
                style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 12px rgba(26,23,64,0.06)' }}
              >
                <p style={{ fontWeight: 900, fontSize: 24, color: 'var(--foreground)', lineHeight: 1 }}>{s.value}</p>
                <p className="mt-1.5 text-[10px] whitespace-pre-line leading-tight" style={{ color: 'var(--muted-foreground)', fontWeight: 700 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Child card */}
        {child && (
          <div className="px-5 mb-4">
            <div
              className="flex items-center gap-3 p-4 rounded-3xl"
              style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 16px rgba(26,23,64,0.07)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                style={{ backgroundColor: child.color, fontWeight: 900, fontSize: 18 }}
              >
                {child.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>{child.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{child.section} · {child.grade}</p>
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#D1FAE5', color: '#065F46', fontWeight: 800 }}
              >
                ✓ Presente
              </span>
            </div>
          </div>
        )}

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
            <button onClick={() => onNavigate('agenda')} className="text-sm" style={{ color: '#6C63FF', fontWeight: 700 }}>Ver todo →</button>
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
                <EntryCard key={entry.id} entry={entry} userId={user.id} onConfirmRead={onConfirmRead} isReadOnly compact={false} />
              ))}
              {todayEntries.length > 3 && (
                <button
                  onClick={() => onNavigate('agenda')}
                  className="w-full py-3.5 rounded-2xl text-sm"
                  style={{ backgroundColor: 'var(--card)', color: '#6C63FF', fontWeight: 800, border: '1.5px dashed rgba(108,99,255,0.3)', boxShadow: '0 1px 6px rgba(26,23,64,0.05)' }}
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
            {[
              { label: 'Calendario escolar', desc: 'Fechas importantes y eventos', screen: 'calendario' as Screen, color: '#6C63FF', emoji: '📅' },
              { label: 'Notificaciones', desc: `${unreadNotifs} sin leer`, screen: 'notificaciones' as Screen, color: '#FF8B5C', emoji: '🔔' },
            ].map(item => (
              <motion.button
                key={item.screen}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(item.screen)}
                className="w-full flex items-center gap-3.5 p-4 rounded-3xl text-left"
                style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 12px rgba(26,23,64,0.06)', border: '1px solid var(--border)' }}
              >
                <span style={{ fontSize: 28 }}>{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} strokeWidth={2.5} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
