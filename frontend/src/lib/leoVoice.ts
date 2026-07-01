import { Platform } from 'react-native';
import {
  AudioModule,
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';

import { api } from './api';

let currentPlayer: AudioPlayer | null = null;

async function base64ToPlayableSource(base64: string, mime = 'audio/wav'): Promise<any> {
  if (Platform.OS === 'web') {
    // Data URI works reliably on web.
    return { uri: `data:${mime};base64,${base64}` };
  }
  // Native: write to a cache file and play the file URI.
  const cacheDir = (FileSystem as any).cacheDirectory ?? (FileSystem as any).Paths?.cache?.uri;
  const file = `${cacheDir}leo-${Date.now()}.wav`;
  await (FileSystem as any).writeAsStringAsync(file, base64, {
    encoding: (FileSystem as any).EncodingType?.Base64 ?? 'base64',
  });
  return { uri: file };
}

export function stopLeoVoice() {
  if (currentPlayer) {
    try {
      currentPlayer.pause();
      currentPlayer.remove();
    } catch {}
    currentPlayer = null;
  }
}

export async function speakLeo(
  text: string,
  bhasha: string,
  onEnd?: () => void,
  onError?: (msg: string) => void,
): Promise<boolean> {
  try {
    // Clean-up any prior playback
    stopLeoVoice();

    // Strip markdown-ish characters so Leo doesn't say "asterisk asterisk"
    const clean = text
      .replace(/\*+/g, '')
      .replace(/[_`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return false;

    const tts = await api.tts(clean, bhasha);
    if (!tts.ok || !tts.audio_base64) {
      onError?.(tts.error || 'TTS unavailable');
      return false;
    }

    // Ensure audio can play in silent mode (iOS silent switch)
    try {
      await setAudioModeAsync({ playsInSilentMode: true } as any);
    } catch {}

    const source = await base64ToPlayableSource(tts.audio_base64, tts.mime || 'audio/wav');
    const player = createAudioPlayer(source);
    currentPlayer = player;

    // When playback finishes
    const sub = player.addListener('playbackStatusUpdate', (status: any) => {
      if (status?.didJustFinish) {
        sub?.remove?.();
        if (currentPlayer === player) {
          currentPlayer = null;
        }
        try {
          player.remove();
        } catch {}
        onEnd?.();
      }
    });

    player.play();
    return true;
  } catch (exc: any) {
    onError?.(exc?.message || 'voice failed');
    return false;
  }
}

export async function ensureMicPermission(): Promise<{ granted: boolean; canAskAgain: boolean }> {
  try {
    const perm = await AudioModule.requestRecordingPermissionsAsync();
    return { granted: !!perm.granted, canAskAgain: !!perm.canAskAgain };
  } catch {
    return { granted: false, canAskAgain: false };
  }
}
