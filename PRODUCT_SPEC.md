# MyBlueInsight - Product Specification (React Native / Expo)

## 1. App Overview

| Field | Value |
|-------|-------|
| **App Name** | MyBlueInsight |
| **Platform** | iOS + Android (React Native / Expo) |
| **Target** | iPhone & Android phones |
| **Storage** | Local only (expo-sqlite) |
| **Architecture** | Feature-based with React hooks |
| **Language** | TypeScript |
| **Key Dependencies** | expo, expo-router, expo-sqlite, @shopify/react-native-skia, expo-haptics, expo-media-library, expo-sharing |

## 2. Core Features

### 2.1 Mood Color Palette

| Color | Hex Code | Mood |
|-------|----------|------|
| Red | `#FF3B30` | Angry / Frustrated |
| Orange | `#FF9500` | Anxious / Stressed |
| Yellow | `#FFCC00` | Happy / Cheerful |
| Green | `#34C759` | Energetic / Motivated |
| Light Blue | `#5AC8FA` | Calm / Peaceful |
| Dark Blue | `#007AFF` | Sad / Blue |
| Purple | `#AF52DE` | Creative / Inspired |
| Pink | `#FF2D55` | Loving / Grateful |
| Gray | `#8E8E93` | Neutral / Indifferent |
| Black | `#1C1C1E` | Exhausted / Drained |

### 2.2 Calendar View (Main Screen - Tab 1)

- Monthly calendar grid as the home screen
- Each day cell is a circle/rounded-rect filled with the mood color (empty/outline if no mood recorded)
- Tap a day to open mood color picker as a bottom sheet
- Swipe left/right to navigate between months
- Month/Year title at top with navigation arrows
- Today's date has a subtle ring/border highlight
- Days in past months are slightly dimmed
- Future dates are not tappable

### 2.3 Mood Entry (Bottom Sheet)

- Triggered by tapping a calendar day cell
- Shows the 10-color palette in a 2x5 grid
- Each color circle has the mood label below it
- Selected color gets a checkmark overlay
- Optional text note field (max 280 chars) below the palette
- "Save" button at the bottom
- Tap outside or swipe down to dismiss
- Haptic feedback (light impact) on color selection
- If mood already exists for that day, pre-select the existing color and note

### 2.4 Review Dashboard (Tab 2)

Segmented control at top: **Week | Month | Year**

#### Weekly View
- Horizontal strip of 7 colored circles (Mon-Sun)
- Below: distribution bars showing mood color percentages
- Date range label (e.g., "Mar 17 - Mar 23, 2026")
- Navigate weeks with left/right arrows

#### Monthly View
- Color grid similar to GitHub contribution graph (7 columns x 4-5 rows)
- Each cell is the day's mood color
- Below: bar chart of mood distribution
- Statistics card:
  - Most common mood (color + name + percentage)
  - Mood diversity score (0-100, based on how many different moods used)
  - Longest streak of same mood

#### Yearly View
- 365-day compact color grid (similar to GitHub yearly contributions)
- 12 columns (months) x ~31 rows (days)
- Scrollable if needed
- Tap a cell to see the date and mood
- Summary statistics for the year

### 2.5 Art Generation (Tab 3)

#### Time Period Selector
- Segmented control: **Week | Month | Year**
- Shows which period's mood data will be used

#### Art Style Picker
- Horizontal scrollable cards showing art style previews:
  1. **Watercolor Blend** - soft flowing colors bleeding into each other
  2. **Geometric Mosaic** - colored tiles/triangles/hexagons arranged artistically
  3. **Flow Field** - particle flow lines in mood colors with organic curves
  4. **Nebula** - cosmic cloud-like formations with gradients

#### Generate Button
- Large "Generate Art" button
- Shows a loading animation while generating
- Generated art displayed in a card view
- Share button (expo-sharing)
- Save to Photos button (expo-media-library)
- "Generate Again" to regenerate with different random seed

#### Art Generation Algorithm
Each style uses the mood colors and their ratios:
- Calculate color frequencies from the selected time period
- Colors with higher frequency get more visual weight in the artwork
- Use `@shopify/react-native-skia` Canvas for GPU-accelerated rendering
- Each generation uses a seeded random (mulberry32 PRNG)
- Output resolution: 1080x1080 pixels

## 3. Data Model (SQLite via expo-sqlite)

