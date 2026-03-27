export interface ArtElement {
  type: 'circle' | 'rect' | 'path';
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  color: string;
  opacity?: number;
  blur?: number;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
}

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

export function generateWatercolor(freqs: ColorFreq[], seed: number, size: number): ArtElement[] {
  const rand = mulberry32(seed);
  const elements: ArtElement[] = [];

  // White background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, color: '#FFFFFF', opacity: 1 });

  // Large translucent circles per mood
  for (const { hex, ratio } of freqs) {
    const count = Math.floor(ratio * 80) + 8;
    for (let i = 0; i < count; i++) {
      elements.push({
        type: 'circle',
        x: rand() * size,
        y: rand() * size,
        radius: rand() * size * 0.15 + size * 0.04,
        color: hex,
        opacity: rand() * 0.2 + 0.04,
        blur: rand() * 15 + 5,
      });
    }
  }

  // Smaller texture dots
  for (let i = 0; i < 150; i++) {
    elements.push({
      type: 'circle',
      x: rand() * size,
      y: rand() * size,
      radius: rand() * size * 0.03 + size * 0.008,
      color: weightedColor(freqs, rand),
      opacity: rand() * 0.15 + 0.03,
      blur: rand() * 8 + 2,
    });
  }

  return elements;
}

export function generateMosaic(freqs: ColorFreq[], seed: number, size: number): ArtElement[] {
  const rand = mulberry32(seed);
  const elements: ArtElement[] = [];

  // White background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, color: '#FFFFFF', opacity: 1 });

  // Generate Voronoi seed points
  const pointCount = 200;
  const points: { x: number; y: number; color: string }[] = [];
  for (let i = 0; i < pointCount; i++) {
    points.push({
      x: rand() * size,
      y: rand() * size,
      color: weightedColor(freqs, rand),
    });
  }

  // Simple cell rendering
  const cellSize = Math.max(3, size / 60);
  for (let y = 0; y < size; y += cellSize) {
    for (let x = 0; x < size; x += cellSize) {
      const px = x + cellSize / 2;
      const py = y + cellSize / 2;
      let minDist = Infinity;
      let nearestColor = '#888';
      for (const pt of points) {
        const dx = px - pt.x;
        const dy = py - pt.y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          nearestColor = pt.color;
        }
      }
      elements.push({
        type: 'rect',
        x, y,
        width: cellSize,
        height: cellSize,
        color: nearestColor,
        opacity: 1,
      });
    }
  }

  return elements;
}

export function generateFlowField(freqs: ColorFreq[], seed: number, size: number): ArtElement[] {
  const rand = mulberry32(seed);
  const elements: ArtElement[] = [];

  // Light background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, color: '#F8F8F8', opacity: 1 });

  // Build noise field
  const gridSize = 30;
  const scale = size / gridSize;
  const freq = rand() * 3 + 2;
  const field: number[][] = [];
  for (let r = 0; r <= gridSize; r++) {
    field[r] = [];
    for (let c = 0; c <= gridSize; c++) {
      const x = c / gridSize;
      const y = r / gridSize;
      field[r][c] = Math.sin(x * freq * Math.PI) * Math.cos(y * freq * Math.PI) * Math.PI * 2 + rand() * 0.5;
    }
  }

  // Particles
  const particleCount = 800;
  const steps = 60;
  for (let p = 0; p < particleCount; p++) {
    const color = weightedColor(freqs, rand);
    const points: { x: number; y: number }[] = [];
    let x = rand() * size;
    let y = rand() * size;
    points.push({ x, y });

    for (let s = 0; s < steps; s++) {
      const col = Math.floor(x / scale);
      const row = Math.floor(y / scale);
      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) break;
      const angle = field[row][col];
      x += Math.cos(angle) * 2;
      y += Math.sin(angle) * 2;
      if (x < 0 || x >= size || y < 0 || y >= size) break;
      points.push({ x, y });
    }

    if (points.length > 1) {
      elements.push({
        type: 'path',
        x: 0, y: 0,
        points,
        color,
        opacity: rand() * 0.3 + 0.1,
        strokeWidth: rand() * 1.5 + 0.5,
      });
    }
  }

  return elements;
}

export function generateNebula(freqs: ColorFreq[], seed: number, size: number): ArtElement[] {
  const rand = mulberry32(seed);
  const elements: ArtElement[] = [];

  // Dark space background
  elements.push({ type: 'rect', x: 0, y: 0, width: size, height: size, color: '#0A0A2E', opacity: 1 });

  // Nebula clouds
  for (const { hex, ratio } of freqs) {
    const cloudCount = Math.floor(ratio * 20) + 3;
    for (let i = 0; i < cloudCount; i++) {
      elements.push({
        type: 'circle',
        x: rand() * size,
        y: rand() * size,
        radius: rand() * size * 0.3 + size * 0.08,
        color: hex,
        opacity: rand() * 0.12 + 0.02,
        blur: rand() * 30 + 15,
      });
    }
  }

  // Bright patches
  for (let i = 0; i < 30; i++) {
    elements.push({
      type: 'circle',
      x: rand() * size,
      y: rand() * size,
      radius: rand() * size * 0.06 + size * 0.02,
      color: weightedColor(freqs, rand),
      opacity: 0.06,
      blur: rand() * 10 + 5,
    });
  }

  // Stars
  for (let i = 0; i < 200; i++) {
    elements.push({
      type: 'circle',
      x: rand() * size,
      y: rand() * size,
      radius: rand() * 1.5 + 0.3,
      color: '#FFFFFF',
      opacity: rand() * 0.7 + 0.3,
    });
  }

  // Bright star highlights with glow
  for (let i = 0; i < 15; i++) {
    const sx = rand() * size;
    const sy = rand() * size;
    elements.push({
      type: 'circle', x: sx, y: sy,
      radius: rand() * 2 + 1.5,
      color: '#FFFFFF', opacity: 1,
    });
    elements.push({
      type: 'circle', x: sx, y: sy,
      radius: rand() * 6 + 4,
      color: '#FFFFFF', opacity: 0.08,
      blur: 4,
    });
  }

  return elements;
}
