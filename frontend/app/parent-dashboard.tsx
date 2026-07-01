import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';

import { api } from '@/src/lib/api';
import { getChild } from '@/src/lib/session';
import { colors, font, radius, spacing } from '@/src/theme';

const EMOTION_META: Record<string, { color: string; emoji: string }> = {
  happy: { color: '#FCD34D', emoji: '😄' },
  angry: { color: colors.danger, emoji: '😠' },
  scared: { color: '#3B82F6', emoji: '😨' },
  sad: { color: '#6366F1', emoji: '😢' },
  excited: { color: colors.brand, emoji: '🤩' },
  confused: { color: colors.purple, emoji: '😕' },
  proud: { color: colors.green, emoji: '😤' },
  tired: { color: '#6B7280', emoji: '😴' },
};

const SEVERITY_META: Record<string, { color: string; emoji: string }> = {
  routine: { color: '#3B82F6', emoji: '🔵' },
  mild: { color: '#F59E0B', emoji: '🟡' },
  urgent: { color: colors.danger, emoji: '🔴' },
};

const SKILLS: { label: string; portals: string[] }[] = [
  { label: 'Curiosity', portals: ['question'] },
  { label: 'Creativity', portals: ['toystory', 'sound'] },
  { label: 'Logic', portals: ['glitch', 'pattern'] },
  { label: 'Literacy', portals: ['word'] },
  { label: 'English', portals: ['bolega'] },
  { label: 'Values', portals: ['shloka'] },
  { label: 'Fitness', portals: ['body'] },
  { label: 'Emotional IQ', portals: ['feeling'] },
];

