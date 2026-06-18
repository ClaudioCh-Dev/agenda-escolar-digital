import { View, Text, Pressable, ScrollView } from 'react-native';
import {
  BookOpen, Megaphone, Package, Eye, Bell, FileText, Star, User, Check, CheckCheck, ChevronLeft,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme, cardShadow } from '@/theme';
import { useAppData } from '@/contexts/AppDataContext';
import { TODAY } from '@/constants/config';
import type { EntryType, AppNotification } from '@/types';

const ICONS: Record<EntryType, LucideIcon> = {
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

const TYPE_LABEL: Record<EntryType, string> = {
  tarea: 'Tarea',
  comunicado: 'Comunicado',
  material: 'Material',
  observacion: 'Observación',
  recordatorio: 'Recordatorio',
  examen: 'Examen',
  evento: 'Evento',
  nota_personal: 'Nota personal',
  personalizado: 'Personalizado',
};

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  const now = new Date(`${TODAY}T14:00:00`);
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMins < 60) return `Hace ${Math.max(0, diffMins)} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function stripTitlePrefix(title: string): string {
  return title.replace(/^[^\s]+ /, '');
}

function TodayNotificationItem({
  notification,
  onMarkRead,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  const { theme } = useTheme();
  const Icon = ICONS[notification.type];

  return (
    <Pressable
      onPress={() => !notification.isRead && onMarkRead(notification.id)}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: notification.isRead ? 'transparent' : theme.colors.card,
      }}
    >
      <View style={{ position: 'relative', marginTop: 2 }}>
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
          <Icon size={18} color={theme.colors.primary} strokeWidth={2.5} />
        </View>
        {!notification.isRead && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: theme.colors.primary,
            }}
          />
        )}
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: theme.typography.fontFamilyBold,
            fontSize: 10,
            color: theme.colors.mutedForeground,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            marginBottom: 2,
          }}
        >
          {TYPE_LABEL[notification.type]}
        </Text>
        <Text
          style={{
            fontFamily: notification.isRead ? theme.typography.fontFamilyMedium : theme.typography.fontFamilyBlack,
            fontSize: 14,
            color: theme.colors.foreground,
          }}
        >
          {stripTitlePrefix(notification.title)}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 12,
            color: theme.colors.mutedForeground,
            marginTop: 2,
            lineHeight: 18,
          }}
        >
          {notification.body}
        </Text>
        <Text
          style={{
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 11,
            color: theme.colors.mutedForeground,
            marginTop: 6,
          }}
        >
          {formatTime(notification.timestamp)}
        </Text>
      </View>

      {notification.isRead && (
        <Check size={14} color={theme.colors.mutedForeground} strokeWidth={2} style={{ marginTop: 4 }} />
      )}
    </Pressable>
  );
}

function OlderNotificationItem({ notification }: { notification: AppNotification }) {
  const { theme } = useTheme();
  const Icon = ICONS[notification.type];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 16,
          backgroundColor: theme.colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <Icon size={18} color={theme.colors.primary} strokeWidth={1.8} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 14,
            color: theme.colors.foreground,
          }}
        >
          {stripTitlePrefix(notification.title)}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 12,
            color: theme.colors.mutedForeground,
            marginTop: 2,
          }}
        >
          {notification.body}
        </Text>
        <Text
          style={{
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 11,
            color: theme.colors.mutedForeground,
            marginTop: 4,
          }}
        >
          {formatTime(notification.timestamp)}
        </Text>
      </View>

      <Check size={14} color={theme.colors.mutedForeground} strokeWidth={2} style={{ marginTop: 4 }} />
    </View>
  );
}

export function NotificationsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { notifications, markNotifRead, markAllNotifRead } = useAppData();

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const todayNotifs = notifications.filter(n => n.timestamp.startsWith(TODAY));
  const olderNotifs = notifications.filter(n => !n.timestamp.startsWith(TODAY));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: 20,
          paddingBottom: 16,
          ...cardShadow(theme),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 16,
                backgroundColor: theme.colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={20} color={theme.colors.mutedForeground} />
            </Pressable>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontFamily: theme.typography.fontFamilyBlack,
                  fontSize: 20,
                  color: theme.colors.foreground,
                  letterSpacing: -0.5,
                }}
              >
                Notificaciones
              </Text>
              {unreadCount > 0 && (
                <Text
                  style={{
                    fontFamily: theme.typography.fontFamilyMedium,
                    fontSize: 14,
                    color: theme.colors.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  {unreadCount} sin leer
                </Text>
              )}
            </View>
          </View>

          {unreadCount > 0 && (
            <Pressable
              onPress={() => void markAllNotifRead()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: theme.colors.muted,
                flexShrink: 0,
              }}
            >
              <CheckCheck size={14} color={theme.colors.mutedForeground} strokeWidth={1.8} />
              <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.mutedForeground }}>
                Marcar todo
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 96, paddingHorizontal: 32 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 24,
                backgroundColor: theme.colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Bell size={28} color={theme.colors.mutedForeground} strokeWidth={2.5} />
            </View>
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 17, color: theme.colors.foreground }}>
              Sin notificaciones
            </Text>
            <Text
              style={{
                fontFamily: theme.typography.fontFamilyMedium,
                fontSize: 14,
                color: theme.colors.mutedForeground,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              Cuando la auxiliar registre actividades, aparecerán aquí.
            </Text>
          </View>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <View>
                <Text
                  style={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 8,
                    fontFamily: theme.typography.fontFamilyBlack,
                    fontSize: 11,
                    color: theme.colors.mutedForeground,
                    letterSpacing: 0.6,
                  }}
                >
                  HOY
                </Text>
                {todayNotifs.map(notif => (
                  <TodayNotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkRead={id => void markNotifRead(id)}
                  />
                ))}
              </View>
            )}

            {olderNotifs.length > 0 && (
              <View style={{ opacity: 0.6 }}>
                <Text
                  style={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 8,
                    fontFamily: theme.typography.fontFamilyBlack,
                    fontSize: 11,
                    color: theme.colors.mutedForeground,
                    letterSpacing: 0.6,
                  }}
                >
                  AYER
                </Text>
                {olderNotifs.map(notif => (
                  <OlderNotificationItem key={notif.id} notification={notif} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
