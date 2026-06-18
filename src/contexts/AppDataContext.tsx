import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Entry, CalendarEvent, AppNotification, Conversation, CreateEntryDto, UpdateEntryDto, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types';
import {
  entriesService,
  calendarService,
  notificationsService,
  chatService,
  mockStore,
} from '@/services';
import { useAuth } from './AuthContext';

interface AppDataContextValue {
  entries: Entry[];
  calendarEvents: CalendarEvent[];
  notifications: AppNotification[];
  conversations: Conversation[];
  unreadNotifications: number;
  refreshAll: () => Promise<void>;
  addEntry: (data: CreateEntryDto, options?: { sendNotification?: boolean }) => Promise<void>;
  updateEntry: (id: string, data: UpdateEntryDto, options?: { sendNotification?: boolean }) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  confirmEntryRead: (entryId: string) => Promise<void>;
  addCalendarEvent: (data: CreateCalendarEventDto) => Promise<void>;
  updateCalendarEvent: (id: string, data: UpdateCalendarEventDto) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  markNotifRead: (id: string) => Promise<void>;
  markAllNotifRead: () => Promise<void>;
  sendMessage: (convId: string, text: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const refreshAll = useCallback(async () => {
    const [e, c, n, conv] = await Promise.all([
      entriesService.listEntries(),
      calendarService.listEvents(),
      notificationsService.listNotifications(),
      chatService.listConversations(),
    ]);
    setEntries(e);
    setCalendarEvents(c);
    setNotifications(n);
    setConversations(conv);
  }, []);

  useEffect(() => {
    if (user) refreshAll();
    else {
      setEntries([]);
      setCalendarEvents([]);
      setNotifications([]);
      setConversations([]);
    }
  }, [user, refreshAll]);

  const addEntry = useCallback(async (data: CreateEntryDto, options?: { sendNotification?: boolean }) => {
    if (!user) return;
    await (entriesService as typeof import('@/services/mocks/entries.mock')).createEntry(data, user.name, {
      ...options,
      authorRole: user.role,
    });
    await refreshAll();
  }, [user, refreshAll]);

  const updateEntry = useCallback(async (id: string, data: UpdateEntryDto, options?: { sendNotification?: boolean }) => {
    await (entriesService as typeof import('@/services/mocks/entries.mock')).updateEntry(id, data, options);
    await refreshAll();
  }, [refreshAll]);

  const deleteEntry = useCallback(async (id: string) => {
    await entriesService.deleteEntry(id);
    await refreshAll();
  }, [refreshAll]);

  const confirmEntryRead = useCallback(async (entryId: string) => {
    if (!user) return;
    await (entriesService as typeof import('@/services/mocks/entries.mock')).confirmEntryRead(entryId, user.id);
    await refreshAll();
  }, [user, refreshAll]);

  const addCalendarEvent = useCallback(async (data: CreateCalendarEventDto) => {
    await calendarService.createEvent(data);
    await refreshAll();
  }, [refreshAll]);

  const updateCalendarEvent = useCallback(async (id: string, data: UpdateCalendarEventDto) => {
    await calendarService.updateEvent(id, data);
    await refreshAll();
  }, [refreshAll]);

  const deleteCalendarEvent = useCallback(async (id: string) => {
    await calendarService.deleteEvent(id);
    await refreshAll();
  }, [refreshAll]);

  const markNotifRead = useCallback(async (id: string) => {
    await notificationsService.markAsRead(id);
    await refreshAll();
  }, [refreshAll]);

  const markAllNotifRead = useCallback(async () => {
    await notificationsService.markAllAsRead();
    await refreshAll();
  }, [refreshAll]);

  const sendMessage = useCallback(async (convId: string, text: string) => {
    if (!user) return;
    await (chatService as typeof import('@/services/mocks/chat.mock')).sendMessage(convId, text, { id: user.id, name: user.name });
    await refreshAll();
  }, [user, refreshAll]);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const value = useMemo(() => ({
    entries,
    calendarEvents,
    notifications,
    conversations,
    unreadNotifications,
    refreshAll,
    addEntry,
    updateEntry,
    deleteEntry,
    confirmEntryRead,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    markNotifRead,
    markAllNotifRead,
    sendMessage,
  }), [entries, calendarEvents, notifications, conversations, unreadNotifications, refreshAll, addEntry, updateEntry, deleteEntry, confirmEntryRead, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, markNotifRead, markAllNotifRead, sendMessage]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

export { mockStore };
