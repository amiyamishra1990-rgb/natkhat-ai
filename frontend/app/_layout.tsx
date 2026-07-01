import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIconFonts } from '@/src/hooks/use-icon-fonts';
import { useAppFonts } from '@/src/hooks/use-fonts';

LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until icon fonts register.
// Required because @expo/vector-icons' componentDidMount fallback fires
// Font.loadAsync against a broken vendor path if any <Icon> mounts before
// the family is registered — which throws on Android Expo Go.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [iconsLoaded, iconsError] = useIconFonts();
  const [appFontsLoaded, appFontsError] = useAppFonts();

  const ready = (iconsLoaded || iconsError) && (appFontsLoaded || appFontsError);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#08080F' }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#08080F" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#08080F' },
            animation: 'fade',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
