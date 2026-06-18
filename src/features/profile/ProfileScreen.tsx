import { useState, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, Image, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LogOut, Bell, Moon, Sun, ChevronRight, Shield, GraduationCap, Settings, HelpCircle, BookOpen, Mail, Clock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme, cardShadow } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Toggle } from '@/components/ui/Toggle';
import { TopBar } from '@/components/layout/TopBar';
import { SoftStairBarsBackground } from '@/components/ui/SoftStairBarsBackground';
import { shortSectionLabel } from '@/utils/visibility';

const ROLE_LABEL = {
  auxiliar: 'Auxiliar / Docente',
  padre: 'Padre de familia',
  alumno: 'Alumno',
};

const AVATARS: Record<string, ImageSourcePropType> = {
  'aux-001': require('../../../assets/mock-avatars/maria-garcia.jpg'),
  'padre-001': require('../../../assets/mock-avatars/carlos-rodriguez.jpg'),
  'padre-002': require('../../../assets/mock-avatars/ana-lopez.jpg'),
  'stu-001': require('../../../assets/mock-avatars/lucas.jpg'),
};

function Section({ label, children }: { label: string; children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontFamily: theme.typography.fontFamilyBold,
          fontSize: 11,
          color: theme.colors.mutedForeground,
          letterSpacing: 0.6,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <View
        style={{
          borderRadius: theme.radii.xl,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
          ...cardShadow(theme),
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  sub,
  chevron = false,
  last = false,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  sub?: string;
  chevron?: boolean;
  last?: boolean;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const content = (
    <>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 12,
          backgroundColor: theme.colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground }}>
          {label}
        </Text>
        {sub && (
          <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
            {sub}
          </Text>
        )}
      </View>
      {chevron && <ChevronRight size={16} color={theme.colors.mutedForeground} />}
    </>
  );

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: last ? 0 : 1,
    borderBottomColor: theme.colors.border,
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={rowStyle}>
        {content}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{content}</View>;
}

function GradientToggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onChange}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        backgroundColor: value ? undefined : theme.colors.muted,
      }}
    >
      {value ? (
        <LinearGradient
          colors={theme.colors.ctaGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 2 }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#fff',
              alignSelf: 'flex-end',
            }}
          />
        </LinearGradient>
      ) : (
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: theme.colors.mutedForeground,
            marginLeft: 2,
          }}
        />
      )}
    </Pressable>
  );
}

function ToggleRow({
  icon,
  label,
  sub,
  value,
  onChange,
  last = false,
}: {
  icon: ReactNode;
  label: string;
  sub?: string;
  value: boolean;
  onChange: () => void;
  last?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 12,
          backgroundColor: theme.colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground }}>
          {label}
        </Text>
        {sub && (
          <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
            {sub}
          </Text>
        )}
      </View>
      <GradientToggle value={value} onChange={onChange} />
    </View>
  );
}

