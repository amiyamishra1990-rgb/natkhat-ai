import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import LeoFace from '@/src/components/LeoFace';
import LevelUpModal from '@/src/components/LevelUpModal';
import MicButton from '@/src/components/MicButton';
import ToyPrimer from '@/src/components/ToyPrimer';
import GlitchPrimer from '@/src/components/GlitchPrimer';
import { colors, font, radius, spacing, LeoEmotion } from '@/src/theme';
import { api } from '@/src/lib/api';
import { getChild, saveChild } from '@/src/lib/session';
import { speakLeo, stopLeoVoice } from '@/src/lib/leoVoice';
import type { Portal } from '@/src/components/PortalCard';

const PORTAL_MAP: Record<string, Portal & { prompts: string[] }> = {
  question: {
    id: 'question',
    name: 'Question Portal',
    emoji: '❓',
    color: '#FB923C',
    tagline: 'Ask Leo anything!',
    free: true,
    xp: 15,
    prompts: [
      'Why is the sky blue?',
      'Why do dogs wag their tails?',
      'How does a plant grow?',
      'Why do stars twinkle?',
      'Why do we sneeze?',
    ],
  },
  toystory: {
    id: 'toystory',
    name: 'Toy Story',
    emoji: '🧸',
    color: '#EC4899',
    tagline: 'Bring toys to life!',
    free: true,
    xp: 20,
    prompts: [],
  },
  glitch: {
    id: 'glitch',
    name: 'Story Machine',
    emoji: '🌀',
    color: '#8B5CF6',
    tagline: 'Impossible combos!',
    free: true,
    xp: 25,
    prompts: [],
  },
};

type Turn = { role: 'user' | 'assistant'; content: string };

