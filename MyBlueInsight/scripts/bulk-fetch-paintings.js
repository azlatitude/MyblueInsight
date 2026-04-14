/**
 * Bulk fetch public domain paintings from Art Institute of Chicago
 * to expand our paintings database.
 * Run: node scripts/bulk-fetch-paintings.js
 */

const searches = [
  'landscape nature forest',
  'portrait woman',
  'still life flowers fruit',
  'seascape ocean marine',
  'night sky moon',
  'winter snow',
  'sunset sunrise',
  'dance music celebration',
  'children family',
  'garden spring',
  'autumn harvest',
  'river lake reflection',
  'mountain valley',
  'village town street',
  'religious sacred',
  'battle war',
  'mythology classical',
  'interior room',
  'horse animal',
  'abstract geometric',
];

async function searchPaintings(query) {
  const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&fields=id,title,artist_title,date_display,color,image_id,term_titles,style_titles,is_public_domain,artwork_type_title&limit=12`;
  const resp = await fetch(url);
  if (!resp.ok) return [];
  const json = await resp.json();
  // Filter client-side for public domain paintings only
  return (json.data || []).filter(d => d.is_public_domain && d.artwork_type_title === 'Painting');
}

function hslToMoodKey(h, s, l) {
  if (l < 20) return 'black';
  if (s < 10 && l < 60) return 'gray';
  if (h >= 345 || h < 15) return 'red';
  if (h >= 15 && h < 45) return 'orange';
  if (h >= 45 && h < 70) return 'yellow';
  if (h >= 70 && h < 165) return 'green';
  if (h >= 165 && h < 200) return 'teal';
  if (h >= 200 && h < 220) return 'lightBlue';
  if (h >= 220 && h < 260) return 'darkBlue';
  if (h >= 260 && h < 310) return 'purple';
  if (h >= 310 && h < 345) return 'pink';
  return 'gray';
}

const TAG_MOODS = {
  'leisure': { lightBlue: 0.15, yellow: 0.1, teal: 0.1 },
  'domestic scenes': { pink: 0.1, yellow: 0.1 },
  'countryside': { green: 0.2, yellow: 0.1 },
  'landscapes': { green: 0.15, lightBlue: 0.1 },
  'water': { lightBlue: 0.15, darkBlue: 0.1 },
  'trees': { green: 0.15 },
  'flowers': { pink: 0.15, yellow: 0.1 },
  'nature': { green: 0.15, teal: 0.1 },
  'animals': { green: 0.1, orange: 0.05 },
  'weather/seasons': { lightBlue: 0.1, gray: 0.05 },
  'night': { darkBlue: 0.2, black: 0.15 },
  'portraits': { pink: 0.05, gray: 0.05 },
  'women': { pink: 0.1 },
  'children': { yellow: 0.1, pink: 0.05 },
  'everyday life (genre)': { gray: 0.1, yellow: 0.05 },
  'war': { red: 0.2, black: 0.15 },
  'religion': { purple: 0.1, gold: 0.1 },
  'blue (color)': { darkBlue: 0.15, lightBlue: 0.1 },
  'green (color)': { green: 0.15 },
  'Impressionism': { lightBlue: 0.05, yellow: 0.05 },
  'Romanticism': { pink: 0.1, purple: 0.05 },
  'Realism': { gray: 0.05 },
  'emotions': { pink: 0.2, red: 0.1 },
  'still life': { yellow: 0.1, orange: 0.1 },
  'fruit': { yellow: 0.1, orange: 0.15 },
  'sailing': { lightBlue: 0.2, teal: 0.1 },
  'dance': { pink: 0.15, red: 0.1 },
  'music': { purple: 0.15 },
  'snow': { lightBlue: 0.2, gray: 0.15 },
  'urban life': { gray: 0.1, darkBlue: 0.05 },
  'death': { black: 0.3 },
  'horses': { green: 0.1, orange: 0.1, gold: 0.1 },
};

function buildMoodProfile(color, termTitles, styleTitles) {
  const profile = {};
  const allKeys = ['red','orange','yellow','green','lightBlue','darkBlue','purple','pink','gray','black','gold','teal'];

  if (color && color.h !== undefined) {
    const key = hslToMoodKey(color.h, color.s, color.l);
    profile[key] = (profile[key] || 0) + 0.3;
  }

  const allTags = [...(termTitles || []), ...(styleTitles || [])];
  for (const tag of allTags) {
    const lt = tag.toLowerCase();
    for (const [pattern, moods] of Object.entries(TAG_MOODS)) {
      if (lt === pattern.toLowerCase() || lt.includes(pattern.toLowerCase())) {
        for (const [mood, weight] of Object.entries(moods)) {
          profile[mood] = (profile[mood] || 0) + weight;
        }
      }
    }
  }

  for (const key of allKeys) if (!profile[key]) profile[key] = 0;
  const total = Object.values(profile).reduce((a, b) => a + b, 0);
  if (total === 0) { profile['gray'] = 1; return profile; }
  for (const key of allKeys) profile[key] = Math.round((profile[key] / total) * 100) / 100;
  for (const key of allKeys) if (profile[key] === 0) delete profile[key];
  return profile;
}

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

async function main() {
  const seenIds = new Set();
  const paintings = [];

  for (const query of searches) {
    try {
      const results = await searchPaintings(query);
      for (const d of results) {
        if (seenIds.has(d.id)) continue;
        seenIds.add(d.id);

        const profile = buildMoodProfile(d.color, d.term_titles, d.style_titles);
        const imageUrl = d.image_id
          ? `https://www.artic.edu/iiif/2/${d.image_id}/full/400,/0/default.jpg`
          : null;

        paintings.push({
          id: toSlug(d.title),
          title: d.title,
          artist: d.artist_title || 'Unknown',
          year: (d.date_display || '').replace(/[^\d–\-\/c.]/g, '').slice(0, 12),
          imageUrl,
          moodProfile: profile,
        });
      }
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`Error: ${query}:`, e.message);
    }
  }

  // Output as partial TypeScript to paste into paintings.ts
  for (const p of paintings) {
    const profileStr = Object.entries(p.moodProfile)
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    console.log(`  {`);
    console.log(`    id: '${p.id}',`);
    console.log(`    title: '${p.title.replace(/'/g, "\\'")}',`);
    console.log(`    artist: '${p.artist.replace(/'/g, "\\'")}',`);
    console.log(`    year: '${p.year}',`);
    console.log(`    imageUrl: ${p.imageUrl ? `'${p.imageUrl}'` : 'null'},`);
    console.log(`    moodProfile: { ${profileStr} },`);
    console.log(`  },`);
  }

  console.error(`\nTotal: ${paintings.length} paintings`);
}

main().catch(console.error);
