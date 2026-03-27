export interface MoodColor {
  key: string;
  hex: string;
  name: string;
}

export const MOOD_COLORS: MoodColor[] = [
  { key: 'red', hex: '#FF3B30', name: 'Angry / Frustrated' },
  { key: 'orange', hex: '#FF9500', name: 'Anxious / Stressed' },
  { key: 'yellow', hex: '#FFCC00', name: 'Happy / Cheerful' },
  { key: 'green', hex: '#34C759', name: 'Energetic / Motivated' },
  { key: 'lightBlue', hex: '#5AC8FA', name: 'Calm / Peaceful' },
  { key: 'darkBlue', hex: '#007AFF', name: 'Sad / Blue' },
  { key: 'purple', hex: '#AF52DE', name: 'Creative / Inspired' },
  { key: 'pink', hex: '#FF2D55', name: 'Loving / Grateful' },
  { key: 'gray', hex: '#8E8E93', name: 'Neutral / Indifferent' },
  { key: 'black', hex: '#1C1C1E', name: 'Exhausted / Drained' },
];

export function getMoodByHex(hex: string): MoodColor | undefined {
  return MOOD_COLORS.find((m) => m.hex.toUpperCase() === hex.toUpperCase());
}
