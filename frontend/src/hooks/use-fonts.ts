import { useFonts } from 'expo-font';

// Load Fredoka One (display) and Nunito (body) directly from Google Fonts CDN
// so we don't depend on @expo-google-fonts packages.
export function useAppFonts() {
  return useFonts({
    FredokaOne_400Regular:
      'https://fonts.gstatic.com/s/fredokaone/v14/k3kUo8kEI-tA1RRcTZGmTlHGCaen8wc.ttf',
    Nunito_400Regular:
      'https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKofINeaBTMnFcQ.ttf',
    Nunito_700Bold:
      'https://fonts.gstatic.com/s/nunito/v26/XRXW3I6Li01BKofA6sKUYevN.ttf',
  });
}
