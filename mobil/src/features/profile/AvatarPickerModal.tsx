import { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { USE_MOCK } from '@/constants/config';
import { AppModal } from '@/components/ui/Modal';
import { removeAvatar, uploadAvatar } from '@/services/api/users.api';
import type { User } from '@/types';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

interface AvatarPickerModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
  onUpdated: (user: Partial<User>) => void;
}

function ActionRow({
  icon,
  label,
  destructive = false,
  disabled = false,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  destructive?: boolean;
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
          color: destructive ? theme.colors.destructive : theme.colors.foreground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AvatarPickerModal({
  visible,
  user,
  onClose,
  onUpdated,
}: AvatarPickerModalProps) {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePick = async (source: 'library' | 'camera') => {
    if (USE_MOCK) {
      Alert.alert('Modo demo', 'Cambiar foto de perfil solo está disponible con la API.');
      return;
    }

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso para cambiar tu foto de perfil.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    setUploading(true);
    setUploadProgress(0);

    try {
      const updated = await uploadAvatar(
        {
          uri: asset.uri,
          name: asset.fileName ?? 'avatar.jpg',
          mimeType: asset.mimeType ?? 'image/jpeg',
        },
        { onProgress: setUploadProgress },
      );
      onUpdated({ avatar: updated.avatar, initials: updated.initials });
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudo subir la foto. Verificá que sea una imagen de hasta 5 MB.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    if (USE_MOCK) {
      Alert.alert('Modo demo', 'Quitar foto de perfil solo está disponible con la API.');
      return;
    }

    Alert.alert('Quitar foto', '¿Querés volver a mostrar tus iniciales?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setUploading(true);
            try {
              const updated = await removeAvatar();
              onUpdated({ avatar: updated.avatar, initials: updated.initials });
              onClose();
            } catch {
              Alert.alert('Error', 'No se pudo quitar la foto de perfil.');
            } finally {
              setUploading(false);
            }
          })();
        },
      },
    ]);
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
          Foto de perfil
        </Text>

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
              icon={<ImageIcon size={18} color={theme.colors.primary} />}
              label="Elegir de galería"
              onPress={() => void handlePick('library')}
            />
            <ActionRow
              icon={<Camera size={18} color={theme.colors.primary} />}
              label="Tomar foto"
              onPress={() => void handlePick('camera')}
            />
            {user.avatar ? (
              <ActionRow
                icon={<Trash2 size={18} color={theme.colors.destructive} />}
                label="Quitar foto"
                destructive
                onPress={handleRemove}
              />
            ) : null}
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
