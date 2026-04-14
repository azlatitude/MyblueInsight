// Append new paintings to paintings.ts, filtering out duplicates
const fs = require('fs');

const existingIds = new Set([
  'adele-bloch-bauer','american-gothic','arrival-normandy-train','bay-marseilles',
  'bedroom-van-gogh','birth-venus','black-cross-okeeffe','blue-nude','cafe-terrace',
  'childs-bath','composition-viii','dance-bougival','flower-clouds','girl-before-mirror',
  'girl-by-window-munch','girl-pearl-earring','grande-jatte','great-wave','greyed-rainbow',
  'impression-sunrise','mother-child-picasso','nighthawks','nightlife-motley','night-watch',
  'paris-street-rainy','persistence-memory','red-vineyard','rothko-purple-white-red',
  'scream','self-portrait-van-gogh','stacks-wheat','starry-night','sunflowers',
  'the-dream','the-kiss','two-sisters-terrace','wanderer-sea-fog','water-lilies-artic',
  'water-lily-pond','wheatfield-cypresses','whistlers-mother',
  // Also filter by title similarity
  'a-sunday-on-la-grande-jatte-1884',
]);

const bulkText = fs.readFileSync(__dirname + '/bulk-output.txt', 'utf8');
// Extract painting blocks
const blocks = bulkText.split(/(?=  \{)/);
const newPaintings = [];

for (const block of blocks) {
  const idMatch = block.match(/id: '([^']+)'/);
  if (!idMatch) continue;
  const id = idMatch[1];
  if (existingIds.has(id)) continue;
  // Skip if title contains same key painting
  const titleMatch = block.match(/title: '([^']+)'/);
  if (!titleMatch) continue;
  existingIds.add(id);
  newPaintings.push(block.trim());
}

console.log(`New paintings to add: ${newPaintings.length}`);

// Read existing paintings.ts and insert before the final ];
const paintingsPath = 'src/constants/paintings.ts';
let content = fs.readFileSync(paintingsPath, 'utf8');
const insertPoint = content.lastIndexOf('];');
const newSection = '\n  // ── Bulk: Art Institute of Chicago public domain paintings ──\n' +
  newPaintings.map(b => '  ' + b).join('\n') + '\n';
content = content.slice(0, insertPoint) + newSection + content.slice(insertPoint);
fs.writeFileSync(paintingsPath, content);
console.log('Done! Updated paintings.ts');
