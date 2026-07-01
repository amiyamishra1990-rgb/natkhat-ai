import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import * as Haptics from 'expo-haptics';

import LeoFace from './LeoFace';
import { colors, font, radius, spacing } from '@/src/theme';

type Props = {
  visible: boolean;
  levelTitle: string;
  levelEmoji: string;
  level: number;
  onClose: () => void;
};

export default function LevelUpModal({ visible, levelTitle, levelEmoji, level, onClose }: Props) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const confetti = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      scale.value = withSpring(1, { damping: 8, stiffness: 90 });
      rotate.value = withRepeat(
        withSequence(
          withTiming(6, { duration: 220, easing: Easing.inOut(Easing.quad) }),
          withTiming(-6, { duration: 220, easing: Easing.inOut(Easing.quad) }),
        ),
        6,
        true,
      );
      confetti.value = withDelay(200, withTiming(1, { duration: 400 }));
    } else {
      scale.value = 0;
      confetti.value = 0;
    }
  }, [visible]);

  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));
  const confettiAnim = useAnimatedStyle(() => ({ opacity: confetti.value }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <Animated.View style={[styles.confetti, confettiAnim]} pointerEvents="none">
          {['🎉', '⭐', '🌟', '🎊', '✨', '🎈', '💫', '🎇', '🏆', '🥇'].map((c, i) => (
            <Text
              key={i}
              style={[
                styles.confettiPiece,
                { top: `${Math.random() * 90}%`, left: `${(i / 10) * 100}%` },
              ]}
            >
              {c}
            </Text>
          ))}
        </Animated.View>

        <Animated.View style={[styles.card, cardAnim]}>
          <LinearGradient
            colors={[colors.brand, colors.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGrad}
          >
            <Text style={styles.top}>LEVEL UP!</Text>
            <LeoFace size={110} emotion="proud" bob />
            <Text style={styles.emoji}>{levelEmoji}</Text>
            <Text style={styles.title}>Level {level}</Text>
            <Text style={styles.subtitle}>{levelTitle}</Text>

            <Pressable onPress={onClose} testID="level-up-close" style={styles.btn}>
              <Text style={styles.btnText}>YAY! 🎉</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  confetti: { ...StyleSheet.absoluteFillObject },
  confettiPiece: { position: 'absolute', fontSize: 30 },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 340,
  },
  cardGrad: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingVertical: spacing.xl2,
  },
  top: {
    color: '#fff',
    fontFamily: font.display,
    fontSize: 26,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  emoji: { fontSize: 48, marginTop: spacing.md },
  title: { color: '#fff', fontFamily: font.display, fontSize: 30, marginTop: spacing.sm },
  subtitle: { color: '#fff', fontFamily: font.bodyBold, fontSize: 16, marginTop: 2 },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: '#000',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  btnText: { color: '#fff', fontFamily: font.bodyBold, fontSize: 16, letterSpacing: 0.5 },
});
