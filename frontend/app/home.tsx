import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LeoFace from '@/src/components/LeoFace';
import PaymentSheet from '@/src/components/PaymentSheet';
import PortalCard, { Portal } from '@/src/components/PortalCard';
import XPBar from '@/src/components/XPBar';
import { api } from '@/src/lib/api';
import { getChild, saveChild } from '@/src/lib/session';
import { colors, font, spacing } from '@/src/theme';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function Home() {
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payFor, setPayFor] = useState<Portal | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  const load = async () => {
    const local = await getChild();
    if (!local) {
      router.replace('/login');
      return;
    }
    try {
      const [{ portals: p }, { child: c }] = await Promise.all([
        api.getPortalsMeta(),
        api.getChild(local.id),
      ]);
      setPortals(p as Portal[]);
      setChild(c);
      await saveChild(c);
    } catch {
      setChild(local);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unlocked: string[] = child?.unlocked_portals || ['question', 'toystory', 'glitch'];

  const openPortal = (portal: Portal) => {
    if (unlocked.includes(portal.id)) {
      router.push({ pathname: '/portal/[id]', params: { id: portal.id } });
    } else {
      setPayFor(portal);
    }
  };

  const purchase = async (plan: 'portal_70' | 'all_399' | 'sixmonth_1999') => {
    if (!child || !payFor) return;
    try {
      setPayLoading(true);
      const order = await fetch(`${BASE}/api/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: child.id, plan, portal_id: payFor.id }),
      }).then((r) => r.json());
      await fetch(`${BASE}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: child.id,
          order_id: order.order_id,
          payment_id: 'pay_stub_' + Date.now(),
          signature: 'stub',
          plan,
          portal_id: payFor.id,
        }),
      }).then((r) => r.json());
      const { child: fresh } = await api.getChild(child.id);
      await saveChild(fresh);
      setChild(fresh);
      setPayFor(null);
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader} testID="home-loader">
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  const pairs: Portal[][] = [];
  for (let i = 0; i < portals.length; i += 2) pairs.push(portals.slice(i, i + 2));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header} testID="home-header">
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hi} numberOfLines={1}>
              Hi, {child?.child_name} 🦁
            </Text>
            <Text style={styles.sub}>
              🔥 {child?.streak_days ?? 1} day streak · {child?.bhasha ?? 'Hindi'}
            </Text>
          </View>
          <LeoFace size={54} emotion="happy" bob={false} />
        </View>
        <XPBar xp={child?.xp ?? 0} levelInfo={child?.level_info} />
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Portals</Text>
          <Text style={styles.sectionHint}>Tap to play with Leo!</Text>
        </View>

        {pairs.map((row, idx) => (
          <View style={styles.row} key={idx}>
            {row.map((portal) => (
              <PortalCard
                key={portal.id}
                portal={portal}
                unlocked={unlocked.includes(portal.id)}
                onPress={() => openPortal(portal)}
              />
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Screen time? Nahi beta — Room time!</Text>
        </View>
      </ScrollView>

      <PaymentSheet
        visible={!!payFor}
        portalName={payFor?.name}
        loading={payLoading}
        onClose={() => setPayFor(null)}
        onSelect={purchase}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loader: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  hi: {
    color: colors.onSurface,
    fontFamily: font.display,
    fontSize: 24,
  },
  sub: {
    color: colors.onSurfaceMuted,
    fontFamily: font.body,
    fontSize: 12,
    marginTop: 2,
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl2 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.onSurface, fontFamily: font.display, fontSize: 22 },
  sectionHint: { color: colors.onSurfaceFaint, fontFamily: font.body, fontSize: 12 },
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
  footerText: {
    color: colors.onSurfaceMuted,
    fontFamily: font.body,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
