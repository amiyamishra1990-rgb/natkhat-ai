import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle, Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, font, leoEmotions, LeoEmotion } from '@/src/theme';

type Props = {
  size?: number;
  emotion?: LeoEmotion;
  bob?: boolean;
  onTap?: () => void;
  style?: ViewStyle;
  testID?: string;
};

export default function LeoFace({
  size = 160,
  emotion = 'happy',
  bob = true,
  onTap,
  style,
  testID,
}: Props) {
  const e = leoEmotions[emotion];
  const bobY = useSharedValue(0);
  const pressS = useSharedValue(1);
  const sparkR = useSharedValue(0);

  useEffect(() => {
    if (bob) {
      bobY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
    } else {
      bobY.value = withTiming(0);
    }
    sparkR.value = withRepeat(
      withTiming(360, { duration: 5000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [bob]);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobY.value }, { scale: pressS.value }],
  }));
  const sparkStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkR.value}deg` }],
  }));

  const handlePressIn = () => {
    pressS.value = withSpring(0.92, { damping: 10 });
  };
  const handlePressOut = () => {
    pressS.value = withSpring(1, { damping: 10 });
  };

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]} testID={testID}>
      {/* Rotating sparkle ring */}
      <Animated.View style={[StyleSheet.absoluteFill, sparkStyle]} pointerEvents="none">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <Text
            key={deg}
            style={[
              styles.sparkle,
              {
                fontSize: size * 0.14,
                transform: [
                  { rotate: `${deg}deg` },
                  { translateY: -size * 0.6 },
                ],
              },
            ]}
          >
            {e.spark}
          </Text>
        ))}
      </Animated.View>

      <Pressable
        onPress={onTap}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: size, height: size }}
        disabled={!onTap}
        testID={testID ? `${testID}-press` : undefined}
      >
        <Animated.View style={[styles.faceWrap, bobStyle]}>
          <LinearGradient
            colors={[e.bg, e.ring]}
            style={[
              styles.face,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: e.ring,
                borderWidth: Math.max(3, size * 0.03),
              },
            ]}
          >
            <Text style={{ fontSize: size * 0.55 }}>{e.emoji}</Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  faceWrap: { alignItems: 'center', justifyContent: 'center' },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FB923C',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  sparkle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    color: colors.onSurface,
    fontFamily: font.body,
  },
});
