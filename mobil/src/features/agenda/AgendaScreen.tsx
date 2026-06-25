import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Modal, type LayoutChangeEvent } from 'react-native';
import {
  ChevronLeft, ChevronRight, Plus, SlidersHorizontal, ChevronDown,
  BookOpen, Megaphone, Package, Eye, Bell, FileText, Star, User,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, filterPillStyle, datePillStyle } from '@/theme';
import { useAuth } from '@/store/useAuth';
import { useEntries, useConfirmEntryRead, useDeleteEntry } from '@/queries/useEntries';
import { useUnreadNotificationsCount } from '@/queries/useNotifications';
import { TODAY } from '@/constants/config';
import { IllustrationSvg } from '@/components/ui/IllustrationSvg';
import { entryTypeConfig } from '@/constants/entryTypes';
import { isEntryVisible, shortSectionLabel } from '@/utils/visibility';
import { countPendingAck } from '@/utils/ack';
import { formatFullDate, addDays, parseDate, getDateStr, MONTHS_ES, MONTHS_SHORT, DAYS_SHORT } from '@/utils/dates';
import type { Entry, EntryType } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { EntryCard } from '@/components/features/EntryCard';
import { EntryDetailModal } from '@/components/features/EntryDetailModal';
import { buildChildDropdownItems } from '@/utils/childPicker';
import { PendingAckGuideModal } from '@/components/features/PendingAckGuideModal';
import { PendingAckBanner } from '@/components/features/PendingAckBanner';

const TODAY_DATE = new Date(`${TODAY}T12:00:00`);
const TODAY_YEAR = TODAY_DATE.getFullYear();
const TODAY_MONTH = TODAY_DATE.getMonth();
const YEAR_START = `${TODAY_YEAR}-01-01`;

const ALL_TYPES: EntryType[] = [
  'tarea', 'comunicado', 'material', 'observacion', 'recordatorio', 'examen', 'evento', 'nota_personal', 'personalizado',
];

const ENTRY_ICONS: Record<EntryType, LucideIcon> = {
  tarea: BookOpen,
  comunicado: Megaphone,
  material: Package,
  observacion: Eye,
  recordatorio: Bell,
  examen: FileText,
  evento: Star,
  nota_personal: User,
  personalizado: User,
};

function clampDate(dateStr: string): string {
  if (dateStr < YEAR_START) return YEAR_START;
  if (dateStr > TODAY) return TODAY;
  return dateStr;
}