export function ProfileScreen() {
  const { theme, isDark, setDarkMode } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadNotifications } = useAppData();
  const [notifications, setNotifications] = useState({ push: true, email: false, reminders: true });

  if (!user) return null;

  const avatarSource = AVATARS[user.id];
  const gradeStat = user.children
    ? user.children.length
    : user.role === 'alumno'
      ? user.section?.split(' ')[0] ?? '—'
      : 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar title="Perfil" unreadNotifications={unreadNotifications} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}>
        {/* User card */}
        <View
          style={{
            marginBottom: 16,
            padding: 20,
            borderRadius: theme.radii.xl,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            overflow: 'hidden',
            ...cardShadow(theme),
          }}
        >
          <SoftStairBarsBackground topRightAccent bottomLeftAccent />
          <View style={{ position: 'relative', zIndex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, minHeight: 64 }}>
              <View style={{ width: 80, alignItems: 'center' }}>
                {avatarSource ? (
                  <Image
                    source={avatarSource}
                    style={{ width: 64, height: 64, borderRadius: 24 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 24,
                      backgroundColor: theme.colors.foreground,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 22, color: theme.colors.primaryForeground }}>
                      {user.initials}
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 20, color: theme.colors.foreground, letterSpacing: -0.5, textAlign: 'center' }}>
                  {user.name}
                </Text>
                <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground, marginTop: 2, textAlign: 'center' }}>
                  {user.email}
                </Text>
                <View style={{ marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: theme.colors.muted }}>
                  <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: theme.colors.mutedForeground }}>
                    {ROLE_LABEL[user.role]}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 16 }}>
              {[
                { label: 'Secciones', value: user.sections?.length ?? (user.section ? 1 : 0) },
                { label: 'Año', value: '2026' },
                { label: user.children ? 'Hijos' : 'Grado', value: gradeStat },
              ].map((stat, i, arr) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    borderRightWidth: i < arr.length - 1 ? 1 : 0,
                    borderRightColor: theme.colors.border,
                  }}
                >
                  <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 20, color: theme.colors.foreground }}>
                    {stat.value}
                  </Text>
                  <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 4 }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {user.children && user.children.length > 0 && (
          <Section label="Mis hijos">
            {user.children.map((child, i, arr) => (
              <Row
                key={child.id}
                icon={<BookOpen size={16} color={theme.colors.primary} />}
                label={child.name}
                sub={`${child.section} · ${child.grade}`}
                last={i === arr.length - 1}
              />
            ))}
          </Section>
        )}

        {user.sections && user.sections.length > 0 && (
          <Section label="Secciones asignadas">
            {user.sections.map((sec, i, arr) => (
              <Row
                key={sec}
                icon={<GraduationCap size={16} color={theme.colors.primary} />}
                label={shortSectionLabel(sec)}
                sub={sec}
                last={i === arr.length - 1}
              />
            ))}
          </Section>
        )}

        {user.section && !user.sections && (
          <Section label="Sección asignada">
            <Row
              icon={<GraduationCap size={16} color={theme.colors.primary} />}
              label="Sección"
              sub={user.section}
              last
            />
          </Section>
        )}

        <Section label="Notificaciones">
          <ToggleRow
            icon={<Bell size={16} color={theme.colors.primary} />}
            label="Notificaciones push"
            sub="Alertas en tiempo real"
            value={notifications.push}
            onChange={() => setNotifications(p => ({ ...p, push: !p.push }))}
          />
          <ToggleRow
            icon={<Mail size={16} color={theme.colors.primary} />}
            label="Resumen por email"
            sub="Resumen diario"
            value={notifications.email}
            onChange={() => setNotifications(p => ({ ...p, email: !p.email }))}
          />
          <ToggleRow
            icon={<Clock size={16} color={theme.colors.primary} />}
            label="Recordatorios"
            sub="Antes de exámenes y tareas"
            value={notifications.reminders}
            onChange={() => setNotifications(p => ({ ...p, reminders: !p.reminders }))}
            last
          />
        </Section>

        <Section label="Apariencia">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                backgroundColor: theme.colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDark ? <Moon size={16} color={theme.colors.primary} /> : <Sun size={16} color={theme.colors.primary} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground }}>
                Modo oscuro
              </Text>
              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
                {isDark ? 'Activado' : 'Desactivado'}
              </Text>
            </View>
            <Toggle value={isDark} onChange={setDarkMode} />
          </View>
        </Section>

        <Section label="Más">
          <Row
            icon={<Shield size={16} color={theme.colors.primary} />}
            label="Cambiar contraseña"
            chevron
            onPress={() => router.push('/cambiar-contrasena')}
          />
          <Row
            icon={<Settings size={16} color={theme.colors.primary} />}
            label="Configuración general"
            chevron
            onPress={() => router.push({ pathname: '/en-construccion', params: { title: 'Configuración general' } })}
          />
          <Row
            icon={<HelpCircle size={16} color={theme.colors.primary} />}
            label="Centro de ayuda"
            chevron
            last
            onPress={() => router.push({ pathname: '/en-construccion', params: { title: 'Centro de ayuda' } })}
          />
        </Section>

        <Text
          style={{
            textAlign: 'center',
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 12,
            color: theme.colors.primary,
            marginBottom: 16,
          }}
        >
          Agenda Escolar Digital v1.0.0 · Colegio San Martín 2026
        </Text>

        <Pressable
          onPress={() => void logout()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            paddingVertical: 16,
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...cardShadow(theme),
          }}
        >
          <LogOut size={17} color={theme.colors.mutedForeground} />
          <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 15, color: theme.colors.mutedForeground }}>
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
