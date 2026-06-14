import { motion } from 'motion/react';
import { BookOpen, Megaphone, Package, Eye, Bell, FileText, Star, Check, CheckCheck } from 'lucide-react';
import type { AppNotification, EntryType } from './data';

interface NotificacionesProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const ICONS: Record<EntryType, React.ElementType> = {
  tarea: BookOpen,
  comunicado: Megaphone,
  material: Package,
  observacion: Eye,
  recordatorio: Bell,
  examen: FileText,
  evento: Star,
};

const TYPE_LABEL: Record<EntryType, string> = {
  tarea: 'Tarea',
  comunicado: 'Comunicado',
  material: 'Material',
  observacion: 'Observación',
  recordatorio: 'Recordatorio',
  examen: 'Examen',
  evento: 'Evento',
};

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  const now = new Date('2026-06-13T14:00:00');
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function Notificaciones({ notifications, onMarkRead, onMarkAllRead }: NotificacionesProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const todayNotifs = notifications.filter(n => n.timestamp.startsWith('2026-06-13'));
  const olderNotifs = notifications.filter(n => !n.timestamp.startsWith('2026-06-13'));

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-4"
        style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--foreground)', letterSpacing: -0.5 }}>
              Notificaciones
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                {unreadCount} sin leer
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontWeight: 700 }}
            >
              <CheckCheck size={14} strokeWidth={1.8} /> Marcar todo
            </motion.button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center px-8">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <Bell size={28} style={{ color: 'var(--muted-foreground)' }} strokeWidth={2.5} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>Sin notificaciones</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Cuando la auxiliar registre actividades, aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <div>
                <p
                  className="px-5 pt-4 pb-2 text-[11px]"
                  style={{ color: 'var(--muted-foreground)', fontWeight: 800, letterSpacing: 0.6 }}
                >
                  HOY
                </p>
                <div className="space-y-px">
                  {todayNotifs.map((notif, i) => {
                    const Icon = ICONS[notif.type];
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => !notif.isRead && onMarkRead(notif.id)}
                        className="flex items-start gap-3.5 px-5 py-4 cursor-pointer"
                        style={{ backgroundColor: notif.isRead ? 'transparent' : 'var(--card)' }}
                      >
                        {/* Icon — always neutral */}
                        <div className="relative flex-shrink-0 mt-0.5">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: 'var(--muted)' }}
                          >
                            <Icon size={18} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
                          </div>
                          {/* Unread dot — only accent */}
                          {!notif.isRead && (
                            <span
                              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                              style={{ background: 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)' }}
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="text-[10px]"
                              style={{ color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}
                            >
                              {TYPE_LABEL[notif.type]}
                            </span>
                          </div>
                          <p
                            className="text-sm"
                            style={{ fontWeight: notif.isRead ? 600 : 800, color: 'var(--foreground)' }}
                          >
                            {notif.title.replace(/^[^ ]+ /, '')}
                          </p>
                          <p
                            className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {notif.body}
                          </p>
                          <p
                            className="text-[11px] mt-1.5"
                            style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}
                          >
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>

                        {notif.isRead && (
                          <Check size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 4 }} strokeWidth={2} />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {olderNotifs.length > 0 && (
              <div>
                <p
                  className="px-5 pt-4 pb-2 text-[11px]"
                  style={{ color: 'var(--muted-foreground)', fontWeight: 800, letterSpacing: 0.6 }}
                >
                  AYER
                </p>
                <div className="space-y-px opacity-60">
                  {olderNotifs.map((notif, i) => {
                    const Icon = ICONS[notif.type];
                    return (
                      <div
                        key={notif.id}
                        className="flex items-start gap-3.5 px-5 py-4"
                      >
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'var(--muted)' }}
                        >
                          <Icon size={18} style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                            {notif.title.replace(/^[^ ]+ /, '')}
                          </p>
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--muted-foreground)' }}>
                            {notif.body}
                          </p>
                          <p className="text-[11px] mt-1" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>
                        <Check size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 4 }} strokeWidth={2} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
