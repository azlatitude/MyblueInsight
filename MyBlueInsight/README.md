# MyBlueInsight

A personal mood tracking app that turns your daily emotions into colorful art.

## Features

- **Color-Based Mood Tracking** — 12 mood colors (Happy, Calm, Energetic, Creative, Accomplished, Relaxed, etc.)
- **6 Artist-Inspired Palettes** — Classic, Macaron, Morandi, Monet, Gauguin, Van Gogh
- **Mood Art Generation** — 4 procedural art styles:
  - Landscape (layered hills & sky)
  - Mondrian (color block composition)
  - Fractal Flower (petal bloom patterns)
  - Nebula (cosmic clouds & stars)
- **Painting Recommendations** — 40+ famous paintings matched to your mood via cosine similarity, with thumbnails from the Art Institute of Chicago IIIF API
- **Weekly / Monthly / Yearly Review** — Color-coded calendars and mood distribution charts
- **Exercise Tracking** — Run, Walk, Yoga, Gym, Swim, Bike, Stairs
- **Data Export / Import** — JSON backup for data preservation across reinstalls
- **Dark Mode** — Follows system settings

## Tech Stack

- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **expo-router** — File-based tab navigation
- **expo-sqlite** — Local SQLite database (all data stays on device)
- **react-native-svg** — Procedural art rendering
- **expo-file-system** + **expo-sharing** — Data export
- **expo-document-picker** — Data import

## Privacy

All data is stored locally on the device. No accounts, no cloud sync, no analytics, no ads.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS device (Release mode)
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios --device --configuration Release
```

### Xcode 16+ Fix

If you encounter `consteval` errors with the `fmt` library, apply this patch after `pod install`:

```bash
sed -i '' 's/FMT_STRING("\(.*\)")/"\1"/g' ios/Pods/fmt/include/fmt/format-inl.h
```

## Project Structure

```
app/(tabs)/
  index.tsx        — Calendar screen (mood entry + export/import)
  review.tsx       — Review screen (Week/Month/Year)
  art.tsx          — Mood art generation + painting recommendations

src/
  components/      — UI components (calendar, review, art, settings)
  constants/       — Palettes, paintings database
  context/         — PaletteContext (global color theme)
  db/              — SQLite database + mood repository
  hooks/           — useMoods data hook
  services/        — Art generator, painting matcher, data backup
  utils/           — Date helpers
```

## License

MIT
