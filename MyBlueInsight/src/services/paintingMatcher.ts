import { MoodKey } from '../constants/palettes';
import { Painting, PAINTINGS } from '../constants/paintings';
import { MoodEntryRow } from '../db/moodRepository';

const ALL_KEYS: MoodKey[] = [
  'red', 'orange', 'yellow', 'green', 'lightBlue',
  'darkBlue', 'purple', 'pink', 'gray', 'black', 'gold',
];

function toVector(profile: Partial<Record<MoodKey, number>>): number[] {
  return ALL_KEYS.map((k) => profile[k] ?? 0);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export interface PaintingMatch {
  painting: Painting;
  similarity: number;
}

export function findMatchingPainting(
  entries: MoodEntryRow[]
): PaintingMatch | null {
  if (entries.length === 0) return null;

  // Build mood frequency profile from entries
  const counts: Partial<Record<MoodKey, number>> = {};
  entries.forEach((e) => {
    const key = (e.mood_key ?? 'gray') as MoodKey;
    counts[key] = (counts[key] ?? 0) + 1;
  });
  const total = entries.length;
  const userProfile: Partial<Record<MoodKey, number>> = {};
  for (const [key, count] of Object.entries(counts)) {
    userProfile[key as MoodKey] = count / total;
  }

  const userVec = toVector(userProfile);

  let best: PaintingMatch | null = null;
  for (const painting of PAINTINGS) {
    const sim = cosineSimilarity(userVec, toVector(painting.moodProfile));
    if (!best || sim > best.similarity) {
      best = { painting, similarity: sim };
    }
  }

  return best;
}
