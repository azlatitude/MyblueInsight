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

  // Light background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, fill: '#F4F4F8', opacity: 1 });

  // Build a simple sinusoidal angle field
  const gridSize = 24;
  const scale = size / gridSize;
  const freq = rand() * 3 + 2;
  const field: number[][] = [];
  for (let r = 0; r <= gridSize; r++) {
    field[r] = [];
    for (let c = 0; c <= gridSize; c++) {
      const nx = c / gridSize;
      const ny = r / gridSize;
      field[r][c] =
        Math.sin(nx * freq * Math.PI) * Math.cos(ny * freq * Math.PI) * Math.PI * 2 +
        rand() * 0.5;
    }
  }

  // Trace particle paths and emit SVG path descriptors
  const particleCount = 400;
  const steps = 40;
  const stepLen = size / 120;

  for (let p = 0; p < particleCount; p++) {
    const color = weightedColor(freqs, rand);
    const opacity = rand() * 0.35 + 0.1;
    const strokeWidth = rand() * 1.8 + 0.4;

    let x = rand() * size;
    let y = rand() * size;
    const pts: { x: number; y: number }[] = [{ x, y }];

    for (let s = 0; s < steps; s++) {
      const col = Math.floor(x / scale);
      const row = Math.floor(y / scale);
      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) break;
      const angle = field[row][col];
      x += Math.cos(angle) * stepLen;
      y += Math.sin(angle) * stepLen;
      if (x < 0 || x >= size || y < 0 || y >= size) break;
      pts.push({ x, y });
    }

    if (pts.length > 1) {
      // Build a smooth cubic bezier path through the points
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let j = 1; j < pts.length; j++) {
        const prev = pts[j - 1];
        const curr = pts[j];
        const cpx = (prev.x + curr.x) / 2;
        const cpy = (prev.y + curr.y) / 2;
        d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)} ${cpx.toFixed(1)} ${cpy.toFixed(1)}`;
      }

      elements.push({
        type: 'path',
        d,
        stroke: color,
        strokeWidth,
        opacity,
      });
    }
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
