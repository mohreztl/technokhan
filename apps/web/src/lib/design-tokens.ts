/** Public, serializable source for the TechnoKhan visual language showcase. */
export const TECHNO_TOKENS = {
  colors: {
    light: {
      background: '#F2F3EF',
      surface: '#FCFCF8',
      foreground: '#111315',
      muted: '#61676B',
      border: '#D8DCD5',
      accent: '#709800',
      deal: '#FF6846',
    },
    dark: {
      background: '#090B0C',
      surface: '#111516',
      elevated: '#181D1E',
      foreground: '#F3F5EE',
      border: '#293031',
      accent: '#C8F45A',
      metal: '#AEB6B8',
    },
    semantic: {
      inStock: '#35C98B',
      lowStock: '#E5A93D',
      error: '#E65757',
    },
  },
  typography: {
    family: 'Vazirmatn',
    numericVariant: 'tabular-nums',
  },
  radii: { control: 12, card: 20, showcase: 28 },
  motion: { controlMs: 180, overlayMs: 240, showcaseMs: 500 },
} as const;

export type TechnoTokens = typeof TECHNO_TOKENS;
