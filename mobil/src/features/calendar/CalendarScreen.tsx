import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft, ChevronRight, PartyPopper, FileText, Users, Drama, Star, BookOpen,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme, cardShadow } from '@/theme';
import { useAuth } from '@/store/useAuth';
import { useCalendarEvents, useDeleteCalendarEvent } from '@/queries/useCalendarEvents';
import { useUnreadNotificationsCount } from '@/queries/useNotifications';
import { TODAY } from '@/constants/config';
import { calendarEventTypeLabels, getCalendarTypeColors, SCHOOL_CALENDAR_EVENT_TYPES } from '@/constants/calendarTypes';
import { shortSectionLabel } from '@/utils/visibility';
import { buildChildDropdownItems } from '@/utils/childPicker';
import { MONTHS_ES, MONTHS_SHORT, parseDate, formatRelativeDay } from '@/utils/dates';
import type { CalendarEvent, SchoolCalendarEventType } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { CalendarEventDetailModal } from '@/features/calendar/CalendarEventDetailModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const DAYS_HEADER = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const EVENT_ICONS: Record<CalendarEvent['type'], LucideIcon> = {
  festivo: PartyPopper,
  examen: FileText,
  reunion: Users,
  actuacion: Drama,
  evento: Star,
  tarea: BookOpen,
};

const LEGEND_TYPES: SchoolCalendarEventType[] = SCHOOL_CALENDAR_EVENT_TYPES;

