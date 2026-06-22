import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function AppModal({ visible, onClose, children }: AppModalProps) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        <View style={[styles.content, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { width: '100%', maxWidth: 390, borderRadius: 24, borderWidth: 1, maxHeight: '80%', overflow: 'hidden' },
});
