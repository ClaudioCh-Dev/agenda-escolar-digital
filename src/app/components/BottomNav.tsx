import { motion } from 'motion/react';
import { Home, CalendarDays, Bell, MessageCircle, User, BookOpen } from 'lucide-react';
import type { Screen, Role } from './data';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  role: Role;
  unreadNotifications: number;
  unreadMessages: number;
}

const AUXILIAR_TABS = [
  { id: 'dashboard', icon: Home },
  { id: 'agenda', icon: BookOpen },
  { id: 'notificaciones', icon: Bell },
  { id: 'chat', icon: MessageCircle },
  { id: 'perfil', icon: User },
] as const;

const PARENT_TABS = [
  { id: 'dashboard', icon: Home },
  { id: 'agenda', icon: BookOpen },
  { id: 'calendario', icon: CalendarDays },
  { id: 'notificaciones', icon: Bell },
  { id: 'perfil', icon: User },
] as const;

export function BottomNav({ currentScreen, onNavigate, role, unreadNotifications, unreadMessages }: BottomNavProps) {
  const tabs = role === 'auxiliar' ? AUXILIAR_TABS : PARENT_TABS;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-card" style={{ borderTop: '1px solid var(--border)', boxShadow: '0 -8px 32px rgba(26,23,64,0.06)' }}>
      <div className="flex items-center justify-around px-4 py-3">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id || (currentScreen === 'chat-thread' && tab.id === 'chat');
          const hasNotif = tab.id === 'notificaciones' && unreadNotifications > 0;
          const hasMsg = tab.id === 'chat' && unreadMessages > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id as Screen)}
              className="relative flex items-center justify-center p-3"
            >
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
              {(hasNotif || hasMsg) && (
                <span
                  className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center z-20 border-2 border-card"
                  style={{ backgroundColor: 'var(--destructive)', fontSize: 7, fontWeight: 800, color: 'white' }}
                >
                  {hasNotif ? (unreadNotifications > 9 ? '9+' : unreadNotifications) : (unreadMessages > 9 ? '9+' : unreadMessages)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
