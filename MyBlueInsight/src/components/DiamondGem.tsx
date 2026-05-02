import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Props {
  size: number;
  color: string;
}

/**
 * A gem-cut diamond shape (💎 style) rendered as SVG.
 * The color prop tints the main facets; highlights are white overlays.
 */
export function DiamondGem({ size, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="topFacet" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <Stop offset="1" stopColor={color} stopOpacity="0.9" />
        </LinearGradient>
        <LinearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </LinearGradient>
      </Defs>
      {/* Top crown - trapezoidal facets */}
      <Path d="M15,35 L30,10 L70,10 L85,35 Z" fill="url(#topFacet)" />
      {/* Left crown facet */}
      <Path d="M15,35 L30,10 L50,35 Z" fill={color} opacity="0.75" />
      {/* Right crown facet */}
      <Path d="M85,35 L70,10 L50,35 Z" fill={color} opacity="0.85" />
      {/* Center crown facet */}
      <Path d="M30,10 L70,10 L50,35 Z" fill="#fff" opacity="0.35" />
      {/* Bottom left pavilion */}
      <Path d="M15,35 L50,35 L50,95 Z" fill={color} opacity="0.9" />
      {/* Bottom right pavilion */}
      <Path d="M85,35 L50,35 L50,95 Z" fill="url(#bodyGrad)" />
      {/* Shine highlight */}
      <Path d="M35,20 L45,15 L50,35 L38,35 Z" fill="#fff" opacity="0.4" />
    </Svg>
  );
}
