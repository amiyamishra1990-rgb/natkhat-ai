import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import LeoFace from '@/src/components/LeoFace';
import { colors, font, spacing } from '@/src/theme';
import { api } from '@/src/lib/api';
import { getChild, saveChild } from '@/src/lib/session';

export default function LeoIntro() {
  const router = useRouter();
  const [childName, setChildName] = useState<string>('friend');
  const [tapped, setTapped] = useState(false);

  const scale = useSharedValue(0.2);
  const glow = useSharedValue(0.8);
  const confettiOp = useSharedValue(0);

  useEffect(() => {
    (async () => {
      const c = await getChild();
      if (c) setChildName(c.child_name);
    })();
    scale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 90 }));
    glow.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.85, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, []);

  const onTapLeo = async () => {
    if (tapped) return;
    setTapped(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    confettiOp.value = withTiming(1, { duration: 200 });

    const child = await getChild();
    if (child) {
      try {
        await api.seenIntro(child.id);
        await saveChild({ ...child, has_seen_intro: true });
      } catch {}
    }

    setTimeout(() => router.replace('/home'), 1400);
  };

  const leoAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowAnim = useAnimatedStyle(() => ({ transform: [{ scale: glow.value }] }));
  const confettiAnim = useAnimatedStyle(() => ({ opacity: confettiOp.value }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.wrap}>
        <Animated.View style={[styles.glow, glowAnim]}>
          <LinearGradient
            colors={['rgba(251,146,60,0.4)', 'rgba(236,72,153,0.15)', 'transparent']}
            style={styles.glowGrad}
          />
        </Animated.View>

        <Text style={styles.hi}>{childName}!!</Text>
        <Text style={styles.big}>Leo aa gaya!! 🦁</Text>

        <Animated.View style={[styles.leoWrap, leoAnim]}>
          <LeoFace
            size={230}
            emotion={tapped ? 'proud' : 'excited'}
            bob
            onTap={onTapLeo}
            testID="leo-intro-face"
          />
        </Animated.View>

        <Animated.View style={[styles.confetti, confettiAnim]} pointerEvents="none">
          {['🎉', '⭐', '🎊', '✨', '🎈', '🌟', '💫', '🎉'].map((c, i) => (
            <Text
              key={i}
              style={[
                styles.confettiPiece,
                { top: `${Math.random() * 60}%`, left: `${(i / 8) * 100}%` },
              ]}
            >
              {c}
            </Text>
          ))}
        </Animated.View>

        <View style={styles.hintWrap}>
          <Text style={styles.hint}>
            {tapped ? 'YAY! Leo loves you! 💛' : 'Tap my nose!! 👉'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  glow: { position: 'absolute', width: 520, height: 520, opacity: 0.55 },
  glowGrad: { flex: 1, borderRadius: 260 },
  hi: {
    color: colors.brand,
    fontFamily: font.display,
    fontSize: 42,
    letterSpacing: 1,
  },
  big: {
    color: colors.onSurface,
    fontFamily: font.display,
    fontSize: 30,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  leoWrap: { marginVertical: spacing.md },
  hintWrap: { marginTop: spacing.xl2 },
  hint: {
    color: colors.pink,
    fontFamily: font.bodyBold,
    fontSize: 20,
    textAlign: 'center',
  },
  confetti: { ...StyleSheet.absoluteFillObject },
  confettiPiece: { position: 'absolute', fontSize: 28 },
});
