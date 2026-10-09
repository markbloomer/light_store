import { CATEGORY_BY_ID } from './categories';
import { LOCATIONS } from './locations';
import type { Certification, CategoryId, Product, ProductTag } from './types';

type Seed = {
  sku: string;
  name: string;
  brand: string;
  category: CategoryId;
  price: number;
  compareAt?: number;
  watts: number;
  lumens: number;
  cct: number[];
  cri?: number;
  dimmable?: boolean;
  voltage?: string;
  certs?: Certification[];
  finishes?: string[];
  tags?: ProductTag[];
  desc: string;
};

const SEEDS: Seed[] = [
  { sku: 'LM-PD-ORB14', name: 'Orbis 14" Dome Pendant', brand: 'Lumen Studio', category: 'pendants', price: 349, compareAt: 429, watts: 18, lumens: 1450, cct: [2700, 3000], cri: 95, finishes: ['Matte Black', 'Brushed Brass', 'Satin Nickel'], tags: ['sale', 'bestseller'], desc: 'Spun-aluminium dome with an opal diffuser that hides the LED source completely. Integrated driver, phase dimmable to 1%.' },
  { sku: 'LM-PD-HALO', name: 'Halo Ring Pendant 24"', brand: 'Arcform', category: 'pendants', price: 589, watts: 32, lumens: 2600, cct: [3000], cri: 93, finishes: ['Matte Black', 'Gold'], tags: ['new'], desc: 'A floating ring of uplight and downlight with a micro-prismatic lens for glare-free light over dining tables.' },
  { sku: 'LM-PD-GLOBE', name: 'Fume Smoked Glass Globe', brand: 'Nord Atelier', category: 'pendants', price: 279, watts: 6, lumens: 600, cct: [2200, 2700], cri: 90, finishes: ['Smoke', 'Amber', 'Clear'], desc: 'Mouth-blown smoked glass with a warm-dim filament. Designed to cluster in odd numbers.' },
  { sku: 'LM-CH-CASC', name: 'Cascade 9-Light Chandelier', brand: 'Arcform', category: 'chandeliers', price: 1290, compareAt: 1490, watts: 54, lumens: 4200, cct: [2700, 3000], cri: 95, finishes: ['Aged Brass', 'Matte Black'], tags: ['sale'], desc: 'Nine hand-finished arms carrying frosted glass cylinders. Adjustable 72" stem kit for vaulted ceilings.' },
  { sku: 'LM-CH-HALO3', name: 'Tier Three-Ring Chandelier', brand: 'Lumen Studio', category: 'chandeliers', price: 1849, watts: 96, lumens: 7800, cct: [3000, 3500, 4000], cri: 92, finishes: ['Gold', 'Black'], tags: ['new', 'bestseller'], desc: 'Three stacked rings in staggered heights. Each ring is independently tiltable on aircraft cable.' },
  { sku: 'LM-WS-ARC', name: 'Arc Up/Down Wall Sconce', brand: 'Nord Atelier', category: 'wall', price: 189, watts: 12, lumens: 860, cct: [2700, 3000, 4000], cri: 92, finishes: ['Matte Black', 'White', 'Bronze'], tags: ['bestseller'], desc: 'Crisp up/down light wash on a die-cast body. ADA compliant at 4" projection.' },
  { sku: 'LM-WS-BLADE', name: 'Blade Linear Vanity 36"', brand: 'Lumen Studio', category: 'wall', price: 249, watts: 24, lumens: 1900, cct: [3000, 4000], cri: 95, finishes: ['Chrome', 'Brushed Nickel', 'Black'], certs: ['cETL', 'ENERGY STAR'], desc: 'Frameless acrylic blade with a 95+ CRI source for true skin tones at the mirror.' },
  { sku: 'LM-DL-4SL', name: '4" Slim Pot Light, 5-CCT', brand: 'Voltaire', category: 'downlights', price: 14.99, compareAt: 19.99, watts: 9, lumens: 750, cct: [2700, 3000, 3500, 4000, 5000], cri: 90, certs: ['cETL', 'ENERGY STAR'], tags: ['sale', 'bestseller', 'rebate'], finishes: ['White'], desc: 'Canless wafer with a junction box. Selectable colour temperature switch on the driver. IC-rated, wet location.' },
  { sku: 'LM-DL-6GB', name: '6" Gimbal Downlight', brand: 'Voltaire', category: 'downlights', price: 32.5, watts: 15, lumens: 1100, cct: [3000, 4000, 5000], cri: 90, certs: ['cULus', 'ENERGY STAR'], finishes: ['White', 'Black'], desc: '35° tilt, 355° rotation. Deep-regressed reflector for low glare in sloped ceilings.' },
  { sku: 'LM-DL-COMM8', name: '8" Commercial Downlight', brand: 'Northline', category: 'downlights', price: 89, watts: 30, lumens: 3200, cct: [3500, 4000, 5000], cri: 85, voltage: '120–277V', certs: ['DLC', 'cULus'], tags: ['rebate'], finishes: ['White'], desc: 'Lumen- and CCT-selectable commercial downlight with 0–10V dimming for lobbies and corridors.' },
  { sku: 'LM-PN-2X4', name: '2×4 Edge-Lit Flat Panel', brand: 'Northline', category: 'panels', price: 74, compareAt: 89, watts: 50, lumens: 6500, cct: [3500, 4000, 5000], cri: 82, voltage: '120–347V', certs: ['DLC Premium', 'cULus'], tags: ['sale', 'rebate', 'bestseller'], finishes: ['White'], desc: 'Wattage-selectable 30/40/50W panel. Drops into T-bar grid or surface-mounts with an optional kit.' },
  { sku: 'LM-PN-2X2', name: '2×2 Back-Lit Panel', brand: 'Northline', category: 'panels', price: 54, watts: 30, lumens: 3900, cct: [3500, 4000, 5000], cri: 82, voltage: '120–347V', certs: ['DLC Premium', 'cULus'], tags: ['rebate'], finishes: ['White'], desc: 'Back-lit for uniform luminance and higher efficacy than edge-lit. Flicker-free 0–10V driver.' },
  { sku: 'LM-PN-TRF', name: 'Centre-Basket Troffer 2×4', brand: 'Kestrel', category: 'panels', price: 118, watts: 40, lumens: 5200, cct: [3500, 4000], cri: 85, voltage: '120–277V', certs: ['DLC', 'cULus'], finishes: ['White'], desc: 'Architectural centre-basket optic for schools and healthcare. Emergency battery option.' },
  { sku: 'LM-LN-4FT', name: '4 ft Linkable Linear', brand: 'Kestrel', category: 'linear', price: 64, watts: 40, lumens: 5000, cct: [3500, 4000, 5000], cri: 82, voltage: '120–277V', certs: ['DLC', 'cULus'], tags: ['bestseller'], finishes: ['White', 'Black'], desc: 'Tool-free link connectors create seamless continuous runs. Suspended or surface mount.' },
  { sku: 'LM-LN-STRIP', name: 'Cove Strip 24V, 16 ft', brand: 'Voltaire', category: 'linear', price: 79, watts: 72, lumens: 7200, cct: [2700, 3000, 4000], cri: 95, voltage: '24V DC', certs: ['cETL'], finishes: ['—'], desc: 'High-density COB tape with dot-free output. Cut every 2". Pair with aluminium channel for best results.' },
  { sku: 'LM-TR-SPOT', name: 'Gallery Track Spot 15W', brand: 'Arcform', category: 'track', price: 129, watts: 15, lumens: 1250, cct: [3000, 4000], cri: 97, certs: ['cULus'], tags: ['new'], finishes: ['Black', 'White'], desc: 'Interchangeable 15/24/36° optics with honeycomb louvre. Designed for galleries and premium retail.' },
  { sku: 'LM-TR-HEAD', name: 'Retail Track Head 30W', brand: 'Northline', category: 'track', price: 98, watts: 30, lumens: 3000, cct: [3000, 3500, 4000], cri: 92, certs: ['cULus'], finishes: ['Black', 'White', 'Silver'], desc: 'H/J/L-type compatible adaptor. Rotates 350° and tilts 90° with tool-free locking.' },
  { sku: 'LM-HB-UFO150', name: 'UFO High Bay 150W', brand: 'Kestrel', category: 'high-bays', price: 149, compareAt: 179, watts: 150, lumens: 22500, cct: [4000, 5000], cri: 80, voltage: '120–347V', certs: ['DLC Premium', 'cULus', 'IP65'], tags: ['sale', 'rebate', 'bestseller'], finishes: ['Grey'], desc: 'Replaces 400W metal halide. Wattage selectable 100/120/150W with optional motion sensor.' },
  { sku: 'LM-HB-LIN220', name: 'Linear High Bay 220W', brand: 'Kestrel', category: 'high-bays', price: 219, watts: 220, lumens: 33000, cct: [4000, 5000], cri: 80, voltage: '120–347V', certs: ['DLC Premium', 'cULus'], tags: ['rebate'], finishes: ['White'], desc: 'Narrow and wide optics for aisle racking or open floor. Chain or V-hook mount included.' },
  { sku: 'LM-OD-WP80', name: 'Full Cut-off Wall Pack 80W', brand: 'Northline', category: 'outdoor', price: 139, watts: 80, lumens: 11200, cct: [3000, 4000, 5000], cri: 80, voltage: '120–347V', certs: ['DLC', 'cULus', 'IP65'], tags: ['rebate'], finishes: ['Bronze'], desc: 'Dark-sky friendly full cut-off. Integrated photocell and field-selectable wattage.' },
  { sku: 'LM-OD-FL200', name: 'Area Flood 200W', brand: 'Kestrel', category: 'outdoor', price: 259, watts: 200, lumens: 28000, cct: [4000, 5000], cri: 70, voltage: '120–347V', certs: ['DLC Premium', 'cULus', 'IP65'], tags: ['new'], finishes: ['Bronze', 'Black'], desc: 'Slip-fitter or trunnion mount floodlight for parking lots and sports fields.' },
  { sku: 'LM-LP-ST64', name: 'ST64 Amber Filament, 4-Pack', brand: 'Nord Atelier', category: 'lamps', price: 36, watts: 6, lumens: 450, cct: [2200], cri: 90, certs: ['cULus'], tags: ['bestseller'], finishes: ['Amber'], desc: 'Vintage teardrop silhouette with spiral filament. E26 base, dimmable.' },
  { sku: 'LM-LP-T8', name: 'T8 Type A+B Tube, 25-Pack', brand: 'Voltaire', category: 'lamps', price: 112, compareAt: 139, watts: 15, lumens: 2200, cct: [3500, 4000, 5000], cri: 82, voltage: '120–277V', certs: ['DLC', 'cULus'], tags: ['sale', 'rebate'], finishes: ['Frosted'], desc: 'Hybrid tube works with or without the existing ballast — the easiest fluorescent retrofit.' },
  { sku: 'LM-LP-A19', name: 'A19 Smart Bulb, 2-Pack', brand: 'Voltaire', category: 'lamps', price: 29, watts: 9, lumens: 800, cct: [2700, 3000, 4000, 5000, 6500], cri: 90, certs: ['cETL', 'ENERGY STAR'], tags: ['new'], finishes: ['White'], desc: 'Tunable white and full RGB over Matter and Wi-Fi. No hub required.' },
];

