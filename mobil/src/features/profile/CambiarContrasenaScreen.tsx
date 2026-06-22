import { useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Lock, Eye, EyeOff, Check, CircleAlert } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { TopBar } from '@/components/layout/TopBar';

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error,
  theme,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground, marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{ position: 'relative' }}>
        <View style={{ position: 'absolute', left: 16, top: 15, zIndex: 1 }}>
          <Lock size={16} color={theme.colors.mutedForeground} strokeWidth={1.8} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
          secureTextEntry={!visible}
          placeholder={placeholder ?? '••••••••'}
          placeholderTextColor={theme.colors.mutedForeground}
          style={{
            backgroundColor: theme.colors.card,
            color: theme.colors.foreground,
            borderWidth: error ? 2 : 1.5,
            borderColor: error ? theme.colors.destructive : theme.colors.border,
            borderRadius: theme.radii.lg,
            paddingLeft: 44,
            paddingRight: 48,
            paddingVertical: 14,
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 14,
          }}
        />
        <Pressable onPress={() => setVisible(v => !v)} style={{ position: 'absolute', right: 16, top: 14 }}>
          {visible ? <EyeOff size={16} color={theme.colors.mutedForeground} /> : <Eye size={16} color={theme.colors.mutedForeground} />}
        </Pressable>
      </View>
      {error && <Text style={{ color: theme.colors.destructive, fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

export function CambiarContrasenaScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!current.trim()) nextErrors.current = 'Ingresá tu contraseña actual.';
    if (!next.trim()) nextErrors.next = 'Ingresá la nueva contraseña.';
    else if (next.length < 8) nextErrors.next = 'Mínimo 8 caracteres.';
    if (!confirm.trim()) nextErrors.confirm = 'Confirmá la nueva contraseña.';
    else if (next !== confirm) nextErrors.confirm = 'Las contraseñas no coinciden.';
    if (current && next && current === next) nextErrors.next = 'Debe ser distinta a la actual.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setIsLoading(false);
    setSaved(true);
    setTimeout(() => router.back(), 1200);
  };

  if (saved) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Check size={44} color="#fff" />
        </View>
        <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 24, color: theme.colors.foreground }}>¡Contraseña actualizada!</Text>
        <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground, marginTop: 8, textAlign: 'center' }}>
          Usá la nueva contraseña la próxima vez que ingreses.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar title="Cambiar contraseña" showBack onBack={() => router.back()} unreadNotifications={0} rightAction={<View style={{ width: 40 }} />} />

      <Screen scroll padded>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 24 }}>
          <CircleAlert size={18} color={theme.colors.mutedForeground} style={{ marginTop: 2 }} />
          <Text style={{ flex: 1, fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground, lineHeight: 20 }}>
            La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y no contener espacios.
          </Text>
        </View>

        <View style={{ gap: 20 }}>
          <PasswordField
            label="Contraseña actual"
            value={current}
            onChange={v => { setCurrent(v); setErrors(p => ({ ...p, current: '' })); }}
            error={errors.current}
            theme={theme}
          />
          <PasswordField
            label="Nueva contraseña"
            value={next}
            onChange={v => { setNext(v); setErrors(p => ({ ...p, next: '' })); }}
            error={errors.next}
            theme={theme}
          />
          <PasswordField
            label="Confirmar nueva contraseña"
            value={confirm}
            onChange={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: '' })); }}
            error={errors.confirm}
            theme={theme}
          />
        </View>

        <View style={{ marginTop: 32 }}>
          <Button
            label={isLoading ? '' : 'Guardar contraseña'}
            onPress={() => void handleSubmit()}
            disabled={isLoading}
            icon={isLoading ? <ActivityIndicator color="#fff" /> : <Check size={20} color="#fff" />}
          />
        </View>
      </Screen>
    </View>
  );
}
