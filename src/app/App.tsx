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
import { CambiarContrasena } from './components/CambiarContrasena';
import { VistaEnConstruccion } from './components/VistaEnConstruccion';
import type {
  User, Entry, AppNotification, Screen, Child, Conversation, CalendarEvent, SchoolCalendarEventType,
} from './components/data';
import {
  MOCK_USERS, MOCK_ENTRIES, MOCK_NOTIFICATIONS, MOCK_CALENDAR_EVENTS, MOCK_CONVERSATIONS,
  getCalendarEventColor, TODAY,
} from './components/data';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>('login');
  const [entries, setEntries] = useState<Entry[]>(MOCK_ENTRIES);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);
  const [overlayReturn, setOverlayReturn] = useState<Screen>('dashboard');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [nuevaAnotacionConfig, setNuevaAnotacionConfig] = useState<{
    mode: 'registro' | 'calendario';
    date: string;
    calendarType: SchoolCalendarEventType;
    editingEntryId?: string;
    editingCalendarEventId?: string;
  }>({ mode: 'registro', date: TODAY, calendarType: 'evento' });
  const [enConstruccionTitle, setEnConstruccionTitle] = useState('');

  const handleOpenEnConstruccion = (title: string) => {
    setEnConstruccionTitle(title);
    setOverlayReturn(screen);
    setScreen('en-construccion');
  };

  const handleNavigate = (next: Screen) => {
    if (next === 'nueva-anotacion' && screen !== 'calendario') {
      setNuevaAnotacionConfig({ mode: 'registro', date: TODAY, calendarType: 'evento' });
      if (screen !== next && screen !== 'login') {
        setOverlayReturn(screen);
      }
    }
    if (
      (next === 'notificaciones' || next === 'cambiar-contrasena' || next === 'en-construccion') &&
      screen !== next &&
      screen !== 'login'
    ) {
      setOverlayReturn(screen);
    }
    setScreen(next);
  };

  const handleScheduleEvent = (date: string, type: SchoolCalendarEventType = 'evento') => {
    setNuevaAnotacionConfig({ mode: 'calendario', date, calendarType: type });
    setOverlayReturn('calendario');
    setScreen('nueva-anotacion');
  };

  const handleAddCalendarEvent = (data: Omit<CalendarEvent, 'id' | 'color'>) => {
    const newEvent: CalendarEvent = {
      ...data,
      id: `ce-new-${Date.now()}`,
      color: getCalendarEventColor(data.type),
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setSelectedChild(loggedUser.children?.[0] || null);
    setSelectedSection(loggedUser.sections?.[0] || '');
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedSection('');
    setScreen('login');
  };

  const handleAddEntry = (
    entryData: Omit<Entry, 'id' | 'readBy' | 'author'>,
    options?: { sendNotification?: boolean },
  ) => {
    const newEntry: Entry = {
      ...entryData,
      id: `e-new-${Date.now()}`,
      readBy: [],
      author: user?.name || 'Sra. García',
    };
    setEntries(prev => [newEntry, ...prev]);

    const shouldNotify = options?.sendNotification ?? true;
    if (entryData.type === 'nota_personal' || !shouldNotify) return;

    const typeLabel = entryData.type === 'tarea' ? 'tarea'
      : entryData.type === 'comunicado' ? 'comunicado'
      : entryData.type === 'personalizado' ? 'anotación personalizada'
      : 'anotación';

    const notif: AppNotification = {
      id: `n-new-${Date.now()}`,
      title: `📋 Nueva ${typeLabel}`,
      body: entryData.title,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: entryData.type,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const sendEntryUpdateNotification = (entryData: Omit<Entry, 'id' | 'readBy' | 'author'>) => {
    const typeLabel = entryData.type === 'tarea' ? 'tarea'
      : entryData.type === 'comunicado' ? 'comunicado'
      : entryData.type === 'personalizado' ? 'anotación personalizada'
      : 'anotación';

    const notif: AppNotification = {
      id: `n-upd-${Date.now()}`,
      title: `✏️ ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} actualizada`,
      body: entryData.title,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: entryData.type,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleUpdateEntry = (
    id: string,
    entryData: Omit<Entry, 'id' | 'readBy' | 'author'>,
    options?: { sendNotification?: boolean },
  ) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e;
      return { ...e, ...entryData, id: e.id, readBy: e.readBy, author: e.author };
    }));

    const shouldNotify = options?.sendNotification ?? false;
    if (entryData.type === 'nota_personal' || !shouldNotify) return;
    sendEntryUpdateNotification(entryData);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateCalendarEvent = (id: string, data: Omit<CalendarEvent, 'id' | 'color'>) => {
    setCalendarEvents(prev => prev.map(ev => {
      if (ev.id !== id) return ev;
      return { ...ev, ...data, id: ev.id, color: getCalendarEventColor(data.type) };
    }));
  };

  const handleDeleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(ev => ev.id !== id));
  };

  const handleEditEntry = (entry: Entry) => {
    setNuevaAnotacionConfig({
      mode: 'registro',
      date: entry.date,
      calendarType: 'evento',
      editingEntryId: entry.id,
    });
    setOverlayReturn(screen);
    setScreen('nueva-anotacion');
  };

  const handleEditCalendarEvent = (event: CalendarEvent) => {
    const calType: SchoolCalendarEventType =
      event.type === 'tarea' ? 'evento' : event.type;
    setNuevaAnotacionConfig({
      mode: 'calendario',
      date: event.date,
      calendarType: calType,
      editingCalendarEventId: event.id,
    });
    setOverlayReturn('calendario');
    setScreen('nueva-anotacion');
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

  const editingEntry = nuevaAnotacionConfig.editingEntryId
    ? entries.find(e => e.id === nuevaAnotacionConfig.editingEntryId)
    : undefined;
  const editingCalendarEvent = nuevaAnotacionConfig.editingCalendarEventId
    ? calendarEvents.find(ev => ev.id === nuevaAnotacionConfig.editingCalendarEventId)
    : undefined;

  const renderScreen = () => {
    if (!user) return null;

    const isAuxiliar = user.role === 'auxiliar';

    switch (screen) {
      case 'dashboard':
        return isAuxiliar ? (
          <AuxiliarDashboard
            user={user}
            entries={entries}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            onNavigate={handleNavigate}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            unreadNotifications={unreadNotifications}
            unreadMessages={unreadMessages}
          />
        ) : (
          <ParentDashboard
            user={user}
            entries={entries}
            notifications={notifications}
            selectedChild={selectedChild}
            onNavigate={handleNavigate}
            onConfirmRead={handleConfirmRead}
            onSelectChild={setSelectedChild}
            unreadNotifications={unreadNotifications}
          />
        );

      case 'agenda':
        return (
          <AgendaDiaria
            user={user}
            entries={entries}
            selectedChild={selectedChild}
            onSelectChild={setSelectedChild}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            onNavigate={handleNavigate}
            onConfirmRead={handleConfirmRead}
            onEditEntry={isAuxiliar ? handleEditEntry : undefined}
            onDeleteEntry={isAuxiliar ? handleDeleteEntry : undefined}
            unreadNotifications={unreadNotifications}
          />
        );

      case 'calendario':
        return (
          <Calendario
            events={calendarEvents}
            canManage={isAuxiliar}
            sections={user.sections ?? []}
            selectedSection={selectedSection}
            onSelectSection={isAuxiliar ? setSelectedSection : undefined}
            onScheduleEvent={isAuxiliar ? handleScheduleEvent : undefined}
            onEditEvent={isAuxiliar ? handleEditCalendarEvent : undefined}
            onDeleteEvent={isAuxiliar ? handleDeleteCalendarEvent : undefined}
            onNavigate={handleNavigate}
            unreadNotifications={unreadNotifications}
          />
        );

      case 'notificaciones':
        return (
          <Notificaciones
            notifications={notifications}
            onMarkRead={handleMarkNotifRead}
            onMarkAllRead={handleMarkAllNotifRead}
            onClose={() => setScreen(overlayReturn)}
          />
        );

      case 'nueva-anotacion':
        return isAuxiliar ? (
          <NuevaAnotacion
            selectedSection={selectedSection}
            darkMode={darkMode}
            initialMode={nuevaAnotacionConfig.mode}
            initialDate={nuevaAnotacionConfig.date}
            initialCalendarType={nuevaAnotacionConfig.calendarType}
            editingEntry={editingEntry}
            editingCalendarEvent={editingCalendarEvent}
            onSubmit={handleAddEntry}
            onUpdate={handleUpdateEntry}
            onSubmitCalendarEvent={handleAddCalendarEvent}
            onUpdateCalendarEvent={handleUpdateCalendarEvent}
            onNavigate={handleNavigate}
            onClose={() => setScreen(overlayReturn)}
          />
        ) : null;

      case 'chat':
      case 'chat-thread':
        return (
          <ChatScreen
            user={user}
            conversations={conversations}
            onNavigate={handleNavigate}
            onSendMessage={handleSendMessage}
          />
        );

      case 'cambiar-contrasena':
        return (
          <CambiarContrasena onClose={() => setScreen(overlayReturn)} />
        );

      case 'en-construccion':
        return (
          <VistaEnConstruccion
            title={enConstruccionTitle}
            darkMode={darkMode}
            onClose={() => setScreen(overlayReturn)}
          />
        );

      case 'perfil':
        return (
          <Perfil
            user={user}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onOpenEnConstruccion={handleOpenEnConstruccion}
            unreadNotifications={unreadNotifications}
          />
        );

      default:
        return null;
    }
  };

  const showBottomNav = user && screen !== 'login' && screen !== 'nueva-anotacion' && screen !== 'notificaciones' && screen !== 'cambiar-contrasena' && screen !== 'en-construccion';
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;

  return (
    <div
      className={`size-full flex items-center justify-center ${darkMode ? 'dark' : ''}`}
      style={{ fontFamily: 'Nunito, sans-serif', backgroundColor: darkMode ? '#0A0918' : '#D8D4F0' }}
    >
      <div className="hidden md:block absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(13,148,136,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(16,205,160,0.08) 0%, transparent 50%)' }} />

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

        {showBottomNav && (
          <BottomNav
            currentScreen={screen}
            onNavigate={handleNavigate}
            role={user.role}
            unreadMessages={unreadMessages}
          />
        )}
      </div>
    </div>
  );
}
