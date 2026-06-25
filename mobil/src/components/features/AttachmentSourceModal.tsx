import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Camera, Image as ImageIcon, FileText } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { MAX_ATTACHMENT_HINT } from '@/constants/attachments';
import { AppModal } from '@/components/ui/Modal';
import {
  pickDocumentAttachment,
  pickImageAttachment,
  type PickedAttachmentFile,
} from '@/services/api/attachments.api';

interface AttachmentSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onPicked: (file: PickedAttachmentFile) => void;
  uploading?: boolean;
  uploadProgress?: number;
}

function ActionRow({
  icon,
  label,
  disabled = false,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        opacity: disabled ? 0.5 : 1,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      {icon}
      <Text
        style={{
          flex: 1,
          fontFamily: theme.typography.fontFamilyBold,
          fontSize: 15,
          color: theme.colors.foreground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AttachmentSourceModal({
  visible,
  onClose,
  onPicked,
  uploading = false,
  uploadProgress = 0,
}: AttachmentSourceModalProps) {
  const { theme } = useTheme();

  const handleImagePick = async (source: 'library' | 'camera') => {
    try {
      const file = await pickImageAttachment(source);
      if (file) {
        onPicked(file);
      }
    } catch {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a la cámara o galería para adjuntar fotos.',
      );
    }
  };

  const handleDocumentPick = async () => {
    const file = await pickDocumentAttachment();
    if (file) {
      onPicked(file);
    }
  };

  return (
    <AppModal visible={visible} onClose={uploading ? () => undefined : onClose}>
      <View style={{ paddingTop: 20, paddingBottom: 8 }}>
        <Text
          style={{
            fontFamily: theme.typography.fontFamilyBlack,
            fontSize: 18,
            color: theme.colors.foreground,
            textAlign: 'center',
            marginBottom: 12,
            paddingHorizontal: 16,
          }}
        >
          Adjuntar archivo
        </Text>
        {!uploading && (
          <Text
            style={{
              fontFamily: theme.typography.fontFamilyMedium,
              fontSize: 12,
              color: theme.colors.mutedForeground,
              textAlign: 'center',
              marginBottom: 8,
              paddingHorizontal: 20,
            }}
          >
            {MAX_ATTACHMENT_HINT}
          </Text>
        )}

        {uploading ? (
          <View style={{ paddingHorizontal: 20, paddingVertical: 24, gap: 12 }}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text
              style={{
                fontFamily: theme.typography.fontFamilyMedium,
                fontSize: 14,
                color: theme.colors.mutedForeground,
                textAlign: 'center',
              }}
            >
              Subiendo… {uploadProgress}%
            </Text>
            <View
              style={{
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.colors.border,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  backgroundColor: theme.colors.primary,
                }}
              />
            </View>
          </View>
        ) : (
          <>
            <ActionRow
              icon={<Camera size={18} color={theme.colors.primary} />}
              label="Tomar foto"
              onPress={() => void handleImagePick('camera')}
            />
            <ActionRow
              icon={<ImageIcon size={18} color={theme.colors.primary} />}
              label="Elegir de galería"
              onPress={() => void handleImagePick('library')}
            />
            <ActionRow
              icon={<FileText size={18} color={theme.colors.primary} />}
              label="Elegir archivo"
              onPress={() => void handleDocumentPick()}
            />
            <Pressable
              onPress={onClose}
              style={{ paddingHorizontal: 16, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text
                style={{
                  fontFamily: theme.typography.fontFamilyBold,
                  fontSize: 15,
                  color: theme.colors.mutedForeground,
                }}
              >
                Cancelar
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </AppModal>
  );
}
