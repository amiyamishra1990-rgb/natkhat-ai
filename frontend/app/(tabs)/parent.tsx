import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/src/theme';

// Reached only if the tab-press interception in (tabs)/_layout.tsx doesn't fire
// (e.g. a direct link to /parent). Bounce straight to the locked dashboard.
export default function ParentTabFallback() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/parent-dashboard');
  }, []);

  return (
    <View style={styles.wrap} testID="parent-tab-fallback">
      <ActivityIndicator color={colors.brand} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
