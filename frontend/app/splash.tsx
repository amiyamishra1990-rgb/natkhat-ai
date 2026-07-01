import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import LeoFace from '@/src/components/LeoFace';
import { colors, font, spacing } from '@/src/theme';

export default function Splash() {
  const router = useRouter();
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  const glowScale = useSharedValue(0.9);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.4)) });
    opacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    const t = setTimeout(() => {
      router.replace('/login');
    }, 3400);
    return () => clearTimeout(t);
  }, []);

  const leoAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const textAnim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const glowAnim = useAnimatedStyle(() => ({ transform: [{ scale: glowScale.value }], opacity: 0.6 }));

  return (
    <View style={styles.wrap} testID="splash-screen">
      <Animated.View style={[styles.glow, glowAnim]}>
        <LinearGradient
          colors={['rgba(251,146,60,0.35)', 'rgba(236,72,153,0.15)', 'transparent']}
          style={styles.glowGrad}
        />
      </Animated.View>

      <Animated.View style={leoAnim}>
        <LeoFace size={200} emotion="excited" bob />
      </Animated.View>

      <Animated.View style={[styles.textWrap, textAnim]}>
        <Text style={styles.title}>Natkhat AI</Text>
        <Text style={styles.tagline}>Screen time? Nahi beta — Room time! 🦁</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  glow: { position: 'absolute', width: 500, height: 500 },
  glowGrad: { flex: 1, borderRadius: 250 },
  textWrap: { marginTop: spacing.xl2, alignItems: 'center' },
  title: {
    color: colors.onSurface,
    fontFamily: font.display,
    fontSize: 42,
    letterSpacing: 1,
  },
  tagline: {
    marginTop: spacing.sm,
    color: colors.brand,
    fontFamily: font.bodyBold,
    fontSize: 15,
  },
});
