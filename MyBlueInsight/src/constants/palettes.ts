export type MoodKey =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'lightBlue'
  | 'darkBlue'
  | 'purple'
  | 'pink'
  | 'gray'
  | 'black'
  | 'gold'
  | 'teal';

export interface PaletteMoodColor {
  key: MoodKey;
  hex: string;
  name: string;
}

export interface Palette {
  id: string;
  displayName: string;
  displayNameZh: string;
  description: string;
  colors: PaletteMoodColor[];
}

export const PALETTES: Palette[] = [
  {
    id: 'classic',
    displayName: 'Classic',
    displayNameZh: '经典',
    description: 'Original iOS-inspired colors',
    colors: [
      { key: 'red', hex: '#FF3B30', name: 'Angry / Frustrated' },
      { key: 'orange', hex: '#FF9500', name: 'Anxious / Stressed' },
      { key: 'yellow', hex: '#FFCC00', name: 'Happy / Cheerful' },
      { key: 'green', hex: '#34C759', name: 'Energetic / Motivated' },
      { key: 'lightBlue', hex: '#5AC8FA', name: 'Calm / Peaceful' },
      { key: 'darkBlue', hex: '#007AFF', name: 'Sad / Blue' },
      { key: 'purple', hex: '#AF52DE', name: 'Creative / Inspired' },
      { key: 'pink', hex: '#FF6B9D', name: 'Loving / Grateful' },
      { key: 'gray', hex: '#C2B8A3', name: 'Neutral / Indifferent' },
      { key: 'black', hex: '#1C1C1E', name: 'Exhausted / Drained' },
      { key: 'gold', hex: '#DAA520', name: 'Accomplished / Proud' },
      { key: 'teal', hex: '#2AAFAF', name: 'Relaxed / Leisure' },
    ],
  },
  {
    id: 'macaron',
    displayName: 'Macaron',
    displayNameZh: '马卡龙',
    description: 'Soft pastel sweetness',
    colors: [
      { key: 'red', hex: '#F8A5A5', name: 'Angry / Frustrated' },
      { key: 'orange', hex: '#FDCB82', name: 'Anxious / Stressed' },
      { key: 'yellow', hex: '#FFF1A8', name: 'Happy / Cheerful' },
      { key: 'green', hex: '#B8E6C8', name: 'Energetic / Motivated' },
      { key: 'lightBlue', hex: '#A8D8EA', name: 'Calm / Peaceful' },
      { key: 'darkBlue', hex: '#9BB8D3', name: 'Sad / Blue' },
      { key: 'purple', hex: '#D4B8E0', name: 'Creative / Inspired' },
      { key: 'pink', hex: '#F5C2D0', name: 'Loving / Grateful' },
      { key: 'gray', hex: '#D9CEBD', name: 'Neutral / Indifferent' },
      { key: 'black', hex: '#A6A6B0', name: 'Exhausted / Drained' },
      { key: 'gold', hex: '#E8C97A', name: 'Accomplished / Proud' },
      { key: 'teal', hex: '#8DD4C8', name: 'Relaxed / Leisure' },
    ],
  },
  {
    id: 'morandi',
    displayName: 'Morandi',
    displayNameZh: '莫兰迪',
    description: 'Muted, desaturated earthy tones',
    colors: [
      { key: 'red', hex: '#C4837A', name: 'Angry / Frustrated' },
      { key: 'orange', hex: '#C9A87C', name: 'Anxious / Stressed' },
      { key: 'yellow', hex: '#D6C9A0', name: 'Happy / Cheerful' },
      { key: 'green', hex: '#9BB09E', name: 'Energetic / Motivated' },
      { key: 'lightBlue', hex: '#95AAB5', name: 'Calm / Peaceful' },
      { key: 'darkBlue', hex: '#7A8FA0', name: 'Sad / Blue' },
      { key: 'purple', hex: '#A896A5', name: 'Creative / Inspired' },
      { key: 'pink', hex: '#C9A5A0', name: 'Loving / Grateful' },
      { key: 'gray', hex: '#C5B9A8', name: 'Neutral / Indifferent' },
      { key: 'black', hex: '#6B6560', name: 'Exhausted / Drained' },
      { key: 'gold', hex: '#B8A070', name: 'Accomplished / Proud' },
      { key: 'teal', hex: '#8AADA5', name: 'Relaxed / Leisure' },
    ],
  },
  {
    id: 'monet',
    displayName: 'Monet',
    displayNameZh: '莫奈',
    description: 'Impressionist watercolor tones',
    colors: [
      { key: 'red', hex: '#D98B8B', name: 'Angry / Frustrated' },
      { key: 'orange', hex: '#DEB887', name: 'Anxious / Stressed' },
      { key: 'yellow', hex: '#E8D590', name: 'Happy / Cheerful' },
      { key: 'green', hex: '#7EB89E', name: 'Energetic / Motivated' },
      { key: 'lightBlue', hex: '#87CEEB', name: 'Calm / Peaceful' },
      { key: 'darkBlue', hex: '#6B8DAE', name: 'Sad / Blue' },
      { key: 'purple', hex: '#9C88B8', name: 'Creative / Inspired' },
      { key: 'pink', hex: '#D4A0B0', name: 'Loving / Grateful' },
      { key: 'gray', hex: '#C4BAA8', name: 'Neutral / Indifferent' },
      { key: 'black', hex: '#4A5568', name: 'Exhausted / Drained' },
      { key: 'gold', hex: '#C4A66A', name: 'Accomplished / Proud' },
      { key: 'teal', hex: '#7EC8B8', name: 'Relaxed / Leisure' },
    ],
  },
  {
    id: 'gauguin',
    displayName: 'Gauguin',
    displayNameZh: '高更',
    description: 'Bold tropical warmth',
    colors: [
      { key: 'red', hex: '#D94032', name: 'Angry / Frustrated' },
      { key: 'orange', hex: '#E88C3A', name: 'Anxious / Stressed' },
      { key: 'yellow', hex: '#F2C94C', name: 'Happy / Cheerful' },
      { key: 'green', hex: '#2D8E5E', name: 'Energetic / Motivated' },
      { key: 'lightBlue', hex: '#2BA5B5', name: 'Calm / Peaceful' },
      { key: 'darkBlue', hex: '#1B4F72', name: 'Sad / Blue' },
      { key: 'purple', hex: '#7B3FA0', name: 'Creative / Inspired' },
      { key: 'pink', hex: '#E05A8D', name: 'Loving / Grateful' },
      { key: 'gray', hex: '#A89880', name: 'Neutral / Indifferent' },
      { key: 'black', hex: '#2C1810', name: 'Exhausted / Drained' },
      { key: 'gold', hex: '#D4A843', name: 'Accomplished / Proud' },
      { key: 'teal', hex: '#1A9E8F', name: 'Relaxed / Leisure' },
    ],
  },
  {
    id: 'vangogh',
    displayName: 'Van Gogh',
    displayNameZh: '梵高',
    description: 'Vivid, intense saturated strokes',
    colors: [
      { key: 'red', hex: '#E53E3E', name: 'Angry / Frustrated' },
      { key: 'orange', hex: '#ED8936', name: 'Anxious / Stressed' },
      { key: 'yellow', hex: '#F6E05E', name: 'Happy / Cheerful' },
      { key: 'green', hex: '#38A169', name: 'Energetic / Motivated' },
      { key: 'lightBlue', hex: '#4FC3F7', name: 'Calm / Peaceful' },
      { key: 'darkBlue', hex: '#1A4B8C', name: 'Sad / Blue' },
      { key: 'purple', hex: '#805AD5', name: 'Creative / Inspired' },
      { key: 'pink', hex: '#ED64A6', name: 'Loving / Grateful' },
      { key: 'gray', hex: '#B5A68E', name: 'Neutral / Indifferent' },
      { key: 'black', hex: '#1A202C', name: 'Exhausted / Drained' },
      { key: 'gold', hex: '#D69E2E', name: 'Accomplished / Proud' },
      { key: 'teal', hex: '#319795', name: 'Relaxed / Leisure' },
    ],
  },
];

export function getPaletteById(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

const CLASSIC_HEX_TO_KEY = new Map<string, MoodKey>();
PALETTES[0].colors.forEach((c) => CLASSIC_HEX_TO_KEY.set(c.hex.toUpperCase(), c.key));

export function classicHexToKey(hex: string): MoodKey | undefined {
  return CLASSIC_HEX_TO_KEY.get(hex.toUpperCase());
}

export function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}