function formatTime(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatAlertType(type?: string): string {
  return (type || 'alert')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildLast7Days(moods: any[]): { date: string; label: string; emotion?: string }[] {
  const days: { date: string; label: string; emotion?: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const entry = moods.find((m) => m.logged_date === dateStr);
    days.push({
      date: dateStr,
      label,
      emotion: entry?.emotion ? String(entry.emotion).toLowerCase() : undefined,
    });
  }
  return days;
}

function computeSkills(sessions: any[]): { label: string; count: number; progress: number }[] {
  return SKILLS.map((skill) => {
    const count = sessions.filter((s) => skill.portals.includes(s.portal_id)).length;
    return { label: skill.label, count, progress: Math.min(100, count * 20) };
  });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

type LockState = 'checking' | 'locked' | 'unlocked' | 'unavailable';

export default function ParentDashboard() {
  const router = useRouter();
  const [lockState, setLockState] = useState<LockState>('checking');
  const [authError, setAuthError] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [child, setChild] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [portalMeta, setPortalMeta] = useState<Record<string, { name: string; emoji: string; color: string }>>({});
  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());

  const tryUnlock = async () => {
    setAuthError('');
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      if (!hasHardware || !isEnrolled) {
        // No biometric enrolled on this device — can't gate access, so let the parent through.
        setLockState('unavailable');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Parent Dashboard',
        cancelLabel: 'Cancel',
      });
      setLockState(result.success ? 'unlocked' : 'locked');
      if (!result.success) setAuthError('Verification failed or was cancelled.');
    } catch {
      setLockState('unavailable');
    }
  };

  useEffect(() => {
    tryUnlock();
  }, []);

  const load = async () => {
    const local = await getChild();
    if (!local) {
      router.replace('/login');
      return;
    }
    try {
      const [dash, meta] = await Promise.all([api.getDashboard(local.id), api.getPortalsMeta()]);
      setChild(dash.child);
      setSessions(dash.sessions || []);
      setMoods(dash.moods || []);
      setAlerts(dash.alerts || []);
      setVerifications(dash.verifications || []);
      setBadges(dash.badges || []);
      const map: Record<string, { name: string; emoji: string; color: string }> = {};
      (meta.portals || []).forEach((p: any) => {
        map[p.id] = { name: p.name, emoji: p.emoji, color: p.color };
      });
      setPortalMeta(map);
    } catch {
      // keep whatever local data we already have
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (lockState === 'unlocked' || lockState === 'unavailable') {
      load();
    }
  }, [lockState]);

  const handleVerify = async (v: any) => {
    setVerifyingIds((s) => new Set(s).add(v.id));
    try {
      await api.verifyMission(v.id, true);
      setVerifications((list) => list.filter((x) => x.id !== v.id));
      if (child) {
        const dash = await api.getDashboard(child.id);
        setChild(dash.child);
        setBadges(dash.badges || []);
      }
    } catch {
      // leave it in the inbox so the parent can retry
    } finally {
      setVerifyingIds((s) => {
        const next = new Set(s);
        next.delete(v.id);
        return next;
      });
    }
  };

  if (lockState === 'checking') {
    return (
      <View style={styles.loader} testID="dashboard-loader">
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  if (lockState === 'locked') {
    return (
      <SafeAreaView style={styles.safe} testID="dashboard-locked">
        <View style={styles.lockWrap}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text style={styles.lockTitle}>Parent Dashboard Locked</Text>
          <Text style={styles.lockSub}>Verify it's you with Face ID / fingerprint to continue.</Text>
          {!!authError && <Text style={styles.lockError}>{authError}</Text>}
          <Pressable onPress={tryUnlock} testID="dashboard-unlock" style={styles.unlockBtnWrap}>
            <LinearGradient
              colors={[colors.brand, colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.unlockBtn}
            >
              <Text style={styles.unlockText}>Try Again</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => router.replace('/home')} testID="dashboard-lock-back">
            <Text style={styles.backLinkText}>← Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader} testID="dashboard-loader">
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => (s.created_at || '').slice(0, 10) === todayStr);
  const last7Days = buildLast7Days(moods);
  const skills = computeSkills(sessions);

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="parent-dashboard">
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.replace('/home')}
          testID="dashboard-back"
          style={styles.backBtn}
          hitSlop={12}
        >
          <Text style={styles.backText}>← Home</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.brand}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {child?.child_name ?? 'Your Child'}'s Learning Universe
          </Text>
          <View style={styles.headerStats}>
            <View style={styles.statChip}>
              <Text style={styles.statText}>
                {child?.level_info?.emoji ?? '🐣'} Level {child?.level_info?.level ?? 1}
              </Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statText}>🔥 Day {child?.streak_days ?? 1}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statText}>⭐ {child?.xp ?? 0} XP</Text>
            </View>
          </View>
        </View>

        <Section title="📋 Today's Activity">
          {todaySessions.length === 0 ? (
            <Text style={styles.emptyText}>No activity yet today — go play a portal!</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {todaySessions.map((s) => {
                const meta = portalMeta[s.portal_id];
                return (
                  <View key={s.id} style={styles.row}>
                    <Text style={styles.rowEmoji}>{meta?.emoji ?? '🎮'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{meta?.name ?? s.portal_id}</Text>
                      <Text style={styles.rowSub}>{formatTime(s.created_at)}</Text>
                    </View>
                    <Text style={styles.rowMission}>{s.mission_completed ? '✅' : '❌'}</Text>
                    {s.xp_earned > 0 && (
                      <View style={styles.xpPill}>
                        <Text style={styles.xpPillText}>+{s.xp_earned} XP</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </Section>

        <Section title="🗓️ Weekly Mood Heatmap">
          <View style={styles.heatRow}>
            {last7Days.map((day) => {
              const meta = day.emotion ? EMOTION_META[day.emotion] : null;
              return (
                <View key={day.date} style={styles.heatCell}>
                  <Text style={styles.heatDay}>{day.label}</Text>
                  <View
                    style={[
                      styles.heatSwatch,
                      {
                        backgroundColor: meta ? meta.color + '33' : colors.surfaceTertiary,
                        borderColor: meta ? meta.color : colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.heatEmoji}>{meta?.emoji ?? '—'}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Section>

        <Section title="🧭 Skills Radar">
          <View style={{ gap: spacing.md }}>
            {skills.map((s) => (
              <View key={s.label}>
                <View style={styles.skillLabelRow}>
                  <Text style={styles.skillLabel}>{s.label}</Text>
                  <Text style={styles.skillCount}>
                    {s.count} session{s.count === 1 ? '' : 's'}
                  </Text>
                </View>
                <View style={styles.skillTrack}>
                  <View
                    style={[
                      styles.skillFill,
                      { width: `${s.count > 0 ? Math.max(s.progress, 6) : 0}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section title="✅ Mission Verification Inbox">
          {verifications.length === 0 ? (
            <Text style={styles.emptyText}>No missions waiting for your ✅!</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {verifications.map((v) => {
                const meta = portalMeta[v.portal_id];
                const busy = verifyingIds.has(v.id);
                return (
                  <View key={v.id} style={styles.row}>
                    <Text style={styles.rowEmoji}>{meta?.emoji ?? '🎯'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>
                        {v.mission_text || v.description || meta?.name || 'Mission pending'}
                      </Text>
                      {!!v.xp_reward && <Text style={styles.rowSub}>+{v.xp_reward} XP reward</Text>}
                    </View>
                    <Pressable
                      onPress={() => handleVerify(v)}
                      disabled={busy}
                      style={[styles.verifyBtn, busy && { opacity: 0.5 }]}
                      testID={`verify-${v.id}`}
                    >
                      {busy ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.verifyBtnText}>✅</Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </Section>

        <Section title="🏅 Badge Wall">
          {badges.length === 0 ? (
            <Text style={styles.emptyText}>No badges earned yet — keep playing!</Text>
          ) : (
            <View style={styles.badgeGrid}>
              {badges.map((b) => (
                <View key={b.id} style={styles.badgeCell}>
                  <Text style={styles.badgeEmoji}>{b.emoji || b.icon || '🏅'}</Text>
                  <Text style={styles.badgeName} numberOfLines={2}>
                    {b.name || b.title || 'Badge'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Section>

        <Section title="🛡️ Safety Alerts">
          {alerts.length === 0 ? (
            <Text style={styles.emptyText}>No safety alerts. All clear! 🎉</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {alerts.map((a) => {
                const sev = SEVERITY_META[a.severity] ?? SEVERITY_META.routine;
                return (
                  <View key={a.id} style={[styles.row, { borderColor: sev.color }]}>
                    <Text style={styles.rowEmoji}>{sev.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{formatAlertType(a.alert_type)}</Text>
                      {!!a.content && (
                        <Text style={styles.rowSub} numberOfLines={2}>
                          {a.content}
                        </Text>
                      )}
                      <Text style={styles.rowTime}>{formatTime(a.created_at)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loader: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 90 },
  backText: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 14 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl2, gap: spacing.lg },
  header: { marginBottom: spacing.xs },
  title: { color: colors.onSurface, fontFamily: font.display, fontSize: 24, marginBottom: spacing.sm },
  headerStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statChip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  statText: { color: colors.brand, fontFamily: font.bodyBold, fontSize: 13 },

  section: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontFamily: font.display,
    fontSize: 17,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.onSurfaceFaint,
    fontFamily: font.body,
    fontSize: 13,
    fontStyle: 'italic',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowEmoji: { fontSize: 22 },
  rowTitle: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 14 },
  rowSub: { color: colors.onSurfaceMuted, fontFamily: font.body, fontSize: 12, marginTop: 2 },
  rowTime: { color: colors.onSurfaceFaint, fontFamily: font.body, fontSize: 11, marginTop: 2 },
  rowMission: { fontSize: 18, marginRight: spacing.xs },
  xpPill: {
    backgroundColor: 'rgba(251,146,60,0.15)',
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  xpPillText: { color: colors.brand, fontFamily: font.bodyBold, fontSize: 11 },

  heatRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heatCell: { alignItems: 'center', gap: spacing.xs },
  heatDay: { color: colors.onSurfaceMuted, fontFamily: font.bodyBold, fontSize: 11 },
  heatSwatch: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatEmoji: { fontSize: 16 },

  skillLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  skillLabel: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 13 },
  skillCount: { color: colors.onSurfaceFaint, fontFamily: font.body, fontSize: 11 },
  skillTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.xpTrack,
    overflow: 'hidden',
  },
  skillFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.brand },

  verifyBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnText: { fontSize: 18 },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badgeCell: {
    width: 84,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeEmoji: { fontSize: 30 },
  badgeName: {
    color: colors.onSurface,
    fontFamily: font.bodyBold,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  lockWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  lockEmoji: { fontSize: 56 },
  lockTitle: { color: colors.onSurface, fontFamily: font.display, fontSize: 22, marginTop: spacing.sm },
  lockSub: {
    color: colors.onSurfaceMuted,
    fontFamily: font.body,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  lockError: { color: colors.danger, fontFamily: font.body, fontSize: 12, marginTop: spacing.sm },
  unlockBtnWrap: { marginTop: spacing.lg, borderRadius: radius.pill, overflow: 'hidden' },
  unlockBtn: { paddingHorizontal: spacing.xl2, paddingVertical: spacing.md },
  unlockText: { color: '#fff', fontFamily: font.bodyBold, fontSize: 15 },
  backLinkText: {
    color: colors.onSurfaceMuted,
    fontFamily: font.bodyBold,
    fontSize: 13,
    marginTop: spacing.lg,
  },
});