```sql
CREATE TABLE IF NOT EXISTS mood_entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  date TEXT NOT NULL UNIQUE,        -- ISO date string "YYYY-MM-DD"
  color_hex TEXT NOT NULL,          -- e.g., "#FF3B30"
  mood_name TEXT NOT NULL,          -- e.g., "Angry / Frustrated"
  note TEXT,                        -- optional, max 280 chars
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  image_uri TEXT NOT NULL,          -- file URI to saved PNG
  time_range_start TEXT NOT NULL,
  time_range_end TEXT NOT NULL,
  style TEXT NOT NULL,              -- "watercolor", "mosaic", "flowfield", "nebula"
  generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### TypeScript types:

```typescript
interface MoodEntry {
  id: string;
  date: string;       // "YYYY-MM-DD"
  colorHex: string;
  moodName: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Artwork {
  id: string;
  imageUri: string;
  timeRangeStart: string;
  timeRangeEnd: string;
  style: 'watercolor' | 'mosaic' | 'flowfield' | 'nebula';
  generatedAt: string;
}

interface MoodColor {
  key: string;
  hex: string;
  name: string;
}
```

## 4. Navigation Structure (expo-router with tabs)

```
app/
├── _layout.tsx            # Root layout with SQLite provider
├── (tabs)/
│   ├── _layout.tsx        # Tab navigator (Calendar, Review, Art)
│   ├── index.tsx          # Calendar tab
│   ├── review.tsx         # Review tab
│   └── art.tsx            # Art tab
```

## 5. File Structure

```
MyBlueInsight/
├── app/
│   ├── _layout.tsx                 # Root layout, SQLite init, theme
│   └── (tabs)/
│       ├── _layout.tsx             # Tab bar configuration
│       ├── index.tsx               # Calendar screen
│       ├── review.tsx              # Review screen
│       └── art.tsx                 # Art screen
├── src/
│   ├── constants/
│   │   └── moodColors.ts          # 10 mood colors definition
│   ├── db/
│   │   ├── database.ts            # SQLite setup & migration
│   │   └── moodRepository.ts      # CRUD operations for mood_entries
│   ├── hooks/
│   │   ├── useMoods.ts            # Hook for mood data queries
│   │   └── useReviewStats.ts      # Hook for statistics calculations
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.tsx    # Monthly calendar grid
│   │   │   ├── DayCell.tsx         # Individual day cell
│   │   │   └── MoodPickerSheet.tsx # Bottom sheet color picker
│   │   ├── review/
│   │   │   ├── WeeklyReview.tsx
│   │   │   ├── MonthlyReview.tsx
│   │   │   ├── YearlyReview.tsx
│   │   │   └── StatisticsCard.tsx
│   │   └── art/
│   │       ├── ArtStyleCard.tsx
│   │       └── ArtCanvas.tsx       # Skia canvas for art rendering
│   ├── services/
│   │   └── artGenerator.ts         # All 4 art generation algorithms (Skia)
│   └── utils/
│       └── dateHelpers.ts          # Date utility functions
├── app.json                        # Expo config
├── package.json
└── tsconfig.json
```

## 6. UI/UX Requirements

- **Theme**: Clean, minimalist, plenty of white space
- **Dark Mode**: Full support (use `useColorScheme()` + themed styles)
- **Typography**: System font (San Francisco on iOS, Roboto on Android)
- **Animations**:
  - Smooth color fill on mood selection (React Native Reanimated)
  - Gentle scale animation on day cell tap
  - Art generation progress animation
- **Haptics**: expo-haptics for light impact on color selection, success on save
- **Accessibility**: accessibilityLabel on all mood color buttons

## 7. MVP Scope

### In MVP (v1.0)
- [x] Calendar view with mood recording
- [x] 10 mood colors
- [x] Optional text notes
- [x] Edit past days
- [x] Weekly/Monthly/Yearly review grids
- [x] Basic statistics (most common mood, streak)
- [x] Art generation (all 4 styles via Skia)
- [x] Save art to Photos
- [x] Share art
- [x] Dark mode
- [x] Haptic feedback
- [x] Works on both iOS and Android

### Future (v2.0+)
- [ ] Widgets (home screen widget)
- [ ] Notifications/reminders to log mood
- [ ] Cloud sync
- [ ] Multiple moods per day (morning/afternoon/evening)
- [ ] Mood insights with trends analysis
- [ ] Custom color/mood creation
- [ ] Export mood data as CSV

## 8. Technical Notes

- **Expo SDK 52+** with expo-router for file-based navigation
- **TypeScript** throughout
- **expo-sqlite** for local persistence (synchronous API, no ORM needed)
- **@shopify/react-native-skia** for art generation (GPU-accelerated Canvas)
- **expo-haptics** for haptic feedback
- **expo-media-library** for saving art to Photos
- **expo-sharing** for share sheet
- **react-native-reanimated** for smooth animations
- Art generation runs on JS thread but Skia rendering is GPU-bound so it stays smooth
- Seeded PRNG (mulberry32) for reproducible art with variety
- No backend, no accounts, fully offline