function getMonthDays(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lastDay = month === TODAY_MONTH ? TODAY_DATE.getDate() : daysInMonth;
  return Array.from({ length: lastDay }, (_, i) => {
    const day = i + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
}

function setMonthOnDate(currentDate: string, month: number): string {
  const daysInMonth = new Date(TODAY_YEAR, month + 1, 0).getDate();
  const maxDay = month === TODAY_MONTH ? TODAY_DATE.getDate() : daysInMonth;
  const currentDay = parseDate(currentDate).getDate();
  const nextDay = Math.min(currentDay, maxDay);
  return getDateStr(TODAY_YEAR, month, nextDay);
}

export function AgendaScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const { user, selectedSection, setSelectedSection, selectedChild, setSelectedChild } = useAuth();
  const { data: entries = [] } = useEntries();
  const unreadNotifications = useUnreadNotificationsCount();
  const confirmEntryReadMutation = useConfirmEntryRead();
  const confirmEntryRead = (entryId: string) => confirmEntryReadMutation.mutateAsync(entryId);
  const deleteEntryMutation = useDeleteEntry();
  const deleteEntry = (id: string) => deleteEntryMutation.mutateAsync(id);

  const initialDate = clampDate(typeof params.date === 'string' ? params.date : TODAY);
  const initialParsed = parseDate(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewYear, setViewYear] = useState(initialParsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialParsed.getMonth());
  const [filterType, setFilterType] = useState<EntryType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showAckGuide, setShowAckGuide] = useState(false);
  const dayScrollRef = useRef<ScrollView>(null);
  const dayLayoutsRef = useRef<Map<string, { x: number; width: number }>>(new Map());
  const [dayScrollWidth, setDayScrollWidth] = useState(0);
  const hasScrolledInitially = useRef(false);

  const monthDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const availableMonths = useMemo(
    () => Array.from({ length: TODAY_MONTH + 1 }, (_, i) => i),
    [],
  );

  const isAuxiliar = user?.role === 'auxiliar';
  const isPadre = user?.role === 'padre';
  const isToday = selectedDate === TODAY;
  const isMinDate = selectedDate <= YEAR_START;
  const showAudienceBadge = isAuxiliar || isPadre;

  const visibilityContext = isAuxiliar
    ? { selectedSection }
    : { selectedChildId: selectedChild?.id ?? user?.children?.[0]?.id };

  const visibleEntries = entries.filter(e => user && isEntryVisible(e, user, visibilityContext));
  const dayEntriesAll = visibleEntries.filter(e => e.date === selectedDate);
  const dayEntries = dayEntriesAll
    .filter(e => !filterType || e.type === filterType)
    .sort((a, b) => a.time.localeCompare(b.time));

  const selectedEntry = selectedEntryId ? entries.find(e => e.id === selectedEntryId) ?? null : null;
  const pendingAckCount = isPadre && user ? countPendingAck(visibleEntries, user.id) : 0;

  const typeCounts = dayEntriesAll.reduce<Partial<Record<EntryType, number>>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  const sectionItems = (user?.sections ?? []).map(s => ({ id: s, label: shortSectionLabel(s) }));
  const childItems = buildChildDropdownItems(user?.children ?? []);

  const syncViewMonth = (dateStr: string) => {
    const d = parseDate(dateStr);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const scrollToSelectedDay = useCallback(
    (animated = true) => {
      const layout = dayLayoutsRef.current.get(selectedDate);
      if (!layout || !dayScrollRef.current || dayScrollWidth <= 0) {
        return;
      }
      const offset = Math.max(0, layout.x - dayScrollWidth / 2 + layout.width / 2);
      dayScrollRef.current.scrollTo({ x: offset, animated });
    },
    [selectedDate, dayScrollWidth],
  );

  useEffect(() => {
    dayLayoutsRef.current.clear();
  }, [viewYear, viewMonth]);

  useEffect(() => {
    const animated = hasScrolledInitially.current;
    hasScrolledInitially.current = true;
    const frame = requestAnimationFrame(() => scrollToSelectedDay(animated));
    return () => cancelAnimationFrame(frame);
  }, [selectedDate, monthDays, dayScrollWidth, scrollToSelectedDay]);

  const handleDayLayout = (dateStr: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    dayLayoutsRef.current.set(dateStr, { x, width });
    if (dateStr === selectedDate) {
      requestAnimationFrame(() => scrollToSelectedDay(false));
    }
  };

  const goPrev = () => {
    const next = clampDate(addDays(selectedDate, -1));
    setSelectedDate(next);
    syncViewMonth(next);
  };

  const goNext = () => {
    const next = clampDate(addDays(selectedDate, 1));
    setSelectedDate(next);
    syncViewMonth(next);
  };

  const selectMonth = (month: number) => {
    setViewMonth(month);
    setViewYear(TODAY_YEAR);
    const next = clampDate(setMonthOnDate(selectedDate, month));
    setSelectedDate(next);
    setShowMonthPicker(false);
  };

  const handleEdit = (entry: Entry) => {
    router.push({ pathname: '/nueva-anotacion', params: { editEntryId: entry.id, mode: 'registro' } });
  };

  if (!user) return null;

  const showHeaderCta = isAuxiliar && isToday && dayEntries.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          backgroundColor: theme.colors.card,
          paddingBottom: showHeaderCta ? 16 : 12,
          borderBottomLeftRadius: showFilters ? 0 : theme.radii.xl,
          borderBottomRightRadius: showFilters ? 0 : theme.radii.xl,
        }}
      >
        <TopBar
          embedded
          title="Agenda"
          unreadNotifications={unreadNotifications}
          dropdownItems={isAuxiliar && sectionItems.length > 1 ? sectionItems : !isAuxiliar && childItems.length > 1 ? childItems : undefined}
          selectedDropdownId={isAuxiliar ? selectedSection : (selectedChild?.id ?? '')}
          onDropdownSelect={id => {
            if (isAuxiliar) setSelectedSection(id);
            else {
              const child = user.children?.find(c => c.id === id);
              if (child) setSelectedChild(child);
            }
          }}
        />

        <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Pressable
              onPress={goPrev}
              disabled={isMinDate}
              style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center', opacity: isMinDate ? 0.35 : 1 }}
            >
              <ChevronLeft size={18} color={theme.colors.mutedForeground} />
            </Pressable>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 15, color: theme.colors.foreground, textAlign: 'center' }}>
                {formatFullDate(selectedDate, isToday)}
              </Text>
              {isAuxiliar && !isToday && (
                <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 4 }}>
                  Solo lectura
                </Text>
              )}
            </View>
            <Pressable
              onPress={goNext}
              disabled={selectedDate >= TODAY}
              style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center', opacity: selectedDate >= TODAY ? 0.35 : 1 }}
            >
              <ChevronRight size={18} color={theme.colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 16, gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Pressable
                onPress={() => setShowMonthPicker(true)}
                style={[
                  { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, minWidth: 52 },
                  datePillStyle(theme, showMonthPicker),
                ]}
              >
                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: showMonthPicker ? theme.colors.primaryMutedText : theme.colors.mutedForeground }}>
                  Mes
                </Text>
                <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 13, color: showMonthPicker ? theme.colors.primary : theme.colors.foreground, marginTop: 2 }}>
                  {MONTHS_SHORT[viewMonth]}
                </Text>
                <ChevronDown
                  size={12}
                  color={showMonthPicker ? theme.colors.primary : theme.colors.mutedForeground}
                  style={{ marginTop: 2, transform: [{ rotate: showMonthPicker ? '180deg' : '0deg' }] }}
                />
              </Pressable>

              <ScrollView
                ref={dayScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: 6, paddingRight: 4 }}
                onLayout={event => setDayScrollWidth(event.nativeEvent.layout.width)}
              >
                {monthDays.map(dateStr => {
                  const d = parseDate(dateStr);
                  const selected = dateStr === selectedDate;
                  const count = visibleEntries.filter(e => e.date === dateStr).length;
                  return (
                    <Pressable
                      key={dateStr}
                      onLayout={event => handleDayLayout(dateStr, event)}
                      onPress={() => {
                        setSelectedDate(dateStr);
                        syncViewMonth(dateStr);
                      }}
                      style={[
                        { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, minWidth: 48 },
                        datePillStyle(theme, selected),
                      ]}
                    >
                      <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: selected ? theme.colors.primaryMutedText : theme.colors.mutedForeground }}>
                        {DAYS_SHORT[d.getDay()]}
                      </Text>
                      <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 16, color: selected ? theme.colors.primary : theme.colors.foreground }}>
                        {d.getDate()}
                      </Text>
                      {count > 0 && (
                        <View
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: selected ? theme.colors.primary : theme.colors.mutedForeground,
                            marginTop: 4,
                          }}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable
                onPress={() => setShowFilters(f => !f)}
                style={[
                  { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
                  filterPillStyle(theme, showFilters || filterType !== null),
                ]}
              >
                <SlidersHorizontal size={16} color={showFilters || filterType !== null ? theme.colors.primary : theme.colors.mutedForeground} strokeWidth={2.5} />
              </Pressable>
            </View>

            {showHeaderCta && (
              <Pressable onPress={() => router.push('/nueva-anotacion')} style={{ borderRadius: 16, overflow: 'hidden' }}>
                <LinearGradient
                  colors={theme.colors.ctaGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 }}
                >
                  <Plus size={16} color="#fff" strokeWidth={2.5} />
                  <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: '#fff' }}>
                    Nueva anotación
                  </Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {showFilters && (
        <View style={{ backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 12 }}>
            <Pressable
              onPress={() => setFilterType(null)}
              style={[{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }, filterPillStyle(theme, filterType === null)]}
            >
              <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: filterType === null ? theme.colors.primary : theme.colors.foreground }}>
                Todos ({dayEntriesAll.length})
              </Text>
            </Pressable>
            {ALL_TYPES.map(type => {
              const count = typeCounts[type] ?? 0;
              if (!count) return null;
              const active = filterType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setFilterType(active ? null : type)}
                  style={[{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }, filterPillStyle(theme, active)]}
                >
                  <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: active ? theme.colors.primary : theme.colors.foreground }}>
                    {entryTypeConfig[type].label} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {isPadre && (
          <PendingAckBanner
            count={pendingAckCount}
            onPress={pendingAckCount > 0 ? () => setShowAckGuide(true) : undefined}
          />
        )}

        {dayEntries.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <IllustrationSvg name="emptyAgenda" height={200} />
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 17, color: theme.colors.foreground }}>
              Sin registros
            </Text>
            <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground, marginTop: 4, textAlign: 'center' }}>
              {isAuxiliar && isToday ? 'Empezá registrando la primera actividad.' : 'No hay actividades para este día.'}
            </Text>
            {isAuxiliar && isToday && (
              <Pressable onPress={() => router.push('/nueva-anotacion')} style={{ marginTop: 20, borderRadius: 16, overflow: 'hidden' }}>
                <LinearGradient
                  colors={theme.colors.ctaGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14 }}
                >
                  <Plus size={16} color="#fff" strokeWidth={2.5} />
                  <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: '#fff' }}>
                    Nueva anotación
                  </Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={{ position: 'relative' }}>
            <View
              style={{
                position: 'absolute',
                left: 19,
                top: 16,
                bottom: 16,
                width: 1,
                backgroundColor: theme.colors.border,
              }}
            />
            <View style={{ gap: 16 }}>
              {dayEntries.map(entry => {
                const Icon = ENTRY_ICONS[entry.type];
                return (
                  <View key={entry.id} style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ alignItems: 'center', width: 40, zIndex: 1 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 16,
                          backgroundColor: theme.colors.muted,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={16} color={theme.colors.primary} strokeWidth={2.5} />
                      </View>
                      <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 10, color: theme.colors.mutedForeground, marginTop: 4 }}>
                        {entry.time}
                      </Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
                      <EntryCard
                        entry={entry}
                        userId={user.id}
                        showAudienceBadge={showAudienceBadge}
                        isReadOnly={isPadre}
                        canManage={isAuxiliar}
                        onPress={entry => setSelectedEntryId(entry.id)}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <EntryDetailModal
        entry={selectedEntry}
        userId={user.id}
        canManage={isAuxiliar}
        isReadOnly={isPadre}
        showAudienceBadge={showAudienceBadge}
        onClose={() => setSelectedEntryId(null)}
        onEdit={handleEdit}
        onDelete={id => void deleteEntry(id)}
        onConfirmRead={id => confirmEntryRead(id)}
      />

      {isPadre && user && (
        <PendingAckGuideModal
          visible={showAckGuide}
          onClose={() => setShowAckGuide(false)}
          entries={visibleEntries}
          userId={user.id}
          onConfirmRead={confirmEntryRead}
        />
      )}

      <Modal visible={showMonthPicker} transparent animationType="fade" onRequestClose={() => setShowMonthPicker(false)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setShowMonthPicker(false)} />
          <View
            style={{
              marginHorizontal: 32,
              backgroundColor: theme.colors.card,
              borderRadius: theme.radii.xl,
              padding: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 16, color: theme.colors.foreground, paddingHorizontal: 12, paddingVertical: 10 }}>
              Seleccionar mes
            </Text>
            {availableMonths.map(month => {
              const active = month === viewMonth;
              return (
                <Pressable
                  key={month}
                  onPress={() => selectMonth(month)}
                  style={[{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: theme.radii.md, marginBottom: 4 }, active ? filterPillStyle(theme, true) : undefined]}
                >
                  <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 15, color: active ? theme.colors.primary : theme.colors.foreground }}>
                    {MONTHS_ES[month]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
