import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ClipboardList } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme, datePillStyle, cardShadow } from '@/theme';
import { useAuth } from '@/store/useAuth';
import { useEntries } from '@/queries/useEntries';
import { useDeleteEntry } from '@/queries/useEntries';
import { useUnreadNotificationsCount } from '@/queries/useNotifications';
import { useParentsBySection } from '@/queries/useStudents';
import { useStudentsBySection } from '@/queries/useStudents';
import { TODAY } from '@/constants/config';
import { isEntryVisible, shortSectionLabel } from '@/utils/visibility';
import { hasIncompleteAck } from '@/utils/ack';
import { formatFullDate } from '@/utils/dates';
import type { Entry } from '@/types';
import { Screen } from '@/components/ui/Screen';
import { HomeTopBar } from '@/components/layout/HomeTopBar';
import { SummaryCardDecor } from '@/components/ui/SummaryCardDecor';
import { EntryCard } from '@/components/features/EntryCard';
import { EntryDetailModal } from '@/components/features/EntryDetailModal';

const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

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

export function AuxiliarDashboard() {
  const { theme, styles } = useTheme();
  const router = useRouter();
  const { user, selectedSection, setSelectedSection } = useAuth();
  const { data: entries = [] } = useEntries();
  const unreadNotifications = useUnreadNotificationsCount();
  const deleteEntryMutation = useDeleteEntry();
  const deleteEntry = (id: string) => deleteEntryMutation.mutateAsync(id);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const sections = user?.sections ?? [];
  const activeSection = selectedSection || sections[0] || '';
  const { data: parents = [] } = useParentsBySection(activeSection);
  const { data: students = [] } = useStudentsBySection(activeSection);
  const week = useMemo(() => buildWeek(TODAY), []);
  const context = { selectedSection: activeSection };
  const sectionEntries = entries.filter(e => user && isEntryVisible(e, user, context));
  const todayEntries = sectionEntries.filter(e => e.date === TODAY);
  const selectedEntry = selectedEntryId ? entries.find(e => e.id === selectedEntryId) ?? null : null;
  const comunicadosToday = todayEntries.filter(e => e.type === 'comunicado').length;
  const pendingAck = todayEntries.filter(e => hasIncompleteAck(e, parents, students)).length;
  const important = todayEntries.filter(e => e.isImportant).length;

  const stats = [
    { label: 'Registros', value: todayEntries.length },
    { label: 'Comunicados', value: comunicadosToday },
    { label: 'Sin confirmar', value: pendingAck },
    { label: 'Importantes', value: important },
  ];

  const handleEdit = (entry: Entry) => {
    router.push({ pathname: '/nueva-anotacion', params: { editEntryId: entry.id, mode: 'registro' } });
  };

  if (!user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <HomeTopBar
        unreadNotifications={unreadNotifications}
        sections={sections}
        selectedSection={activeSection}
        onSelectSection={setSelectedSection}
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
          <View style={{ position: 'relative', zIndex: 1, flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground }}>
                {formatFullDate(TODAY, true)}
              </Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 34, color: theme.colors.foreground, letterSpacing: -1, marginTop: 8, lineHeight: 34 }}>
                {shortSectionLabel(activeSection)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 148, flexShrink: 0, borderLeftWidth: 1, borderLeftColor: theme.colors.border, paddingLeft: 16 }}>
              {stats.map((s, i) => (
                <View
                  key={s.label}
                  style={{
                    width: '50%',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRightWidth: i % 2 === 0 ? 1 : 0,
                    borderBottomWidth: i < 2 ? 1 : 0,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 20, color: theme.colors.foreground, lineHeight: 20 }}>
                    {s.value}
                  </Text>
                  <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.mutedForeground, marginTop: 4, textAlign: 'center' }}>
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
            const hasEntries = sectionEntries.some(e => e.date === w.date);
            return (
              <Pressable
                key={w.date}
                onPress={() => router.push({ pathname: '/agenda', params: { date: w.date } })}
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
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isToday ? theme.colors.primary : theme.colors.primary, marginTop: 6 }} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Nueva anotación CTA */}
        <Pressable
          onPress={() => router.push('/nueva-anotacion')}
          style={{ marginBottom: 20, borderRadius: theme.radii.xl, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={theme.colors.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}
          >
            <View>
              <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: '#fff' }}>Nueva anotación</Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                Registrar actividad del día
              </Text>
            </View>
            <View style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={22} color="#fff" strokeWidth={2.5} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Today's entries */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={styles.title}>Registros de hoy</Text>
          <Pressable onPress={() => router.push('/agenda')}>
            <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.primary }}>Ver todos →</Text>
          </Pressable>
        </View>

        {todayEntries.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40, borderRadius: theme.radii.xl, backgroundColor: theme.colors.card, ...cardShadow(theme) }}>
            <View style={{ width: 64, height: 64, borderRadius: 24, backgroundColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <ClipboardList size={28} color={theme.colors.primary} strokeWidth={1.75} />
            </View>
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 16, color: theme.colors.foreground }}>Sin registros aún</Text>
            <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground, marginTop: 4 }}>
              Comenzá registrando la primera actividad.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {todayEntries.slice(0, 3).map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                userId={user.id}
                compact
                showAudienceBadge
                canManage
                onPress={e => setSelectedEntryId(e.id)}
              />
            ))}
            {todayEntries.length > 3 && (
              <Pressable
                onPress={() => router.push('/agenda')}
                style={{
                  paddingVertical: 14,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: theme.colors.primaryDashed,
                  alignItems: 'center',
                  backgroundColor: theme.colors.card,
                }}
              >
                <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 14, color: theme.colors.primary }}>
                  Ver {todayEntries.length - 3} más →
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </Screen>

      <EntryDetailModal
        entry={selectedEntry}
        userId={user.id}
        canManage
        showAudienceBadge
        onClose={() => setSelectedEntryId(null)}
        onEdit={handleEdit}
        onDelete={id => void deleteEntry(id)}
      />
    </View>
  );
}
