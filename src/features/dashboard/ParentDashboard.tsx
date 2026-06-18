import { useMemo, useState } from 'react';
import { View, Text, Pressable, Image, type ImageSourcePropType } from 'react-native';
import { Bell, ChevronRight, CheckCircle2, CalendarDays } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme, datePillStyle, cardShadow } from '@/theme';
import { useAuth } from '@/store/useAuth';
import { useEntries } from '@/queries/useEntries';
import { useConfirmEntryRead } from '@/queries/useEntries';
import { useUnreadNotificationsCount } from '@/queries/useNotifications';
import { TODAY } from '@/constants/config';
import { isEntryVisible } from '@/utils/visibility';
import { countPendingAck } from '@/utils/ack';
import { formatFullDate } from '@/utils/dates';
import type { Entry } from '@/types';
import { Screen } from '@/components/ui/Screen';
import { HomeTopBar } from '@/components/layout/HomeTopBar';
import { SummaryCardDecor } from '@/components/ui/SummaryCardDecor';
import { EntryCard } from '@/components/features/EntryCard';
import { EntryDetailModal } from '@/components/features/EntryDetailModal';
import { PendingAckBanner } from '@/components/features/PendingAckBanner';
import { PendingAckGuideModal } from '@/components/features/PendingAckGuideModal';

const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

import { getChildAvatarImage } from '@/constants/childAvatars';

const USER_AVATARS: Record<string, ImageSourcePropType> = {
  'stu-001': require('../../../assets/mock-avatars/lucas.jpg'),
};

function buildWeek(today: string) {
  const d = new Date(`${today}T12:00:00`);
  const dayOfWeek = d.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    return { label: WEEK_LABELS[i], date: dateStr, day: date.getDate() };
  });
}

