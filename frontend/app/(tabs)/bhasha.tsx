import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/src/lib/api';
import { getChild } from '@/src/lib/session';
import { colors, font, radius, spacing } from '@/src/theme';

export default function Bhasha() {
  const [child, setChild] = useState<any>(null);
  const [bhashas, setBhashas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const local = await getChild();
      setChild(local);
      try {
        const meta = await api.getPortalsMeta();
        setBhashas(meta.bhashas || []);
      } catch {
        // list is informational only — fine to leave empty if the fetch fails
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader} testID="bhasha-loader">
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  const current = bhashas.find(
    (b) => (b.code || '').toLowerCase() === (child?.bhasha || '').toLowerCase(),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']} testID="bhasha-screen">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Bhasha 🗣️</Text>
        <Text style={styles.subtitle}>{child?.child_name ?? 'Your child'}'s home language</Text>

        <View style={styles.currentCard}>
          <Text style={styles.currentLabel}>{current?.label ?? child?.bhasha ?? 'Hindi'}</Text>
          <Text style={styles.currentSub}>
            Leo calls {child?.child_name ?? 'your child'} "{current?.endearment ?? 'beta'}" in every
            chat.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>All supported languages</Text>
        <View style={{ gap: spacing.sm }}>
          {bhashas.map((b) => (
            <View key={b.code} style={[styles.row, b.code === current?.code && styles.rowActive]}>
              <Text style={styles.rowLabel}>{b.label}</Text>
              <Text style={styles.rowSub}>{b.code}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loader: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl2 },
  title: { color: colors.onSurface, fontFamily: font.display, fontSize: 24 },
  subtitle: {
    color: colors.onSurfaceMuted,
    fontFamily: font.body,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  currentCard: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  currentLabel: { color: colors.brand, fontFamily: font.display, fontSize: 22 },
  currentSub: { color: colors.onSurfaceMuted, fontFamily: font.body, fontSize: 13, marginTop: spacing.xs },
  sectionTitle: {
    color: colors.onSurface,
    fontFamily: font.bodyBold,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowActive: { borderColor: colors.brand },
  rowLabel: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 14 },
  rowSub: { color: colors.onSurfaceFaint, fontFamily: font.body, fontSize: 12 },
});
