/**
 * Fetch famous paintings from Art Institute of Chicago API
 * and generate mood profiles based on color + tags + style.
 *
 * Run: node scripts/fetch-paintings.js
 * Output: prints TypeScript array for paintings.ts
 */

const FAMOUS_IDS = [
  27992,  // A Sunday on La Grande Jatte — Seurat
  20684,  // Paris Street; Rainy Day — Caillebotte
  16568,  // Water Lilies — Monet
  111442, // The Child's Bath — Cassatt
  28560,  // The Old Guitarist — Picasso
  80607,  // The Bedroom — Van Gogh
  14655,  // Nighthawks — Hopper
  6565,   // The Herring Net — Homer
  87479,  // Bathers by a River — Matisse
  100472, // The Assumption of the Virgin — El Greco
  111628, // The Basket of Apples — Cézanne
  16487,  // The Old Bridge at Vernon — Monet
  21023,  // Stacks of Wheat (End of Summer) — Monet
  46327,  // Sky above Clouds IV — O'Keeffe
  16231,  // Still Life with Apples — Cézanne
  16571,  // Arrival of the Normandy Train — Monet
  76054,  // Madame X — Sargent (actually at Met, skip)
  117266, // The Bay of Marseilles — Cézanne
  83642,  // Woman at Her Toilette — Morisot
  25853,  // On the Terrace — Renoir
  81512,  // The Gulf Stream — Homer (at Met, skip)
  154235, // American Gothic — Wood
  24306,  // Two Sisters (On the Terrace) — Renoir
  16362,  // Wheatstacks (Meules) — Monet
  52679,  // The Bay — Renoir (check)
  229406, // Night Windows — Hopper
  86385,  // Self-Portrait — Van Gogh
  59426,  // Under the Wave — Hokusai
  185905, // The Praying Jew — Chagall
  109275, // Haystacks (Autumn) — Monet
  129884, // Poppy Field — Monet
  4773,   // Black Cross — O'Keeffe
  64818,  // The White Calico Flower — O'Keeffe
  151371, // City Night — O'Keeffe
  184362, // Nightlife — Motley
  76395,  // Corn Harvest in Provence — Van Gogh
  87088,  // America Windows — Chagall
];

// HSL color → mood key mapping
function hslToMoodKey(h, s, l) {
  // Very dark → black/exhausted
  if (l < 20) return 'black';
  // Very desaturated → gray/neutral
  if (s < 10 && l < 60) return 'gray';

  // Map hue ranges to mood keys
  if (h >= 345 || h < 15) return 'red';       // Red
  if (h >= 15 && h < 45) return 'orange';      // Orange
  if (h >= 45 && h < 70) return 'yellow';      // Yellow/gold
  if (h >= 70 && h < 165) return 'green';      // Green
  if (h >= 165 && h < 210) return 'lightBlue'; // Light blue
  if (h >= 210 && h < 260) return 'darkBlue';  // Dark blue
  if (h >= 260 && h < 310) return 'purple';    // Purple
  if (h >= 310 && h < 345) return 'pink';      // Pink

  return 'gray';
}

// Term/tag → mood mapping (weighted)
const TAG_MOOD_MAP = {
  // Emotions & feelings
  'emotions': { pink: 0.2, red: 0.1 },
  'love': { pink: 0.3 },
  'joy': { yellow: 0.3 },
  'sadness': { darkBlue: 0.3 },
  'fear': { black: 0.2, gray: 0.1 },
  'anger': { red: 0.3 },
  'loneliness': { darkBlue: 0.2, gray: 0.2 },
  'solitude': { darkBlue: 0.15, gray: 0.15 },
  'death': { black: 0.3 },
  'hope': { yellow: 0.2, green: 0.1 },

  // Activities & scenes
  'leisure': { lightBlue: 0.15, yellow: 0.1 },
  'domestic scenes': { pink: 0.1, yellow: 0.1 },
  'urban life': { gray: 0.1, darkBlue: 0.05 },
  'countryside': { green: 0.2, yellow: 0.1 },
  'sailing': { lightBlue: 0.2 },
  'war': { red: 0.2, black: 0.15 },
  'dance': { pink: 0.15, red: 0.1 },
  'music': { purple: 0.15 },
  'religion': { purple: 0.1, gold: 0.1 },

  // Nature
  'landscapes': { green: 0.15, lightBlue: 0.1 },
  'water': { lightBlue: 0.15, darkBlue: 0.1 },
  'trees': { green: 0.15 },
  'flowers': { pink: 0.15, yellow: 0.1 },
  'nature': { green: 0.15 },
  'animals': { green: 0.1, orange: 0.05 },
  'weather/seasons': { lightBlue: 0.1, gray: 0.05 },
  'night': { darkBlue: 0.2, black: 0.15 },
  'sun': { yellow: 0.2, orange: 0.1 },
  'rain': { darkBlue: 0.15, gray: 0.1 },

  // People
  'portraits': { pink: 0.05, gray: 0.05 },
  'women': { pink: 0.1 },
  'men': { darkBlue: 0.05 },
  'children': { yellow: 0.1, pink: 0.05 },
  'everyday life (genre)': { gray: 0.1, yellow: 0.05 },

  // Colors mentioned
  'blue (color)': { darkBlue: 0.15, lightBlue: 0.1 },
  'blue': { darkBlue: 0.1, lightBlue: 0.1 },
  'red (color)': { red: 0.2 },
  'green (color)': { green: 0.15 },
  'gold (color)': { gold: 0.2 },
  'yellow (color)': { yellow: 0.15 },
  'black (color)': { black: 0.15 },
  'white (color)': { lightBlue: 0.05, gray: 0.05 },

  // Styles (mood associations)
  'Impressionism': { lightBlue: 0.05, yellow: 0.05 },
  'Post-Impressionism': { yellow: 0.05, purple: 0.05 },
  'Expressionism': { red: 0.1, orange: 0.05 },
  'Cubism': { purple: 0.1, gray: 0.05 },
  'Realism': { gray: 0.05 },
  'Romanticism': { pink: 0.1, purple: 0.05 },
  'Surrealism': { purple: 0.15, darkBlue: 0.05 },
  'Modernism': { purple: 0.05 },
  'Abstract': { purple: 0.1 },
};

