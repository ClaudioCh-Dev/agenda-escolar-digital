import { AppModal } from './Modal';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { theme } = useTheme();
  return (
    <AppModal visible={visible} onClose={onCancel}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 18, color: theme.colors.foreground }}>{title}</Text>
        <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground, marginTop: 8, lineHeight: 20 }}>{description}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
          <Pressable onPress={onCancel} style={{ flex: 1, backgroundColor: theme.colors.muted, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontFamily: theme.typography.fontFamilyBold, color: theme.colors.foreground }}>{cancelLabel}</Text>
          </Pressable>
          <Pressable onPress={onConfirm} style={{ flex: 1, backgroundColor: theme.colors.destructive, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontFamily: theme.typography.fontFamilyBold, color: '#fff' }}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </AppModal>
  );
}
