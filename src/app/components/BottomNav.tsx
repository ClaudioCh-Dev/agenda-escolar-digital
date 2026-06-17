import { motion } from 'motion/react';
import { Home, CalendarDays, User, BookOpen } from 'lucide-react';
// TODO: reactivar Bell y MessageCircle cuando Notificaciones/Chat vuelvan al navbar
import type { Screen, Role } from './data';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  role: Role;
  unreadMessages: number;
}

const AUXILIAR_TABS = [
  { id: 'dashboard', icon: Home, label: 'Inicio' },
  { id: 'agenda', icon: BookOpen, label: 'Agenda' },
  { id: 'calendario', icon: CalendarDays, label: 'Calendario' },
  // TODO: Notificaciones — pantalla modal vía campana; reactivar aquí si se necesita en navbar
  // { id: 'notificaciones', icon: Bell, label: 'Notificaciones' },
  // TODO: Chat auxiliar ↔ familias — oculto en MVP; reactivar en futura implementación
  // { id: 'chat', icon: MessageCircle, label: 'Chat' },
  { id: 'perfil', icon: User, label: 'Perfil' },
] as const;

const PARENT_TABS = [
  { id: 'dashboard', icon: Home, label: 'Inicio' },
  { id: 'agenda', icon: BookOpen, label: 'Agenda' },
  { id: 'calendario', icon: CalendarDays, label: 'Calendario' },
  // TODO: Notificaciones — pantalla modal vía campana; reactivar aquí si se necesita en navbar
  // { id: 'notificaciones', icon: Bell, label: 'Notificaciones' },
  { id: 'perfil', icon: User, label: 'Perfil' },
] as const;

export function BottomNav({ currentScreen, onNavigate, role, unreadMessages: _unreadMessages }: BottomNavProps) {
  const tabs = role === 'auxiliar' ? AUXILIAR_TABS : PARENT_TABS;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-card" style={{ borderTop: '1px solid var(--border)', boxShadow: '0 -8px 32px rgba(26,23,64,0.06)' }}>
      <div className="flex items-end justify-around px-2 pt-2 pb-3">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id as Screen)}
              className="relative flex flex-col items-center gap-1 min-w-0 flex-1 px-1"
            >
              <div className="relative flex items-center justify-center w-11 h-11">
                {isActive && (
                  <motion.div
                    layoutId="navActive"
                    className="absolute inset-0 rounded-2xl"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                )}
                <Icon
                  size={22}
                  className="relative z-10 transition-colors"
                  style={{ color: isActive ? '#ffffff' : 'var(--muted-foreground)' }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>
              <span
                className="text-[10px] leading-tight text-center truncate w-full"
                style={{
                  color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontWeight: isActive ? 800 : 600,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
