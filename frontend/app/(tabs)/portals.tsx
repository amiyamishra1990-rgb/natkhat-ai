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

import PaymentSheet from '@/src/components/PaymentSheet';
import PortalCard, { Portal } from '@/src/components/PortalCard';
import { api } from '@/src/lib/api';
import { getChild, saveChild } from '@/src/lib/session';
import { colors, font, spacing } from '@/src/theme';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function Portals() {
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
      <View style={styles.loader} testID="portals-loader">
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  const pairs: Portal[][] = [];
  for (let i = 0; i < portals.length; i += 2) pairs.push(portals.slice(i, i + 2));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header} testID="portals-header">
        <Text style={styles.title}>All Portals 🎮</Text>
        <Text style={styles.subtitle}>Pick one to play with Leo!</Text>
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
  loader: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { color: colors.onSurface, fontFamily: font.display, fontSize: 24 },
  subtitle: { color: colors.onSurfaceMuted, fontFamily: font.body, fontSize: 12, marginTop: 2 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl2 },
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
});
