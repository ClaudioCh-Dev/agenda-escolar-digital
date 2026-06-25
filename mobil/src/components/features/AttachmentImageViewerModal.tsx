import { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { useTheme } from '@/theme';

interface AttachmentImageViewerModalProps {
  visible: boolean;
  url: string | null;
  name?: string;
  onClose: () => void;
}

export function AttachmentImageViewerModal({
  visible,
  url,
  name,
  onClose,
}: AttachmentImageViewerModalProps) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panOriginX = useSharedValue(0);
  const panOriginY = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      panOriginX.value = 0;
      panOriginY.value = 0;
    }
  }, [visible, panOriginX, panOriginY, savedScale, scale, translateX, translateY]);

  const pinch = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = Math.min(Math.max(savedScale.value * event.scale, 1), 4);
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        panOriginX.value = 0;
        panOriginY.value = 0;
      } else {
        savedScale.value = scale.value;
      }
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      panOriginX.value = translateX.value;
      panOriginY.value = translateY.value;
    })
    .onUpdate(event => {
      if (scale.value > 1) {
        translateX.value = panOriginX.value + event.translationX;
        translateY.value = panOriginY.value + event.translationY;
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        panOriginX.value = 0;
        panOriginY.value = 0;
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!visible || !url) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.header}>
          {name ? (
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                fontFamily: theme.typography.fontFamilyBold,
                fontSize: 14,
                color: '#fff',
                marginRight: 12,
              }}
            >
              {name}
            </Text>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar visor"
          >
            <X size={22} color="#fff" />
          </Pressable>
        </View>

        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.imageWrap, { width, height: height * 0.75 }, imageStyle]}>
            <Image
              source={{ uri: url }}
              style={styles.image}
              contentFit="contain"
              transition={200}
              placeholderContentFit="contain"
            />
          </Animated.View>
        </GestureDetector>

        <Text
          style={{
            fontFamily: theme.typography.fontFamilyMedium,
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            paddingHorizontal: 24,
            paddingBottom: 24,
          }}
        >
          Pellizcá para zoom · Doble tap para ampliar
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
