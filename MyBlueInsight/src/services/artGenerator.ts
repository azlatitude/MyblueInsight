export interface SvgCircleDescriptor {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
}

export interface SvgRectDescriptor {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
}

export interface SvgPathDescriptor {
  type: 'path';
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export type SvgDescriptor = SvgCircleDescriptor | SvgRectDescriptor | SvgPathDescriptor;

interface ColorFreq {
  hex: string;
  ratio: number;
}

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedColor(freqs: ColorFreq[], rand: () => number): string {
  const roll = rand();
  let cum = 0;
  for (const f of freqs) {
    cum += f.ratio;
    if (roll <= cum) return f.hex;
  }
  return freqs[freqs.length - 1]?.hex ?? '#888888';
}

// Parse a hex color and return r,g,b components
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const val = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return { r: (val >> 16) & 255, g: (val >> 8) & 255, b: val & 255 };
}

// Build an rgba(...) string for use in SVG fill
function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

export function generateWatercolor(freqs: ColorFreq[], seed: number, size: number): SvgDescriptor[] {
  const rand = mulberry32(seed);
  const elements: SvgDescriptor[] = [];

  // White background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: '#FFFFFF', opacity: 1 });

  // Large translucent overlapping circles per mood color
  for (const { hex, ratio } of freqs) {
    const count = Math.floor(ratio * 60) + 6;
    for (let i = 0; i < count; i++) {
      const r = rand() * size * 0.18 + size * 0.05;
      elements.push({
        type: 'circle',
        cx: rand() * size,
        cy: rand() * size,
        r,
        fill: rgba(hex, rand() * 0.22 + 0.05),
        opacity: 1,
      });
    }
  }

  // Medium blobs for texture layering
  for (let i = 0; i < 80; i++) {
    const hex = weightedColor(freqs, rand);
    const r = rand() * size * 0.10 + size * 0.02;
    elements.push({
      type: 'circle',
      cx: rand() * size,
      cy: rand() * size,
      r,
      fill: rgba(hex, rand() * 0.18 + 0.04),
      opacity: 1,
    });
  }

  // Small texture dots
  for (let i = 0; i < 120; i++) {
    const hex = weightedColor(freqs, rand);
    const r = rand() * size * 0.025 + size * 0.006;
    elements.push({
      type: 'circle',
      cx: rand() * size,
      cy: rand() * size,
      r,
      fill: rgba(hex, rand() * 0.14 + 0.03),
      opacity: 1,
    });
  }

  return elements;
}

export function generateMosaic(freqs: ColorFreq[], seed: number, size: number): SvgDescriptor[] {
  const rand = mulberry32(seed);
  const elements: SvgDescriptor[] = [];

  // White background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: '#FFFFFF', opacity: 1 });

  // Generate Voronoi seed points
  const pointCount = 180;
  const points: { x: number; y: number; color: string }[] = [];
  for (let i = 0; i < pointCount; i++) {
    points.push({
      x: rand() * size,
      y: rand() * size,
      color: weightedColor(freqs, rand),
    });
  }

  // Nearest-neighbor cell rendering using a grid cell size suitable for 300px canvas
  const cellSize = Math.max(4, Math.round(size / 40));
  for (let y = 0; y < size; y += cellSize) {
    for (let x = 0; x < size; x += cellSize) {
      const px = x + cellSize / 2;
      const py = y + cellSize / 2;
      let minDist = Infinity;
      let nearestColor = '#888888';
      for (const pt of points) {
        const dx = px - pt.x;
        const dy = py - pt.y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          nearestColor = pt.color;
        }
      }
      // Add a subtle gap between tiles by slightly reducing rendered size
      const gap = 1;
      elements.push({
        type: 'rect',
        x: x + gap,
        y: y + gap,
        width: cellSize - gap,
        height: cellSize - gap,
        fill: nearestColor,
        opacity: 1,
      });
    }
  }

  return elements;
}

