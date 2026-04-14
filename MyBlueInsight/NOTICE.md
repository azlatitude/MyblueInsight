# Third-Party Notices

MyBlueInsight uses the following third-party resources:

## Art Institute of Chicago API

- **Source**: https://api.artic.edu/
- **Usage**: Painting metadata (titles, artists, dates) and IIIF artwork images
- **License**:
  - API data (metadata): [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
  - Artwork images via IIIF: Only public domain artworks are used in this app.
    Images are loaded on-demand from Art Institute of Chicago servers and are not
    bundled with the app.
- **Terms**: https://www.artic.edu/terms

## Open-Source Dependencies

This app is built with the following open-source frameworks and libraries:

| Package | License |
|---------|---------|
| React Native | MIT |
| Expo | MIT |
| expo-router | MIT |
| expo-sqlite | MIT |
| expo-file-system | MIT |
| expo-sharing | MIT |
| expo-document-picker | MIT |
| expo-haptics | MIT |
| react-native-svg | MIT |
| @expo/vector-icons (Ionicons) | MIT |

## Painting Mood Profiles

The mood profiles (emotional color distributions) assigned to paintings in
`src/constants/paintings.ts` are original content created for this app.
They are subjective interpretations and not sourced from any third-party dataset.

## Disclaimer

Painting titles, artist names, and dates are factual information in the public domain.
No copyrighted artwork images are bundled with the application binary. Public domain
images are fetched at runtime from the Art Institute of Chicago's IIIF servers only
for artworks confirmed as `is_public_domain: true` via their API.
