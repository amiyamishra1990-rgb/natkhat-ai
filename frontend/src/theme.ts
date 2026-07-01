// Natkhat AI — Theme tokens
export const colors = {
  surface: '#08080F',
  surfaceSecondary: '#12121C',
  surfaceTertiary: '#1A1A24',
  onSurface: '#FFFFFF',
  onSurfaceMuted: 'rgba(255,255,255,0.6)',
  onSurfaceFaint: 'rgba(255,255,255,0.4)',
  brand: '#FB923C', // orange
  purple: '#A78BFA',
  pink: '#EC4899',
  green: '#10B981',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  rose: '#F43F5E',
  danger: '#EF4444',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.15)',
  xpTrack: 'rgba(255,255,255,0.1)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xl2: 32, xl3: 48 };
export const radius = { sm: 6, md: 14, lg: 20, pill: 999 };

export const font = {
  display: 'FredokaOne_400Regular',
  displayFallback: 'System',
  body: 'Nunito_400Regular',
  bodyBold: 'Nunito_700Bold',
  bodyFallback: 'System',
};

// Leo emotion palette
export const leoEmotions = {
  happy: { bg: '#FCD34D', ring: '#F59E0B', emoji: '😄', spark: '✨' },
  thinking: { bg: '#A78BFA', ring: '#7C3AED', emoji: '🤔', spark: '💭' },
  excited: { bg: '#FB923C', ring: '#EA580C', emoji: '🤩', spark: '⭐' },
  proud: { bg: '#10B981', ring: '#059669', emoji: '😤', spark: '💪' },
  dramatic: { bg: '#EC4899', ring: '#DB2777', emoji: '😱', spark: '⚡' },
} as const;

export type LeoEmotion = keyof typeof leoEmotions;
