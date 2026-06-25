import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { USE_MOCK } from '@/constants/config';
import type { Attachment } from '@/types';

function getDocumentMimeType(att: Attachment): string {
  const lower = att.name.toLowerCase();
  if (att.fileType === 'pdf' || lower.endsWith('.pdf')) {
    return 'application/pdf';
  }
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return 'application/msword';
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'archivo';
}

export async function openDocumentAttachment(att: Attachment): Promise<void> {
  if (!att.url) {
    if (USE_MOCK) {
      Alert.alert('Modo demo', 'Los adjuntos reales solo están disponibles con la API.');
      return;
    }
    Alert.alert('No disponible', 'No se pudo abrir este archivo.');
    return;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert('No disponible', 'Tu dispositivo no puede abrir archivos externos.');
    return;
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    Alert.alert('Error', 'No se pudo preparar la descarga.');
    return;
  }

  const localUri = `${cacheDir}${Date.now()}_${sanitizeFileName(att.name)}`;
  const download = await FileSystem.downloadAsync(att.url, localUri);

  await Sharing.shareAsync(download.uri, {
    mimeType: getDocumentMimeType(att),
    dialogTitle: att.name,
  });
}

export async function openAttachment(
  att: Attachment,
  options: { onOpenImage: (url: string, name: string) => void },
): Promise<void> {
  if (!att.url) {
    if (USE_MOCK) {
      Alert.alert('Modo demo', 'Los adjuntos reales solo están disponibles con la API.');
      return;
    }
    Alert.alert('No disponible', 'No se pudo abrir este archivo.');
    return;
  }

  if (att.fileType === 'image') {
    options.onOpenImage(att.url, att.name);
    return;
  }

  await openDocumentAttachment(att);
}
