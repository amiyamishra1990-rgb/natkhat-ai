import { Tabs, useRouter } from 'expo-router';
import { Text } from 'react-native';

import { colors, font } from '@/src/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.onSurfaceFaint,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontFamily: font.bodyBold, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="portals"
        options={{
          title: 'Portals',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎮" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bhasha"
        options={{
          title: 'Bhasha',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗣️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="parent"
        options={{
          title: 'Parent',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👨‍👩‍👧" focused={focused} />,
        }}
        listeners={{
          tabPress: (e) => {
            // The Parent tab is a launcher, not tab content — it always opens the
            // biometric-locked dashboard as a full-screen push, never as tab content.
            e.preventDefault();
            router.push('/parent-dashboard');
          },
        }}
      />
    </Tabs>
  );
}
