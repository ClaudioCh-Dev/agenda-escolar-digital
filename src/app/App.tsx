import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginScreen } from './components/LoginScreen';
import { BottomNav } from './components/BottomNav';
import { AuxiliarDashboard } from './components/AuxiliarDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { AgendaDiaria } from './components/AgendaDiaria';
import { Calendario } from './components/Calendario';
import { Notificaciones } from './components/Notificaciones';
import { NuevaAnotacion } from './components/NuevaAnotacion';
import { ChatScreen } from './components/ChatScreen';
import { Perfil } from './components/Perfil';
import type {
  User, Entry, AppNotification, Screen, Child, Conversation,
} from './components/data';
import {
  MOCK_USERS, MOCK_ENTRIES, MOCK_NOTIFICATIONS, MOCK_CALENDAR_EVENTS, MOCK_CONVERSATIONS,
} from './components/data';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>('login');
  const [entries, setEntries] = useState<Entry[]>(MOCK_ENTRIES);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setSelectedChild(loggedUser.children?.[0] || null);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setScreen('login');
  };

  const handleAddEntry = (entryData: Omit<Entry, 'id' | 'readBy' | 'author' | 'section'>) => {
    const newEntry: Entry = {
      ...entryData,
      id: `e-new-${Date.now()}`,
      readBy: [],
      author: user?.name || 'Sra. García',
      section: user?.section || '3° A – Primaria',
    };
    setEntries(prev => [newEntry, ...prev]);
    // Add notification
    const notif: AppNotification = {
      id: `n-new-${Date.now()}`,
      title: `📋 Nueva ${entryData.type === 'tarea' ? 'tarea' : entryData.type === 'comunicado' ? 'comunicado' : 'anotación'}`,
      body: entryData.title,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: entryData.type,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleConfirmRead = (entryId: string) => {
    if (!user) return;
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, readBy: [...e.readBy, user.id] } : e));
  };

  const handleMarkNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotifRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleSendNotification = (title: string, body: string) => {
    const notif: AppNotification = {
      id: `n-sent-${Date.now()}`,
      title,
      body,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'comunicado',
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleSendMessage = (convId: string, text: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      const msg = {
        id: `msg-${Date.now()}`,
        senderId: user?.id || 'aux-001',
        senderName: user?.name.split(' ')[0] || 'Yo',
        text,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      return { ...c, messages: [...c.messages, msg], lastMessage: text, lastTimestamp: msg.timestamp };
    }));
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const renderScreen = () => {
    if (!user) return null;

    const isAuxiliar = user.role === 'auxiliar';

    switch (screen) {
      case 'dashboard':
        return isAuxiliar ? (
          <AuxiliarDashboard
            user={user}
            entries={entries}
            onNavigate={setScreen}
            onSendNotification={handleSendNotification}
          />
        ) : (
          <ParentDashboard
            user={user}
            entries={entries}
            notifications={notifications}
            selectedChild={selectedChild}
            onNavigate={setScreen}
            onConfirmRead={handleConfirmRead}
            onSelectChild={setSelectedChild}
          />
        );

      case 'agenda':
        return (
          <AgendaDiaria
            user={user}
            entries={entries}
            onNavigate={setScreen}
            onConfirmRead={handleConfirmRead}
          />
        );

      case 'calendario':
        return <Calendario events={MOCK_CALENDAR_EVENTS} />;

      case 'notificaciones':
        return (
          <Notificaciones
            notifications={notifications}
            onMarkRead={handleMarkNotifRead}
            onMarkAllRead={handleMarkAllNotifRead}
          />
        );

      case 'nueva-anotacion':
        return isAuxiliar ? (
          <NuevaAnotacion onSubmit={handleAddEntry} onNavigate={setScreen} />
        ) : null;

      case 'chat':
      case 'chat-thread':
        return (
          <ChatScreen
            user={user}
            conversations={conversations}
            onNavigate={setScreen}
            onSendMessage={handleSendMessage}
          />
        );

      case 'perfil':
        return (
          <Perfil
            user={user}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
            onLogout={handleLogout}
          />
        );

      default:
        return null;
    }
  };

  const showBottomNav = user && screen !== 'login' && screen !== 'nueva-anotacion';
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;

  return (
    <div
      className={`size-full flex items-center justify-center ${darkMode ? 'dark' : ''}`}
      style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: darkMode ? '#0A0918' : '#D8D4F0' }}
    >
      {/* Desktop bg pattern */}
      <div className="hidden md:block absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(108,99,255,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(16,205,160,0.08) 0%, transparent 50%)' }} />

      {/* Phone shell */}
      <div
        className="relative overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 430,
          height: '100%',
          maxHeight: 900,
          borderRadius: isDesktop ? 52 : 0,
          border: isDesktop ? '14px solid #0D0B1E' : 'none',
          backgroundColor: 'var(--background)',
          boxShadow: isDesktop ? '0 32px 80px rgba(13,11,30,0.5), 0 0 0 1px rgba(255,255,255,0.08)' : 'none',
        }}
      >
        {/* Status bar */}
        {isDesktop && (
          <div
            className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-7 z-50"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--foreground)' }}>9:41</span>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: 11 }}>📶</span>
              <span style={{ fontSize: 11 }}>🔋</span>
            </div>
          </div>
        )}

        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <LoginScreen onLogin={handleLogin} />
              </motion.div>
            ) : (
              <motion.div
                key={screen}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                {renderScreen()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom nav overlay */}
        {showBottomNav && (
          <BottomNav
            currentScreen={screen}
            onNavigate={setScreen}
            role={user.role}
            unreadNotifications={unreadNotifications}
            unreadMessages={unreadMessages}
          />
        )}
      </div>
    </div>
  );
}
