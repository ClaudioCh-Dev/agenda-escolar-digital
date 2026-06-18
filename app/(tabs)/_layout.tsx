import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, CalendarDays, BookOpen, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';

function TabBarIcon({ Icon, focused }: { Icon: LucideIcon; focused: boolean }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
      }}
    >
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 14,
            backgroundColor: theme.colors.primary,
          }}
        />
      )}
      <Icon
        size={20}
        color={focused ? '#ffffff' : theme.colors.mutedForeground}
        strokeWidth={focused ? 2.2 : 1.8}
      />
    </View>
  );
}

function TabBarLabel({ focused, children }: { focused: boolean; children: string }) {
  const { theme } = useTheme();

  return (
    <Text
      numberOfLines={1}
      style={{
        fontFamily: focused ? theme.typography.fontFamilyBlack : theme.typography.fontFamilyMedium,
        fontSize: 10,
        color: focused ? theme.colors.primary : theme.colors.mutedForeground,
        marginTop: 6,
        lineHeight: 12,
      }}
    >
      {children}
    </Text>
  );
}

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 78,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#1A1740',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabBarIcon Icon={Home} focused={focused} />,
          tabBarLabel: ({ focused, children }) => (
            <TabBarLabel focused={focused}>{typeof children === 'string' ? children : 'Inicio'}</TabBarLabel>
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ focused }) => <TabBarIcon Icon={BookOpen} focused={focused} />,
          tabBarLabel: ({ focused, children }) => (
            <TabBarLabel focused={focused}>{typeof children === 'string' ? children : 'Agenda'}</TabBarLabel>
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ focused }) => <TabBarIcon Icon={CalendarDays} focused={focused} />,
          tabBarLabel: ({ focused, children }) => (
            <TabBarLabel focused={focused}>{typeof children === 'string' ? children : 'Calendario'}</TabBarLabel>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabBarIcon Icon={User} focused={focused} />,
          tabBarLabel: ({ focused, children }) => (
            <TabBarLabel focused={focused}>{typeof children === 'string' ? children : 'Perfil'}</TabBarLabel>
          ),
        }}
      />
    </Tabs>
  );
}
