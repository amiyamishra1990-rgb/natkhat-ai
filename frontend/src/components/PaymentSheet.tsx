import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, font, radius, spacing } from '@/src/theme';

type Plan = {
  id: 'portal_70' | 'all_399' | 'sixmonth_1999';
  title: string;
  price: string;
  sub: string;
  best?: boolean;
};

const PLANS: Plan[] = [
  { id: 'portal_70', title: 'Just this portal', price: '₹70', sub: 'per month' },
  { id: 'all_399', title: 'All 10 portals', price: '₹399', sub: 'per month · save ₹91', best: true },
  { id: 'sixmonth_1999', title: 'Six-month pack', price: '₹1,999', sub: 'saves ₹395' },
];

type Props = {
  visible: boolean;
  portalName?: string;
  loading?: boolean;
  onClose: () => void;
  onSelect: (plan: Plan['id']) => void;
};

export default function PaymentSheet({ visible, portalName, loading, onClose, onSelect }: Props) {
  const translateY = useSharedValue(600);
  const backdropOp = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
      backdropOp.value = withTiming(1, { duration: 260 });
    } else {
      translateY.value = withTiming(600, { duration: 260 });
      backdropOp.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const sheetAnim = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropAnim = useAnimatedStyle(() => ({ opacity: backdropOp.value }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, backdropAnim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} testID="payment-sheet-backdrop" />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetAnim]}>
        <BlurView intensity={40} tint="dark" style={styles.blur}>
          <View style={styles.grabber} />
          <Text style={styles.title}>Unlock {portalName ?? 'Portal'} ✨</Text>
          <Text style={styles.subtitle}>Pick a plan for endless Leo missions!</Text>

          <View style={styles.plansWrap}>
            {PLANS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                  onSelect(p.id);
                }}
                disabled={loading}
                testID={`plan-${p.id}`}
                style={({ pressed }) => [
                  styles.plan,
                  p.best && styles.planBest,
                  pressed && { opacity: 0.85 },
                ]}
              >
                {p.best && (
                  <LinearGradient
                    colors={[colors.brand, colors.pink]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bestBadge}
                  >
                    <Text style={styles.bestBadgeText}>BEST VALUE</Text>
                  </LinearGradient>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.planTitle}>{p.title}</Text>
                  <Text style={styles.planSub}>{p.sub}</Text>
                </View>
                <Text style={styles.planPrice}>{p.price}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={onClose} testID="payment-sheet-close" style={styles.closeBtn}>
            <Text style={styles.closeText}>Maybe later</Text>
          </Pressable>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
  },
  blur: { padding: spacing.xl, paddingBottom: spacing.xl2 },
  grabber: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: { color: colors.onSurface, fontFamily: font.display, fontSize: 24, textAlign: 'center' },
  subtitle: {
    color: colors.onSurfaceMuted,
    fontFamily: font.body,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  plansWrap: { gap: spacing.sm },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planBest: { borderColor: colors.brand },
  bestBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  bestBadgeText: { color: '#000', fontFamily: font.bodyBold, fontSize: 10, letterSpacing: 0.6 },
  planTitle: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 15 },
  planSub: { color: colors.onSurfaceMuted, fontFamily: font.body, fontSize: 12, marginTop: 2 },
  planPrice: { color: colors.brand, fontFamily: font.display, fontSize: 22, marginLeft: spacing.md },
  closeBtn: { alignSelf: 'center', marginTop: spacing.lg, padding: spacing.sm },
  closeText: { color: colors.onSurfaceMuted, fontFamily: font.bodyBold, fontSize: 13 },
});
