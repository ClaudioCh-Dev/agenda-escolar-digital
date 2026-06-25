import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Eye, Download, Image as ImageIcon, Paperclip } from 'lucide-react-native';
import { useTheme } from '@/theme';
import type { Attachment } from '@/types';
import { openAttachment } from '@/utils/openAttachment';

interface AttachmentListRowProps {
  attachment: Attachment;
  onOpenImage: (url: string, name: string) => void;
}

export function AttachmentListRow({ attachment, onOpenImage }: AttachmentListRowProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const isImage = attachment.fileType === 'image';
  const actionLabel = isImage ? 'Ver' : 'Abrir';
  const disabled = loading || !attachment.url;

  const handlePress = async () => {
    try {
      if (!isImage) {
        setLoading(true);
      }
      await openAttachment(attachment, { onOpenImage });
    } catch {
      Alert.alert('Error', 'No se pudo abrir el archivo. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={() => void handlePress()}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: theme.colors.muted,
        opacity: disabled && !attachment.url ? 0.5 : 1,
      }}
    >
      {isImage ? (
        <ImageIcon size={14} color={theme.colors.mutedForeground} />
      ) : (
        <Paperclip size={14} color={theme.colors.mutedForeground} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: theme.typography.fontFamilyBold,
            fontSize: 13,
            color: theme.colors.foreground,
          }}
        >
          {attachment.name}
        </Text>
        <Text
          style={{
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 12,
            color: theme.colors.mutedForeground,
            marginTop: 2,
          }}
        >
          {attachment.size}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {isImage ? (
            <Eye size={14} color={theme.colors.primary} />
          ) : (
            <Download size={14} color={theme.colors.primary} />
          )}
          <Text
            style={{
              fontFamily: theme.typography.fontFamilyBold,
              fontSize: 12,
              color: theme.colors.primary,
            }}
          >
            {actionLabel}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
