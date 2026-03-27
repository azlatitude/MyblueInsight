# MyBlueInsight - Product Specification

## 1. App Overview

| Field | Value |
|-------|-------|
| **App Name** | MyBlueInsight |
| **Platform** | iOS (SwiftUI) |
| **Target** | iPhone, iOS 17+ |
| **Storage** | Local only (SwiftData) |
| **Architecture** | MVVM |
| **Dependencies** | None (zero external deps for MVP) |

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
- Below: pie chart showing mood color distribution percentages
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
- Share button (UIActivityViewController)
- Save to Photos button
- "Generate Again" to regenerate with different random seed

#### Art Generation Algorithm
Each style uses the mood colors and their ratios:
- Calculate color frequencies from the selected time period
- Colors with higher frequency get more visual weight in the artwork
- Use `Canvas` / `GraphicsContext` in SwiftUI for rendering
- Each generation uses a random seed for variety
- Output resolution: 1080x1080 pixels

## 3. Data Model (SwiftData)

```swift
@Model
class MoodEntry {
    @Attribute(.unique) var id: UUID
    var date: Date           // calendar date (time component stripped)
    var colorHex: String     // e.g., "#FF3B30"
    var moodName: String     // e.g., "Angry"
    var note: String?        // optional, max 280 chars
    var createdAt: Date
    var updatedAt: Date
}

@Model
class Artwork {
    @Attribute(.unique) var id: UUID
    var imageData: Data      // PNG data
    var timeRangeStart: Date
    var timeRangeEnd: Date
    var style: String        // "watercolor", "mosaic", "flowfield", "nebula"
    var generatedAt: Date
}
```

## 4. Navigation Structure

```
TabView
├── Tab 1: CalendarView (calendar.circle icon)
│   └── Sheet: MoodPickerSheet (bottom sheet)
├── Tab 2: ReviewView (chart.bar icon)
│   ├── Segment: WeeklyReviewView
│   ├── Segment: MonthlyReviewView
│   └── Segment: YearlyReviewView
└── Tab 3: ArtView (paintpalette icon)
    └── Sheet: ArtDetailView (full screen)
```

## 5. File Structure

```
MyBlueInsight/
├── MyBlueInsightApp.swift          # App entry point with SwiftData container
├── Models/
│   ├── MoodEntry.swift             # SwiftData model
│   ├── Artwork.swift               # SwiftData model
│   └── MoodColor.swift             # Enum with all 10 mood colors
├── ViewModels/
│   ├── CalendarViewModel.swift     # Calendar logic, mood CRUD
│   ├── ReviewViewModel.swift       # Statistics calculations
│   └── ArtViewModel.swift          # Art generation orchestration
├── Views/
│   ├── ContentView.swift           # TabView container
│   ├── Calendar/
│   │   ├── CalendarView.swift      # Monthly calendar grid
│   │   ├── DayCell.swift           # Individual day cell
│   │   └── MoodPickerSheet.swift   # Color selection bottom sheet
│   ├── Review/
│   │   ├── ReviewView.swift        # Review container with segments
│   │   ├── WeeklyReviewView.swift
│   │   ├── MonthlyReviewView.swift
│   │   └── YearlyReviewView.swift
│   └── Art/
│       ├── ArtView.swift           # Art tab main view
│       ├── ArtStyleCard.swift      # Style selection card
│       └── ArtDetailView.swift     # Full screen art display
├── Services/
│   └── ArtGenerator.swift          # All 4 art generation algorithms
├── Extensions/
│   ├── Color+Hex.swift             # Color <-> Hex conversion
│   └── Date+Extensions.swift       # Date helpers
└── Assets.xcassets/
    └── (app icon, accent color)
```

## 6. UI/UX Requirements

- **Theme**: Clean, minimalist, plenty of white space
- **Dark Mode**: Full support (use semantic colors)
- **Typography**: SF Pro (system font), varying weights
- **Animations**:
  - Smooth color fill on mood selection
  - Gentle scale animation on day cell tap
  - Art generation progress animation
- **Haptics**: Light impact on color selection, success on save
- **Accessibility**: VoiceOver labels for all mood colors

## 7. MVP Scope

### In MVP (v1.0)
- [x] Calendar view with mood recording
- [x] 10 mood colors
- [x] Optional text notes
- [x] Edit past days
- [x] Weekly/Monthly/Yearly review grids
- [x] Basic statistics (most common mood, streak)
- [x] Art generation (all 4 styles)
- [x] Save art to Photos
- [x] Share art
- [x] Dark mode
- [x] Haptic feedback

### Future (v2.0+)
- [ ] Widgets (iOS home screen widget showing current week)
- [ ] Notifications/reminders to log mood
- [ ] iCloud sync
- [ ] Multiple moods per day (morning/afternoon/evening)
- [ ] Mood insights with trends analysis
- [ ] Custom color/mood creation
- [ ] Apple Watch companion app
- [ ] Export mood data as CSV
- [ ] Social sharing of review grids

## 8. Technical Notes

- Use `@Observable` macro (iOS 17+) for ViewModels
- Use `SwiftData` with `@Model` macro for persistence
- Calendar calculations via `Calendar` and `DateComponents`
- Art generation on background thread with `Task { }`
- Use `ImageRenderer` or `Canvas` for art output
- No third-party dependencies
