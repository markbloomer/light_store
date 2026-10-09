/** Highlight, mid-tone and shadow colours used to render each finish. */
type Stops = [string, string, string];

const FINISHES: Record<string, Stops> = {
  'Matte Black': ['#4a4e57', '#26282e', '#121316'],
  Black: ['#4a4e57', '#26282e', '#121316'],
  'Brushed Brass': ['#f1dca4', '#c9a35a', '#8a672c'],
  'Aged Brass': ['#d4b479', '#a07d43', '#5e4521'],
  Gold: ['#fbe3a1', '#d9a944', '#9c6f1f'],
  'Satin Nickel': ['#eceef0', '#b8bbc0', '#7f838a'],
  'Brushed Nickel': ['#e4e6e9', '#b0b4ba', '#7a7e85'],
  Chrome: ['#f8fafc', '#6b7280', '#d1d5db'],
  Silver: ['#eef0f3', '#b9bec6', '#868c95'],
  White: ['#ffffff', '#f1f0ec', '#d6d4cd'],
  Bronze: ['#a17a57', '#6b4a2f', '#3a271a'],
  Grey: ['#b3b7be', '#80858d', '#50545b'],
  Smoke: ['#6b6b72', '#3d3d43', '#222226'],
  Amber: ['#f2b45c', '#c7792a', '#7a3f0c'],
  Clear: ['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.06)'],
  Frosted: ['#fbfbf9', '#e7e7e3', '#c9c9c4'],
};

const DEFAULT: Stops = [
  'var(--art-metal)',
  'color-mix(in srgb, var(--art-metal) 50%, var(--art-fill))',
  'var(--art-fill)',
];

export const finishStops = (finish?: string): Stops => (finish && FINISHES[finish]) || DEFAULT;

export const finishSwatch = (finish: string) => {
  const [hi, mid, lo] = finishStops(finish);
  return `linear-gradient(135deg, ${hi}, ${mid} 55%, ${lo})`;
};
