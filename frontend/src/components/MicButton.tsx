import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  useAudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';

import { colors, font, radius, spacing } from '@/src/theme';
import { ensureMicPermission } from '@/src/lib/leoVoice';
import { sttUpload } from '@/src/lib/api';

type Props = {
  color: string;
  bhasha: string;
  disabled?: boolean;
  onTranscript: (text: string, autoSend: boolean) => void;
  testID?: string;
};

export default function MicButton({ color, bhasha, disabled, onTranscript, testID }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [permBlocked, setPermBlocked] = useState(false);

  const pulse = useSharedValue(1);
  const scale = useSharedValue(1);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    if (recording) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 500, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [recording]);

  const start = async () => {
    if (disabled || processing || isRecordingRef.current) return;
    const perm = await ensureMicPermission();
    if (!perm.granted) {
      setPermBlocked(!perm.canAskAgain);
      return;
    }
    setPermBlocked(false);
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true } as any);
      await recorder.prepareToRecordAsync();
      recorder.record();
      isRecordingRef.current = true;
      setRecording(true);
      scale.value = withSpring(0.94, { damping: 10 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    } catch (e) {
      isRecordingRef.current = false;
      setRecording(false);
    }
  };

  const stop = async () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setRecording(false);
    scale.value = withSpring(1, { damping: 10 });
    setProcessing(true);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) return;
      const result = await sttUpload(uri, bhasha);
      if (result.ok && result.transcript && result.transcript.trim().length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        onTranscript(result.transcript.trim(), true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
      }
    } finally {
      setProcessing(false);
    }
  };

  const pulseAnim = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const btnAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const openSettings = () => {
    Linking.openSettings().catch(() => undefined);
  };

  const showWebFallback = Platform.OS === 'web';

  return (
    <View style={{ alignItems: 'center' }}>
      {recording && <View style={styles.recDot} testID="mic-recording-dot" />}

      <Animated.View style={[styles.ring, pulseAnim, { borderColor: color }]} pointerEvents="none" />
      <Animated.View style={btnAnim}>
        <Pressable
          onPressIn={start}
          onPressOut={stop}
          disabled={disabled || processing}
          testID={testID ?? 'mic-button'}
          style={[
            styles.btn,
            { backgroundColor: recording ? colors.danger : color },
            (disabled || processing) && { opacity: 0.6 },
          ]}
          hitSlop={12}
        >
          <Text style={styles.emoji}>{recording ? '⏹' : processing ? '⏳' : '🎙️'}</Text>
        </Pressable>
      </Animated.View>

      {permBlocked && (
        <Pressable onPress={openSettings} style={styles.permBtn} testID="mic-open-settings">
          <Text style={styles.permText}>Enable mic in Settings →</Text>
        </Pressable>
      )}
      {showWebFallback && !recording && !processing && (
        <Text style={styles.hint}>Hold to talk</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    opacity: 0.5,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  emoji: { fontSize: 28 },
  recDot: {
    position: 'absolute',
    top: -8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.danger,
  },
  hint: {
    marginTop: 4,
    color: colors.onSurfaceFaint,
    fontFamily: font.body,
    fontSize: 10,
  },
  permBtn: { marginTop: 6, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  permText: {
    color: colors.danger,
    fontFamily: font.bodyBold,
    fontSize: 11,
  },
});