export function generateFlowField(freqs: ColorFreq[], seed: number, size: number): SvgDescriptor[] {
  const rand = mulberry32(seed);
  const elements: SvgDescriptor[] = [];

  // Soft warm background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: '#FAFAF5', opacity: 1 });

  // Recursive fractal tree using mood colors
  function branch(x: number, y: number, angle: number, length: number, depth: number, thickness: number) {
    if (depth <= 0 || length < 2) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    const color = weightedColor(freqs, rand);
    const opacity = 0.4 + depth * 0.06;

    elements.push({
      type: 'path',
      d: `M ${x.toFixed(1)} ${y.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`,
      stroke: color,
      strokeWidth: thickness,
      opacity: Math.min(opacity, 0.9),
    });

    // Add leaf circles at terminal branches
    if (depth <= 2) {
      const leafColor = weightedColor(freqs, rand);
      elements.push({
        type: 'circle',
        cx: endX,
        cy: endY,
        r: rand() * 4 + 2,
        fill: rgba(leafColor, rand() * 0.4 + 0.2),
        opacity: 1,
      });
    }

    const branchCount = depth > 4 ? 2 : (rand() > 0.3 ? 3 : 2);
    const spread = rand() * 0.5 + 0.3;
    const shrink = rand() * 0.15 + 0.6;

    for (let i = 0; i < branchCount; i++) {
      const offsetAngle = (i - (branchCount - 1) / 2) * spread + (rand() - 0.5) * 0.2;
      branch(
        endX, endY,
        angle + offsetAngle,
        length * shrink,
        depth - 1,
        Math.max(thickness * 0.65, 0.5),
      );
    }
  }

  // Plant multiple fractal trees from bottom
  const treeCount = 3 + Math.floor(rand() * 3);
  for (let t = 0; t < treeCount; t++) {
    const startX = size * (0.15 + rand() * 0.7);
    const startY = size * (0.85 + rand() * 0.1);
    const angle = -Math.PI / 2 + (rand() - 0.5) * 0.4;
    const trunkLength = size * (0.12 + rand() * 0.08);
    const maxDepth = 6 + Math.floor(rand() * 3);
    branch(startX, startY, angle, trunkLength, maxDepth, 3 + rand() * 2);
  }

  return elements;
}

export function generateNebula(freqs: ColorFreq[], seed: number, size: number): SvgDescriptor[] {
  const rand = mulberry32(seed);
  const elements: SvgDescriptor[] = [];

  // Dark space background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: '#080820', opacity: 1 });

  // Large nebula cloud circles — layered at very low opacity to build up glow
  for (const { hex, ratio } of freqs) {
    const cloudCount = Math.floor(ratio * 18) + 4;
    for (let i = 0; i < cloudCount; i++) {
      const r = rand() * size * 0.35 + size * 0.10;
      elements.push({
        type: 'circle',
        cx: rand() * size,
        cy: rand() * size,
        r,
        fill: rgba(hex, rand() * 0.10 + 0.02),
        opacity: 1,
      });
    }
  }

  // Medium bright patches
  for (let i = 0; i < 40; i++) {
    const hex = weightedColor(freqs, rand);
    const r = rand() * size * 0.08 + size * 0.02;
    elements.push({
      type: 'circle',
      cx: rand() * size,
      cy: rand() * size,
      r,
      fill: rgba(hex, rand() * 0.08 + 0.02),
      opacity: 1,
    });
  }

  // Stars — small bright dots
  for (let i = 0; i < 200; i++) {
    const starOpacity = rand() * 0.7 + 0.3;
    elements.push({
      type: 'circle',
      cx: rand() * size,
      cy: rand() * size,
      r: rand() * 1.2 + 0.3,
      fill: `rgba(255,255,255,${starOpacity.toFixed(3)})`,
      opacity: 1,
    });
  }

  // Bright star highlights with soft glow halo
  for (let i = 0; i < 15; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    // Glow halo
    elements.push({
      type: 'circle',
      cx,
      cy,
      r: rand() * 7 + 4,
      fill: 'rgba(255,255,255,0.06)',
      opacity: 1,
    });
    // Bright core
    elements.push({
      type: 'circle',
      cx,
      cy,
      r: rand() * 1.8 + 1.0,
      fill: 'rgba(255,255,255,1)',
      opacity: 1,
    });
  }

  return elements;
}
