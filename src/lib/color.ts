type Stop = [kelvin: number, rgb: [number, number, number]];

/**
 * Stylised colour-temperature ramp. True blackbody values above ~4500K are
 * near-white and vanish on light surfaces, so cool temperatures lean blue.
 */
const RAMP: Stop[] = [
  [2200, [255, 147, 41]],
  [2700, [255, 172, 78]],
  [3000, [255, 194, 118]],
  [3500, [255, 216, 166]],
  [4000, [250, 234, 210]],
  [5000, [214, 230, 255]],
  [6500, [178, 206, 255]],
];

export function cctToRgb(kelvin: number): [number, number, number] {
  if (kelvin <= RAMP[0][0]) return RAMP[0][1];
  for (let i = 1; i < RAMP.length; i++) {
    const [k1, c1] = RAMP[i];
    if (kelvin <= k1) {
      const [k0, c0] = RAMP[i - 1];
      const t = (kelvin - k0) / (k1 - k0);
      return [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * t)) as [number, number, number];
    }
  }
  return RAMP[RAMP.length - 1][1];
}

export const cctToCss = (kelvin: number, alpha = 1) => {
  const [r, g, b] = cctToRgb(kelvin);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function cctLabel(kelvin: number) {
  if (kelvin <= 2400) return 'Candlelight';
  if (kelvin <= 2850) return 'Warm White';
  if (kelvin <= 3200) return 'Soft White';
  if (kelvin <= 3700) return 'Neutral';
  if (kelvin <= 4300) return 'Cool White';
  if (kelvin <= 5500) return 'Daylight';
  return 'Bright Daylight';
}