export default function PortalSession() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const portal = useMemo(() => PORTAL_MAP[id || 'question'] ?? PORTAL_MAP.question, [id]);

  const [child, setChild] = useState<any>(null);
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [emotion, setEmotion] = useState<LeoEmotion>('happy');
  const [busy, setBusy] = useState(false);
  const [missionState, setMissionState] = useState<'idle' | 'awaiting' | 'done'>('idle');
  const [awardedXp, setAwardedXp] = useState(0);
  const [levelUp, setLevelUp] = useState<null | { level: number; title: string; emoji: string }>(null);
  const [showBurst, setShowBurst] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const startTs = useRef<number>(Date.now());
  const burstY = useSharedValue(0);
  const burstOp = useSharedValue(0);
  const burstScale = useSharedValue(0.6);

  useEffect(() => {
    return () => {
      stopLeoVoice();
    };
  }, []);

  const playLeoSpeech = async (text: string) => {
    if (!child) return;
    setSpeaking(true);
    setEmotion('excited');
    const ok = await speakLeo(
      text,
      child.bhasha,
      () => {
        setSpeaking(false);
      },
      () => {
        setSpeaking(false);
      },
    );
    if (!ok) setSpeaking(false);
  };

  useEffect(() => {
    (async () => {
      const c = await getChild();
      if (!c) return router.replace('/login');
      setChild(c);
      const intros: Record<string, string> = {
        question: `${c.child_name}!! ${portal.emoji} Welcome to Question Portal!! Ask me ANYTHING and I'll tell you a funny story + a mission! 🦁`,
        toystory: `${c.child_name}!! ${portal.emoji} Point your camera at a toy — OR pick one below! Leo will make a WILD crossover story just for you! 🎬`,
        glitch: `${c.child_name}!! ${portal.emoji} DANGER!! Leo needs an IMPOSSIBLE combo — something that CAN'T happen — QUICK before reality glitches!! ⚡`,
      };
      setTurns([{ role: 'assistant', content: intros[portal.id] ?? intros.question }]);
      setEmotion(portal.id === 'glitch' ? 'dramatic' : 'excited');
    })();
  }, [id]);

  useEffect(() => {
    // scroll to bottom on new turn
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [turns.length, busy, missionState]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy || !child) return;
    setInput('');
    setTurns((t) => [...t, { role: 'user', content: q }]);
    setBusy(true);
    setEmotion('thinking');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);

    try {
      const r = await api.askLeo({
        child_id: child.id,
        child_name: child.child_name,
        bhasha: child.bhasha,
        portal_name: portal.name,
        messages: [{ role: 'user', content: q }],
      });
      const text = r.content?.[0]?.text ?? 'Arey, Leo is dreaming! Try again beta!';
      setTurns((t) => [...t, { role: 'assistant', content: text }]);
      if (r.safety_triggered) {
        setEmotion('dramatic');
        setMissionState('idle');
      } else {
        setEmotion('happy');
        setMissionState('awaiting');
      }
      // Auto-play Leo's voice
      playLeoSpeech(text);
    } catch (e) {
      setTurns((t) => [
        ...t,
        {
          role: 'assistant',
          content: `Arey ${child.child_name}! Leo's internet is taking a nap! Try again beta! 🦁`,
        },
      ]);
      setEmotion('thinking');
    } finally {
      setBusy(false);
    }
  };

  const runBurst = () => {
    setShowBurst(true);
    burstY.value = 0;
    burstOp.value = 0;
    burstScale.value = 0.6;
    burstOp.value = withTiming(1, { duration: 150 });
    burstScale.value = withSpring(1.2, { damping: 6 });
    burstY.value = withTiming(-140, { duration: 900, easing: Easing.out(Easing.quad) });
    burstOp.value = withDelay(700, withTiming(0, { duration: 300 }));
    setTimeout(() => setShowBurst(false), 1100);
  };

  const missionDone = async () => {
    if (!child || missionState !== 'awaiting') return;
    setMissionState('done');
    setEmotion('proud');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    runBurst();

    const xp = portal.xp;
    setAwardedXp((v) => v + xp);
    const prevXp = child.xp || 0;
    const prevLevel = child.level_info?.level ?? 1;

    try {
      const lastQ = [...turns].reverse().find((t) => t.role === 'user')?.content;
      const lastA = [...turns].reverse().find((t) => t.role === 'assistant')?.content;
      await api.logSession({
        child_id: child.id,
        portal_id: portal.id,
        question_asked: lastQ,
        leo_response: lastA,
        mission_completed: true,
        xp_earned: xp,
        duration_seconds: Math.floor((Date.now() - startTs.current) / 1000),
      });
      const { child: fresh } = await api.getChild(child.id);
      await saveChild(fresh);
      setChild(fresh);

      const newLevel = fresh.level_info?.level ?? prevLevel;
      if (newLevel > prevLevel) {
        setTimeout(
          () =>
            setLevelUp({
              level: newLevel,
              title: fresh.level_info?.title || 'New Level!',
              emoji: fresh.level_info?.emoji || '🌟',
            }),
          600,
        );
      }
    } catch (e) {
      // still show XP burst locally even if logging failed
    }
  };

  const burstAnim = useAnimatedStyle(() => ({
    opacity: burstOp.value,
    transform: [{ translateY: burstY.value }, { scale: burstScale.value }],
  }));

  if (!child) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[portal.color + '30', 'transparent']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Sticky Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace('/home')}
          testID="portal-back"
          style={styles.backBtn}
          hitSlop={12}
        >
          <Text style={styles.backText}>← Home</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {portal.emoji} {portal.name}
          </Text>
        </View>
        {awardedXp > 0 ? (
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{awardedXp} XP</Text>
          </View>
        ) : (
          <View style={styles.xpBadgePlaceholder} />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Leo (floating) — tap to replay voice */}
        <View style={styles.leoWrap}>
          <LeoFace
            size={110}
            emotion={speaking ? 'excited' : emotion}
            bob={!speaking}
            onTap={() => {
              const last = [...turns].reverse().find((t) => t.role === 'assistant');
              if (last) playLeoSpeech(last.content);
            }}
            testID="portal-leo"
          />
          {speaking && (
            <View style={styles.speakingBadge} testID="portal-leo-speaking">
              <Text style={styles.speakingBadgeText}>🔊 Leo is talking…</Text>
            </View>
          )}
          {showBurst && (
            <Animated.View style={[styles.burst, burstAnim]} pointerEvents="none">
              <Text style={styles.burstText}>+{portal.xp} XP!</Text>
              <Text style={styles.burstEmoji}>⭐️✨</Text>
            </Animated.View>
          )}
        </View>

        {/* Chat */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chat}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {turns.map((t, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                t.role === 'user' ? styles.userBubble : styles.leoBubble,
              ]}
            >
              <Text style={t.role === 'user' ? styles.userText : styles.leoText}>{t.content}</Text>
            </View>
          ))}
          {busy && (
            <View style={[styles.bubble, styles.leoBubble, styles.typingBubble]}>
              <ActivityIndicator color={portal.color} />
              <Text style={styles.typing}>Leo is thinking…</Text>
            </View>
          )}

          {/* Portal-specific primer on first turn */}
          {turns.length <= 1 && portal.id === 'question' && (
            <View style={styles.promptsWrap}>
              <Text style={styles.promptsLabel}>Try one of these!</Text>
              <View style={styles.promptsRow}>
                {portal.prompts.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => send(p)}
                    style={[styles.chip, { borderColor: portal.color }]}
                    testID={`prompt-${p.slice(0, 12)}`}
                  >
                    <Text style={styles.chipText}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {turns.length <= 1 && portal.id === 'toystory' && (
            <ToyPrimer
              onPick={(toy) =>
                send(
                  `My toy is a ${toy}! Tell me an EPIC crossover story just about my ${toy}, and give me a build-a-scene mission using pillows or books!`,
                )
              }
            />
          )}
          {turns.length <= 1 && portal.id === 'glitch' && (
            <GlitchPrimer
              onSubmit={(combo) =>
                send(
                  `GLITCH MONSTER!! Reality is breaking!! Impossible combo: "${combo}" — PANIC and give me a specific counting/math mission to save reality!`,
                )
              }
            />
          )}

          {/* Mission action */}
          {missionState === 'awaiting' && (
            <Pressable
              onPress={missionDone}
              style={styles.missionBtn}
              testID="mission-done"
            >
              <LinearGradient
                colors={[colors.green, '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.missionGrad}
              >
                <Text style={styles.missionText}>
                  {portal.id === 'toystory'
                    ? '🏗️ I built the scene!'
                    : portal.id === 'glitch'
                      ? '🛡️ REALITY SAVED!'
                      : '✅ I did the mission!'}
                </Text>
                <Text style={styles.missionSub}>Earn +{portal.xp} XP</Text>
              </LinearGradient>
            </Pressable>
          )}
          {missionState === 'done' && (
            <View style={styles.doneCard}>
              <Text style={styles.doneEmoji}>
                {portal.id === 'toystory' ? '🎬' : portal.id === 'glitch' ? '🌟' : '🎉'}
              </Text>
              <Text style={styles.doneText}>
                {portal.id === 'toystory'
                  ? 'WOW! Your toy is a superstar!'
                  : portal.id === 'glitch'
                    ? 'REALITY SAVED! You are a GENIUS!'
                    : 'Amazing! Leo is so proud of you!'}
              </Text>
              <Text style={styles.doneSub}>
                {portal.id === 'glitch'
                  ? 'Try another impossible combo?'
                  : 'Ask another question or head home.'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputWrap}>
          <MicButton
            color={portal.color}
            bhasha={child.bhasha}
            disabled={busy}
            onTranscript={(text, autoSend) => {
              if (autoSend) send(text);
              else setInput(text);
            }}
            testID="portal-mic"
          />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={
              portal.id === 'toystory'
                ? `Tell Leo about your toy…`
                : portal.id === 'glitch'
                  ? `More impossible combos…`
                  : `Ask Leo, ${child.child_name}…`
            }
            placeholderTextColor={colors.onSurfaceFaint}
            style={styles.input}
            testID="portal-input"
            returnKeyType="send"
            onSubmitEditing={() => send()}
            editable={!busy}
          />
          <Pressable
            onPress={() => send()}
            disabled={busy || !input.trim()}
            style={({ pressed }) => [
              styles.sendBtnWrap,
              { opacity: busy || !input.trim() ? 0.5 : pressed ? 0.85 : 1 },
            ]}
            testID="portal-send"
          >
            <LinearGradient
              colors={[portal.color, colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <Text style={styles.sendText}>
                {portal.id === 'glitch' ? 'ZAP!' : portal.id === 'toystory' ? 'Go!' : 'Ask'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <LevelUpModal
        visible={!!levelUp}
        level={levelUp?.level ?? 1}
        levelTitle={levelUp?.title ?? ''}
        levelEmoji={levelUp?.emoji ?? '🌟'}
        onClose={() => setLevelUp(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loader: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 70 },
  backText: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 14 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: colors.onSurface, fontFamily: font.display, fontSize: 18 },
  xpBadge: {
    backgroundColor: 'rgba(251,146,60,0.15)',
    borderColor: colors.brand,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 70,
    alignItems: 'center',
  },
  xpBadgePlaceholder: { width: 70 },
  xpBadgeText: { color: colors.brand, fontFamily: font.bodyBold, fontSize: 12 },
  leoWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  speakingBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: 'rgba(251,146,60,0.18)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.5)',
  },
  speakingBadgeText: { color: colors.brand, fontFamily: font.bodyBold, fontSize: 12 },
  burst: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
  },
  burstText: {
    color: colors.brand,
    fontFamily: font.display,
    fontSize: 34,
    textShadowColor: 'rgba(251,146,60,0.6)',
    textShadowRadius: 8,
  },
  burstEmoji: { fontSize: 22, marginTop: 2 },
  chat: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '90%',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  leoBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(251,146,60,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.4)',
    borderTopRightRadius: 4,
  },
  leoText: { color: colors.onSurface, fontFamily: font.body, fontSize: 15, lineHeight: 22 },
  userText: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 15, lineHeight: 22 },
  typingBubble: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  typing: { color: colors.onSurfaceMuted, fontFamily: font.body, fontSize: 13 },
  promptsWrap: { marginTop: spacing.md },
  promptsLabel: { color: colors.onSurfaceMuted, fontFamily: font.bodyBold, fontSize: 12, marginBottom: spacing.sm },
  promptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  chipText: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 12 },
  missionBtn: { marginTop: spacing.md, borderRadius: radius.md, overflow: 'hidden' },
  missionGrad: { alignItems: 'center', padding: spacing.lg },
  missionText: { color: '#fff', fontFamily: font.bodyBold, fontSize: 17 },
  missionSub: { color: 'rgba(255,255,255,0.85)', fontFamily: font.body, fontSize: 12, marginTop: 2 },
  doneCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: 'rgba(16,185,129,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    alignItems: 'center',
  },
  doneEmoji: { fontSize: 34 },
  doneText: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 15, marginTop: spacing.sm },
  doneSub: { color: colors.onSurfaceMuted, fontFamily: font.body, fontSize: 12, marginTop: 2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.onSurface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontFamily: font.body,
    fontSize: 15,
  },
  sendBtnWrap: { borderRadius: radius.pill, overflow: 'hidden' },
  sendBtn: { paddingHorizontal: spacing.lg, paddingVertical: 12 },
  sendText: { color: '#fff', fontFamily: font.bodyBold, fontSize: 14 },
});
