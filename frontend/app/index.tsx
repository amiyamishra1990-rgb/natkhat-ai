import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/src/theme';
import { getChild, getParent } from '@/src/lib/session';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const parent = await getParent();
      const child = await getChild();
      if (!parent) {
        router.replace('/splash');
      } else if (!child) {
        router.replace('/child-profile');
      } else if (!child.has_seen_intro) {
        router.replace('/leo-intro');
      } else {
        router.replace('/home');
      }
    })();
  }, []);

  return (
    <View style={styles.wrap} testID="index-loader">
      <ActivityIndicator color={colors.brand} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