function buildMoodProfile(color, termTitles, styleTitles) {
  const profile = {};
  const allKeys = ['red','orange','yellow','green','lightBlue','darkBlue','purple','pink','gray','black','gold'];

  // 1. Color contribution (30%)
  if (color && color.h !== undefined) {
    const colorMood = hslToMoodKey(color.h, color.s, color.l);
    profile[colorMood] = (profile[colorMood] || 0) + 0.3;
  }

  // 2. Tag contributions (60%)
  const allTags = [...(termTitles || []), ...(styleTitles || [])];
  for (const tag of allTags) {
    const lowerTag = tag.toLowerCase();
    for (const [pattern, moods] of Object.entries(TAG_MOOD_MAP)) {
      if (lowerTag === pattern.toLowerCase() || lowerTag.includes(pattern.toLowerCase())) {
        for (const [mood, weight] of Object.entries(moods)) {
          profile[mood] = (profile[mood] || 0) + weight;
        }
      }
    }
  }

  // 3. Ensure minimum variety - add small baseline for missing
  for (const key of allKeys) {
    if (!profile[key]) profile[key] = 0;
  }

  // Normalize to sum = 1
  const total = Object.values(profile).reduce((a, b) => a + b, 0);
  if (total === 0) {
    profile['gray'] = 1;
    return profile;
  }
  for (const key of allKeys) {
    profile[key] = Math.round((profile[key] / total) * 100) / 100;
  }

  // Remove zero entries
  for (const key of allKeys) {
    if (profile[key] === 0) delete profile[key];
  }

  return profile;
}

async function fetchPainting(id) {
  const url = `https://api.artic.edu/api/v1/artworks/${id}?fields=id,title,artist_title,date_display,style_titles,term_titles,color,image_id,is_public_domain`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const json = await resp.json();
  return json.data;
}

function toSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

async function main() {
  const paintings = [];

  for (const id of FAMOUS_IDS) {
    try {
      const data = await fetchPainting(id);
      if (!data) { console.error(`Skip ${id}: not found`); continue; }

      const profile = buildMoodProfile(data.color, data.term_titles, data.style_titles);
      const imageUrl = data.image_id
        ? `https://www.artic.edu/iiif/2/${data.image_id}/full/400,/0/default.jpg`
        : null;

      paintings.push({
        id: toSlug(data.title),
        articId: data.id,
        title: data.title,
        artist: data.artist_title,
        year: (data.date_display || '').replace(/[^\d–-]/g, '').slice(0, 9),
        imageUrl,
        isPublicDomain: data.is_public_domain,
        moodProfile: profile,
        tags: (data.term_titles || []).slice(0, 10),
        styles: data.style_titles || [],
      });

      // Rate limit
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`Error fetching ${id}:`, e.message);
    }
  }

  // Print as TypeScript
  console.log(`// Auto-generated from Art Institute of Chicago API`);
  console.log(`// ${new Date().toISOString()}`);
  console.log(`// ${paintings.length} paintings\n`);
  console.log(`import { MoodKey } from './palettes';\n`);
  console.log(`export interface Painting {`);
  console.log(`  id: string;`);
  console.log(`  title: string;`);
  console.log(`  titleZh: string;`);
  console.log(`  artist: string;`);
  console.log(`  artistZh: string;`);
  console.log(`  year: string;`);
  console.log(`  imageUrl: string | null;`);
  console.log(`  moodProfile: Partial<Record<MoodKey, number>>;`);
  console.log(`}\n`);
  console.log(`export const PAINTINGS: Painting[] = [`);

  for (const p of paintings) {
    const profileStr = Object.entries(p.moodProfile)
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    console.log(`  {`);
    console.log(`    id: '${p.id}',`);
    console.log(`    title: '${p.title.replace(/'/g, "\\'")}',`);
    console.log(`    titleZh: '', // TODO: add Chinese title`);
    console.log(`    artist: '${(p.artist || '').replace(/'/g, "\\'")}',`);
    console.log(`    artistZh: '', // TODO: add Chinese name`);
    console.log(`    year: '${p.year}',`);
    console.log(`    imageUrl: ${p.imageUrl ? `'${p.imageUrl}'` : 'null'},`);
    console.log(`    moodProfile: { ${profileStr} },`);
    console.log(`  },`);
  }

  console.log(`];`);
}

main().catch(console.error);