/** Deterministic PRNG so stock levels are stable across reloads. */
function seeded(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ETAS = ['Oct 14', 'Oct 21', 'Oct 28', 'Nov 4', 'Nov 12'];

function build(seed: Seed, index: number): Product {
  const rnd = seeded(seed.sku);
  const cat = CATEGORY_BY_ID[seed.category];
  const bulk = seed.price < 60;
  const stock: Record<string, number> = {};
  for (const loc of LOCATIONS) {
    const base = loc.kind === 'Distribution Centre' ? 3.2 : loc.province === 'ON' ? 1.4 : 0.8;
    const scale = bulk ? 140 : seed.price < 300 ? 36 : 9;
    const r = rnd();
    stock[loc.id] = r < 0.14 ? 0 : Math.round(r * scale * base);
  }
  const marginPct = 0.28 + rnd() * 0.22;

  return {
    id: seed.sku.toLowerCase(),
    sku: seed.sku,
    name: seed.name,
    brand: seed.brand,
    category: seed.category,
    fixture: cat.fixture,
    application: cat.application,
    price: seed.price,
    compareAt: seed.compareAt,
    cost: Math.round(seed.price * (1 - marginPct) * 100) / 100,
    watts: seed.watts,
    lumens: seed.lumens,
    cctOptions: seed.cct,
    cri: seed.cri ?? 80,
    dimmable: seed.dimmable ?? true,
    voltage: seed.voltage ?? '120V',
    certifications: seed.certs ?? ['cULus'],
    lifespanHrs: cat.application === 'Industrial' ? 100000 : 50000,
    warrantyYrs: cat.application === 'Residential' ? 5 : 10,
    finishes: seed.finishes ?? ['White'],
    rating: Math.round((4.2 + rnd() * 0.8) * 10) / 10,
    reviews: Math.round(12 + rnd() * 480),
    tags: seed.tags ?? [],
    description: seed.desc,
    addedDaysAgo: seed.tags?.includes('new') ? Math.round(rnd() * 20) : 30 + index * 7,
    stock,
    incoming:
      rnd() > 0.45
        ? {
            qty: Math.round((bulk ? 400 : 40) * (0.4 + rnd())),
            eta: ETAS[Math.floor(rnd() * ETAS.length)],
            locationId: rnd() > 0.3 ? 'tor' : 'mtl',
          }
        : undefined,
  };
}

export const PRODUCTS: Product[] = SEEDS.map(build);

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<
  string,
  Product
>;

export const BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();
