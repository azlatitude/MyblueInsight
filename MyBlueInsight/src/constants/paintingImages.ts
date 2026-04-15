import { ImageSourcePropType } from 'react-native';

// Local thumbnails for public domain paintings (200px wide, ~10-25KB each)
export const PAINTING_IMAGES: Record<string, ImageSourcePropType> = {
  'grande-jatte': require('../../assets/paintings/grande-jatte.jpg'),
  'paris-street-rainy': require('../../assets/paintings/paris-street-rainy.jpg'),
  'water-lilies-artic': require('../../assets/paintings/water-lilies-artic.jpg'),
  'childs-bath': require('../../assets/paintings/childs-bath.jpg'),
  'bedroom-van-gogh': require('../../assets/paintings/bedroom-van-gogh.jpg'),
  'two-sisters-terrace': require('../../assets/paintings/two-sisters-terrace.jpg'),
  'self-portrait-van-gogh': require('../../assets/paintings/self-portrait-van-gogh.jpg'),
  'stacks-wheat': require('../../assets/paintings/stacks-wheat.jpg'),
  'bay-marseilles': require('../../assets/paintings/bay-marseilles.jpg'),
  'flower-clouds': require('../../assets/paintings/flower-clouds.jpg'),
  'water-lily-pond': require('../../assets/paintings/water-lily-pond.jpg'),
  'girl-by-window-munch': require('../../assets/paintings/girl-by-window-munch.jpg'),
  'arrival-normandy-train': require('../../assets/paintings/arrival-normandy-train.jpg'),
};
