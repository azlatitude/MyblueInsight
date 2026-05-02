import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface Props {
  size: number;
  color?: string; // kept for API compat, not used (PNG is fixed color)
}

const diamondImage = require('../../assets/diamond.png');

/**
 * A gem-cut diamond (💎) rendered from a bundled PNG asset.
 */
export function DiamondGem({ size }: Props) {
  return (
    <Image
      source={diamondImage}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
