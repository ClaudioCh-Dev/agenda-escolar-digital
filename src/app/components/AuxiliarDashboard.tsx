import { motion } from 'motion/react';
import { Plus, BookOpen, Megaphone, AlertCircle, CheckCircle2, TrendingUp, Bell } from 'lucide-react';
import type { Entry, User, Screen } from './data';
import { EntryCard } from './EntryCard';

interface AuxiliarDashboardProps {
  user: User;
  entries: Entry[];
  onNavigate: (screen: Screen) => void;
  onSendNotification: (title: string, body: string) => void;
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

export function AuxiliarDashboard({ user, entries, onNavigate, onSendNotification }: AuxiliarDashboardProps) {
  const todayEntries = entries.filter(e => e.date === todayStr);
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
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header card — fecha + sección + stats en una sola tarjeta */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-12 mb-4 rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, #6C4FE8 0%, #9B7BFF 100%)',
            boxShadow: '0 8px 32px rgba(108,79,232,0.35)',
          }}
        >
          {/* Círculos decorativos */}
          <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 110, height: 110, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', bottom: -30, left: -30, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', top: 10, left: '40%', pointerEvents: 'none' }} />

          {/* Top row: fecha + sección */}
          <div className="px-5 pt-5 pb-4 relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{getDateLabel()}</p>
            <p className="mt-0.5" style={{ fontWeight: 800, fontSize: 15, color: '#ffffff' }}>{user.section}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 relative">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col items-center py-4"
                style={{ borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}
              >
                <p style={{ fontWeight: 900, fontSize: 22, color: '#ffffff', lineHeight: 1 }}>{s.value}</p>
                <p className="mt-1.5 text-[10px] leading-tight text-center px-1" style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Week strip */}
        <div className="px-5 mb-4">
          <div className="flex gap-1.5">
            {WEEK.map(w => {
              const isToday = w.date === todayStr;
              const hasEntries = entries.filter(e => e.date === w.date).length > 0;
              return (
                <div
                  key={w.date}
                  className="flex-1 flex flex-col items-center py-2.5 rounded-2xl"
                  style={{
                    background: isToday ? 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)' : 'var(--card)',
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
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5"
                      style={{ backgroundColor: isToday ? 'rgba(255,255,255,0.6)' : 'var(--primary)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alert */}
        {unconfirmed > 0 && (
          <div className="px-5 mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 rounded-3xl"
              style={{ backgroundColor: '#FFE8EC', border: '1px solid rgba(255,92,114,0.2)' }}
            >
              <AlertCircle size={20} style={{ color: '#FF5C72', flexShrink: 0 }} strokeWidth={2.5} />
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: '#CC2A3F', fontWeight: 800 }}>
                  {unconfirmed} comunicado{unconfirmed > 1 ? 's' : ''} sin confirmar
                </p>
                <p className="text-xs" style={{ color: '#FF7A8A' }}>Los padres aún no han leído.</p>
              </div>
              <button
                onClick={() => onSendNotification('Recordatorio', 'Por favor confirmá la lectura de los comunicados del día.')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs flex-shrink-0"
                style={{ backgroundColor: '#FF5C72', fontWeight: 800 }}
              >
                <Bell size={11} strokeWidth={2.5} /> Notificar
              </button>
            </motion.div>
          </div>
        )}

        {/* Nueva anotación CTA */}
        <div className="px-5 mb-5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('nueva-anotacion')}
            className="w-full flex items-center justify-between px-5 py-4 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)',
              boxShadow: '0 8px 24px rgba(108,79,232,0.35)',
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
            <button onClick={() => onNavigate('agenda')} className="text-sm" style={{ color: '#6C63FF', fontWeight: 700 }}>
              Ver todos →
            </button>
          </div>

          {todayEntries.length === 0 ? (
            <div
              className="flex flex-col items-center py-10 px-6 text-center rounded-3xl"
              style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 16px rgba(26,23,64,0.06)' }}
            >
              <span style={{ fontSize: 48 }}>📋</span>
              <p className="mt-3" style={{ fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>Sin registros aún</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Comenzá registrando la primera actividad.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEntries.slice(0, 3).map(entry => (
                <EntryCard key={entry.id} entry={entry} userId="" compact />
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

        {/* Quick checklist */}
        <div className="px-5 mt-5">
          <h2 style={{ fontWeight: 800, fontSize: 17, color: 'var(--foreground)', marginBottom: 12 }}>Checklist del día</h2>
          <div
            className="rounded-3xl p-4 space-y-3"
            style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 16px rgba(26,23,64,0.06)' }}
          >
            {[
              { label: 'Registrar tarea del día', done: tasksToday > 0 },
              { label: 'Publicar comunicado', done: comunicadosToday > 0 },
              { label: 'Notificar a los padres', done: false },
              { label: 'Registrar asistencia', done: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: item.done ? '#10CDA0' : 'var(--muted)',
                    border: item.done ? 'none' : '1.5px solid var(--border)',
                  }}
                >
                  {item.done && <CheckCircle2 size={13} className="text-white" strokeWidth={2.5} />}
                </div>
                <span
                  className="text-sm flex-1"
                  style={{
                    color: item.done ? 'var(--muted-foreground)' : 'var(--foreground)',
                    fontWeight: item.done ? 500 : 700,
                    textDecoration: item.done ? 'line-through' : 'none',
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