export function CalendarScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { user, selectedSection, setSelectedSection, selectedChild, setSelectedChild } = useAuth();
  const { data: calendarEvents = [] } = useCalendarEvents();
  const unreadNotifications = useUnreadNotificationsCount();
  const deleteCalendarEventMutation = useDeleteCalendarEvent();
  const deleteCalendarEvent = (id: string) => deleteCalendarEventMutation.mutateAsync(id);

  const todayParts = TODAY.split('-').map(Number);
  const [year, setYear] = useState(todayParts[0]);
  const [month, setMonth] = useState(todayParts[1] - 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(TODAY);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canManage = user?.role === 'auxiliar';
  const isPadre = user?.role === 'padre';
  const sections = user?.sections ?? [];
  const sectionItems = sections.map(s => ({ id: s, label: shortSectionLabel(s) }));
  const childItems = buildChildDropdownItems(user?.children ?? []);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const getEventsForDay = (day: number) => calendarEvents.filter(e => e.date === getDateStr(day));

  const selectedEvents = selectedDate ? calendarEvents.filter(e => e.date === selectedDate) : [];
  const upcomingEvents = calendarEvents
    .filter(e => e.date >= TODAY)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const getEventColor = (type: CalendarEvent['type']) => {
    if (type === 'tarea') return theme.colors.primary;
    return getCalendarTypeColors(type as SchoolCalendarEventType, isDark).color;
  };

  const getEventStyle = (type: CalendarEvent['type']) => {
    if (type === 'tarea') return { color: theme.colors.primary, bg: theme.colors.primaryMuted };
    return getCalendarTypeColors(type as SchoolCalendarEventType, isDark);
  };

  const handleEdit = (event: CalendarEvent) => {
    setDetailEvent(null);
    router.push({
      pathname: '/nueva-anotacion',
      params: { editEventId: event.id, mode: 'calendario', date: event.date },
    });
  };

  const handleScheduleEvent = () => {
    if (!selectedDate) return;
    router.push({
      pathname: '/nueva-anotacion',
      params: { mode: 'calendario', date: selectedDate },
    });
  };

  const handleDelete = () => {
    if (detailEvent) {
      void deleteCalendarEvent(detailEvent.id);
      setShowDeleteConfirm(false);
      setDetailEvent(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingBottom: 16,
          ...cardShadow(theme),
        }}
      >
        <TopBar
          embedded
          title="Calendario Escolar"
          unreadNotifications={unreadNotifications}
          dropdownItems={
            canManage && sectionItems.length > 1
              ? sectionItems
              : isPadre && childItems.length > 1
                ? childItems
                : undefined
          }
          selectedDropdownId={canManage ? selectedSection : (selectedChild?.id ?? '')}
          onDropdownSelect={id => {
            if (canManage) {
              setSelectedSection(id);
              return;
            }
            const child = user?.children?.find(c => c.id === id);
            if (child) setSelectedChild(child);
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
          <Pressable onPress={prevMonth} style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={18} color={theme.colors.mutedForeground} />
          </Pressable>
          <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 18, color: theme.colors.foreground }}>
            {MONTHS_ES[month]} {year}
          </Text>
          <Pressable onPress={nextMonth} style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={18} color={theme.colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {DAYS_HEADER.map(d => (
              <View key={d} style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 11, color: theme.colors.mutedForeground }}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={{ borderRadius: theme.radii.xl, backgroundColor: theme.colors.card, padding: 8, ...cardShadow(theme) }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {Array.from({ length: totalCells }, (_, i) => {
                const day = i - firstDay + 1;
                if (day < 1 || day > daysInMonth) {
                  return <View key={i} style={{ width: `${100 / 7}%`, height: 48 }} />;
                }
                const dateStr = getDateStr(day);
                const dayEvents = getEventsForDay(day);
                const isToday = dateStr === TODAY;
                const isSelected = dateStr === selectedDate;
                const isWeekend = i % 7 === 0 || i % 7 === 6;

                return (
                  <Pressable
                    key={i}
                    onPress={() => setSelectedDate(isSelected ? null : dateStr)}
                    style={{
                      width: `${100 / 7}%`,
                      height: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 16,
                      backgroundColor: isSelected ? theme.colors.primary : isToday ? theme.colors.muted : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: isToday || isSelected ? theme.typography.fontFamilyBlack : theme.typography.fontFamilyBold,
                        fontSize: 14,
                        color: isSelected ? '#fff' : isToday ? theme.colors.primary : isWeekend ? theme.colors.mutedForeground : theme.colors.foreground,
                      }}
                    >
                      {day}
                    </Text>
                    {dayEvents.length > 0 && (
                      <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                        {dayEvents.slice(0, 3).map((ev, ei) => (
                          <View key={ei} style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: getEventColor(ev.type) }} />
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, paddingVertical: 16 }}>
          {LEGEND_TYPES.map(type => {
            const colors = getCalendarTypeColors(type, isDark);
            return (
              <View key={type} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.color }} />
                <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground }}>
                  {calendarEventTypeLabels[type]}
                </Text>
              </View>
            );
          })}
        </View>

        {selectedDate && (() => {
          const d = parseDate(selectedDate);
          const isToday = selectedDate === TODAY;
          return (
            <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
                <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 16, color: theme.colors.foreground, flex: 1 }}>
                  {d.getDate()} de {MONTHS_ES[d.getMonth()]}
                  {isToday && (
                    <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.primary }}>
                      {' '}Hoy
                    </Text>
                  )}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground }}>
                    {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''}
                  </Text>
                  {canManage && (
                    <Pressable onPress={handleScheduleEvent} style={{ borderRadius: 12, overflow: 'hidden' }}>
                      <LinearGradient
                        colors={theme.colors.ctaGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                      >
                        <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 11, color: '#fff' }}>
                          Programar evento
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                </View>
              </View>

              {selectedEvents.length === 0 ? (
                <View
                  style={{
                    paddingVertical: 24,
                    borderRadius: theme.radii.xl,
                    backgroundColor: theme.colors.card,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    ...cardShadow(theme),
                  }}
                >
                  <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground }}>
                    Sin eventos para este día
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {selectedEvents.map(event => {
                    const Icon = EVENT_ICONS[event.type];
                    const colors = getEventStyle(event.type);
                    return (
                      <Pressable
                        key={event.id}
                        onPress={() => setDetailEvent(event)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: 14,
                          borderRadius: theme.radii.xl,
                          backgroundColor: theme.colors.card,
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                          ...cardShadow(theme),
                        }}
                      >
                        <View style={{ alignItems: 'center', gap: 6 }}>
                          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.bg }}>
                            <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: colors.color }}>
                              {event.type === 'tarea' ? 'Tarea' : calendarEventTypeLabels[event.type as SchoolCalendarEventType]}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 16,
                              backgroundColor: colors.bg,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon size={20} color={colors.color} />
                          </View>
                        </View>
                        <View style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                          <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground }}>
                            {event.title}
                          </Text>
                          {event.description && (
                            <Text numberOfLines={2} style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 4 }}>
                              {event.description}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })()}

        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
          <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 16, color: theme.colors.foreground, marginBottom: 12 }}>
            Próximos eventos
          </Text>
          <View style={{ gap: 10 }}>
            {upcomingEvents.map(event => {
              const Icon = EVENT_ICONS[event.type];
              const colors = getEventStyle(event.type);
              const d = parseDate(event.date);
              return (
                <Pressable
                  key={event.id}
                  onPress={() => setDetailEvent(event)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: theme.radii.xl,
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    ...cardShadow(theme),
                  }}
                >
                  <View style={{ width: 44, alignItems: 'center' }}>
                    <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.mutedForeground }}>
                      {MONTHS_SHORT[d.getMonth()].toUpperCase()}
                    </Text>
                    <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 20, color: theme.colors.foreground, lineHeight: 22 }}>
                      {d.getDate()}
                    </Text>
                  </View>
                  <View style={{ width: 1, height: 40, backgroundColor: theme.colors.border }} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground }}>
                      {event.title}
                    </Text>
                    <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: colors.color, marginTop: 2 }}>
                      {formatRelativeDay(event.date, TODAY)}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 16,
                      backgroundColor: colors.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color={colors.color} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <CalendarEventDetailModal
        event={detailEvent}
        canManage={canManage}
        isDark={isDark}
        onClose={() => setDetailEvent(null)}
        onEdit={handleEdit}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Eliminar evento"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}