export function ParentDashboard() {
  const { theme, styles } = useTheme();
  const router = useRouter();
  const { user, selectedChild, setSelectedChild } = useAuth();
  const { data: entries = [] } = useEntries();
  const unreadNotifications = useUnreadNotificationsCount();
  const confirmEntryReadMutation = useConfirmEntryRead();
  const confirmEntryRead = (entryId: string) => confirmEntryReadMutation.mutateAsync(entryId);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showAckGuide, setShowAckGuide] = useState(false);

  const isAlumno = user?.role === 'alumno';
  const isPadre = user?.role === 'padre';
  const child = isPadre ? (selectedChild ?? user?.children?.[0] ?? null) : null;
  const week = useMemo(() => buildWeek(TODAY), []);
  const visibilityContext = isPadre ? { selectedChildId: child?.id } : undefined;
  const visibleEntries = entries.filter(e => user && isEntryVisible(e, user, visibilityContext));
  const todayEntries = visibleEntries.filter(e => e.date === TODAY);
  const pendingTasks = visibleEntries.filter(e => e.type === 'tarea' && e.date >= TODAY).length;
  const pendingAckCount = isPadre && user
    ? countPendingAck(visibleEntries, user.id)
    : 0;

  const stats = [
    { label: 'Tareas pendientes', value: pendingTasks },
    { label: 'Sin confirmar', value: pendingAckCount },
    { label: 'Notificaciones', value: unreadNotifications },
  ];
  const previewEntries = todayEntries.slice(0, 3);
  const upcomingExam = visibleEntries.find(e => e.type === 'examen' && e.date > TODAY);
  const selectedEntry = selectedEntryId ? entries.find(e => e.id === selectedEntryId) ?? null : null;

  if (!user) return null;

  const childAvatar = child ? getChildAvatarImage(child.id) : undefined;
  const userAvatar = USER_AVATARS[user.id];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <HomeTopBar
        unreadNotifications={unreadNotifications}
        childList={isPadre ? user.children : undefined}
        selectedChild={child ?? undefined}
        onSelectChild={isPadre ? setSelectedChild : undefined}
      />

      <Screen scroll padded>
        {/* Summary card */}
        <View
          style={{
            borderRadius: theme.radii.xl,
            backgroundColor: theme.colors.summaryBg,
            borderWidth: 1,
            borderColor: theme.colors.summaryBorder,
            marginBottom: 16,
            overflow: 'hidden',
            ...cardShadow(theme),
          }}
        >
          <SummaryCardDecor />
          <View style={{ position: 'relative', zIndex: 1 }}>
            <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
              {isAlumno ? (
                <>
                  <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground }}>
                    {formatFullDate(TODAY, true)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
                    {userAvatar ? (
                      <Image
                        source={userAvatar}
                        style={{ width: 64, height: 64, borderRadius: 16, borderWidth: 2, borderColor: theme.colors.border }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          backgroundColor: theme.colors.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: theme.colors.border,
                        }}
                      >
                        <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 18, color: '#fff' }}>
                          {user.initials}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1, minWidth: 0, paddingHorizontal: 4 }}>
                      <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 34, color: theme.colors.foreground, letterSpacing: -1, lineHeight: 36 }}>
                        {user.name.split(' ')[0]}
                      </Text>
                      {user.section && (
                        <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 6 }}>
                          {user.section}
                        </Text>
                      )}
                    </View>
                  </View>
                </>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                  <View style={{ flex: 1, maxWidth: '72%', minWidth: 0 }}>
                    <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground }}>
                      {formatFullDate(TODAY, true)}
                    </Text>
                    <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 34, color: theme.colors.foreground, letterSpacing: -1, marginTop: 12, marginLeft: 4 }}>
                      {child ? child.name.split(' ')[0] : user.name.split(' ')[0]}
                    </Text>
                    {child && (
                      <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 6, marginLeft: 4 }}>
                        {child.section} · {child.grade}
                      </Text>
                    )}
                  </View>
                  {child && (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingLeft: 12 }}>
                      {childAvatar ? (
                        <Image
                          source={childAvatar}
                          style={{ width: 64, height: 64, borderRadius: 16, borderWidth: 2, borderColor: theme.colors.border }}
                        />
                      ) : (
                        <View
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 16,
                            backgroundColor: child.color,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: theme.colors.border,
                          }}
                        >
                          <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 18, color: '#fff' }}>
                            {child.initials}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row' }}>
              {stats.map((s, i) => (
                <View
                  key={s.label}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderRightWidth: i < stats.length - 1 ? 1 : 0,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 22, color: theme.colors.foreground }}>{s.value}</Text>
                  <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.mutedForeground, marginTop: 6, textAlign: 'center', paddingHorizontal: 4 }}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Week pills */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
          {week.map(w => {
            const isToday = w.date === TODAY;
            const hasEntries = visibleEntries.some(e => e.date === w.date);
            return (
              <View
                key={w.date}
                style={[
                  { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 16 },
                  datePillStyle(theme, isToday),
                ]}
              >
                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: isToday ? theme.colors.primaryMutedText : theme.colors.mutedForeground, marginBottom: 4 }}>
                  {w.label}
                </Text>
                <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 15, color: isToday ? theme.colors.primary : theme.colors.foreground }}>
                  {w.day}
                </Text>
                {hasEntries && (
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary, marginTop: 6 }} />
                )}
              </View>
            );
          })}
        </View>

        {isPadre && (
          <PendingAckBanner
            count={pendingAckCount}
            onPress={pendingAckCount > 0 ? () => setShowAckGuide(true) : undefined}
          />
        )}

        {upcomingExam && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 16,
              borderRadius: theme.radii.xl,
              backgroundColor: '#FFF8DC',
              borderWidth: 1,
              borderColor: 'rgba(255,203,61,0.3)',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 22 }}>📝</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: '#92610A' }}>Examen próximo</Text>
              <Text numberOfLines={1} style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: '#B07820' }}>{upcomingExam.title}</Text>
            </View>
            <Pressable onPress={() => router.push('/agenda')}>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 12, color: '#92610A' }}>Ver →</Text>
            </Pressable>
          </View>
        )}

        {/* Today's entries */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={styles.title}>Agenda de hoy</Text>
          <Pressable onPress={() => router.push('/agenda')}>
            <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.primary }}>Ver todo →</Text>
          </Pressable>
        </View>

        {todayEntries.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40, borderRadius: theme.radii.xl, backgroundColor: theme.colors.card, marginBottom: 20, ...cardShadow(theme) }}>
            <CheckCircle2 size={36} color="#10CDA0" strokeWidth={2.5} style={{ marginBottom: 8 }} />
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 16, color: theme.colors.foreground }}>Sin actividades hoy</Text>
            <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground, marginTop: 4, textAlign: 'center', paddingHorizontal: 24 }}>
              La auxiliar no ha registrado nada aún.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12, marginBottom: 20 }}>
            {previewEntries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                userId={user.id}
                isReadOnly={isPadre}
                compact
                showAudienceBadge
                onPress={entry => setSelectedEntryId(entry.id)}
              />
            ))}
            {todayEntries.length > 3 && (
              <Pressable
                onPress={() => router.push('/agenda')}
                style={{
                  paddingVertical: 14,
                  borderRadius: theme.radii.lg,
                  backgroundColor: theme.colors.card,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: theme.colors.primaryDashed,
                  alignItems: 'center',
                  ...cardShadow(theme),
                }}
              >
                <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.primary }}>
                  Ver {todayEntries.length - 3} más →
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Quick links */}
        <Text style={{ ...styles.title, marginBottom: 12 }}>Acceso rápido</Text>
        <View style={{ gap: 10, marginBottom: 20 }}>
          <Pressable
            onPress={() => router.push('/calendario')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 16,
              borderRadius: theme.radii.xl,
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
              ...cardShadow(theme),
            }}
          >
            <CalendarDays size={28} color={theme.colors.primary} strokeWidth={2} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground }}>Calendario escolar</Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
                Fechas importantes y eventos
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.mutedForeground} strokeWidth={2.5} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/notificaciones')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 16,
              borderRadius: theme.radii.xl,
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
              ...cardShadow(theme),
            }}
          >
            <Bell size={28} color={theme.colors.primary} strokeWidth={2} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.foreground }}>Notificaciones</Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
                {unreadNotifications} sin leer
              </Text>
            </View>
            <ChevronRight size={18} color={theme.colors.mutedForeground} strokeWidth={2.5} />
          </Pressable>
        </View>
      </Screen>

      <EntryDetailModal
        entry={selectedEntry}
        userId={user.id}
        isReadOnly={isPadre}
        showAudienceBadge
        onClose={() => setSelectedEntryId(null)}
        onConfirmRead={isPadre ? id => confirmEntryRead(id) : undefined}
      />

      {isPadre && (
        <PendingAckGuideModal
          visible={showAckGuide}
          onClose={() => setShowAckGuide(false)}
          entries={visibleEntries}
          userId={user.id}
          onConfirmRead={confirmEntryRead}
        />
      )}
    </View>
  );
}
