import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, ArrowRight, GraduationCap, ClipboardList, Users, Hash, Lock } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useAuth } from '@/store/useAuth';
import { Button } from '@/components/ui/Button';

const DEMO_ACCOUNTS: { label: string; code: string; icon: LucideIcon }[] = [
  { label: 'Auxiliar', code: 't10000001', icon: ClipboardList },
  { label: 'Padre', code: 'p10000001', icon: Users },
  { label: 'Alumno', code: 'e10000001', icon: GraduationCap },
];

export function LoginScreen() {
  const { theme } = useTheme();
  const { login, isLoading } = useAuth();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!code || !password) {
      setError('Completá todos los campos.');
      return;
    }
    setError('');
    try {
      await login(code, password);
    } catch {
      setError('Código o contraseña incorrectos.');
    }
  };

  const handleDemoLogin = async (demoCode: string) => {
    setError('');
    try {
      await login(demoCode, 'demo123');
    } catch {
      setError('No se pudo iniciar sesión.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <LinearGradient
        colors={theme.colors.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 260, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 56, paddingHorizontal: 32 }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: 'rgba(255,255,255,0.07)',
            top: -80,
            right: -60,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: 'rgba(255,255,255,0.07)',
            bottom: 20,
            left: -50,
          }}
        />
        <View style={{ alignItems: 'center', zIndex: 1 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.28)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <GraduationCap size={40} color="#fff" strokeWidth={1.8} />
          </View>
          <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 22, color: '#fff', letterSpacing: -0.5 }}>
            Agenda Escolar Digital
          </Text>
          <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
            Colegio San Martín
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{
          flex: 1,
          marginTop: -28,
          backgroundColor: theme.colors.card,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 22, color: theme.colors.foreground, letterSpacing: -0.5 }}>
          Iniciar sesión
        </Text>
        <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground, marginTop: 4, marginBottom: 24 }}>
          Accedé a la agenda de tu sección
        </Text>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground, marginBottom: 6 }}>
              Código de usuario
            </Text>
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }}>
                <Hash size={16} color={theme.colors.mutedForeground} strokeWidth={1.8} />
              </View>
              <TextInput
                value={code}
                onChangeText={v => { setCode(v); setError(''); }}
                placeholder="t10000001"
                placeholderTextColor={theme.colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  backgroundColor: theme.colors.muted,
                  color: theme.colors.foreground,
                  borderWidth: 1.5,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.md,
                  paddingLeft: 40,
                  paddingRight: 16,
                  paddingVertical: 14,
                  fontFamily: theme.typography.fontFamilyMedium,
                  fontSize: 14,
                }}
              />
            </View>
          </View>

          <View>
            <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground, marginBottom: 6 }}>
              Contraseña
            </Text>
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }}>
                <Lock size={16} color={theme.colors.mutedForeground} strokeWidth={1.8} />
              </View>
              <PasswordInput
                value={password}
                onChangeText={v => { setPassword(v); setError(''); }}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                theme={theme}
              />
              <Pressable
                onPress={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 16, top: 14 }}
              >
                {showPassword ? (
                  <EyeOff size={16} color={theme.colors.mutedForeground} />
                ) : (
                  <Eye size={16} color={theme.colors.mutedForeground} />
                )}
              </Pressable>
            </View>
          </View>

          {error ? (
            <Text
              style={{
                textAlign: 'center',
                fontFamily: theme.typography.fontFamilyMedium,
                fontSize: 12,
                color: theme.colors.destructive,
                backgroundColor: theme.colors.destructive + '14',
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
              }}
            >
              {error}
            </Text>
          ) : null}

          <Pressable style={{ alignSelf: 'flex-end' }}>
            <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.primary }}>
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          <Button
            label={isLoading ? '' : 'Ingresar'}
            onPress={() => void handleLogin()}
            disabled={isLoading}
            icon={isLoading ? <ActivityIndicator color="#fff" /> : <ArrowRight size={18} color="#fff" strokeWidth={2.5} />}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 11, color: theme.colors.mutedForeground, letterSpacing: 0.5 }}>
            ACCESO RÁPIDO
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {DEMO_ACCOUNTS.map(acc => {
            const Icon = acc.icon;
            return (
              <Pressable
                key={acc.code}
                onPress={() => void handleDemoLogin(acc.code)}
                disabled={isLoading}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 16,
                  borderRadius: theme.radii.md,
                  backgroundColor: theme.colors.muted,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.93 : 1,
                })}
              >
                <Icon size={28} color={theme.colors.primary} strokeWidth={1.75} />
                <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 12, color: theme.colors.foreground }}>
                  {acc.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ textAlign: 'center', fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 20 }}>
          ¿Problemas para acceder?{' '}
          <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamilyBold }}>Contactá al admin</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

function PasswordInput({
  value,
  onChangeText,
  secureTextEntry,
  placeholder,
  theme,
}: {
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.mutedForeground}
      style={{
        backgroundColor: theme.colors.muted,
        color: theme.colors.foreground,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.md,
        paddingLeft: 40,
        paddingRight: 48,
        paddingVertical: 14,
        fontFamily: theme.typography.fontFamilyMedium,
        fontSize: 14,
      }}
    />
  );
}
