/** Hand-written catalog content for the seed. Everything else is derived deterministically. */

export const CATEGORY_CATALOG = [
  {
    slug: 'accessories',
    name: 'Accessories',
    description: 'Essential gadgets and accessories to enhance your productivity.',
  },
  {
    slug: 'audio',
    name: 'Audio',
    description: 'Premium headphones, speakers, and audio equipment for conference-quality sound.',
  },
  {
    slug: 'electronics',
    name: 'Electronics',
    description: 'High-performance devices and electronics for professionals.',
  },
  {
    slug: 'home',
    name: 'Home',
    description: 'Essential items and appliances to enhance your living space.',
  },
  {
    slug: 'kitchen',
    name: 'Kitchen',
    description: 'Premium kitchen appliances and tools for your modern kitchen.',
  },
  {
    slug: 'smart-home',
    name: 'Smart Home',
    description: 'Connect your workspace with intelligent automation solutions.',
  },
  {
    slug: 'wearables',
    name: 'Wearables',
    description: 'Smart devices to track your health and productivity.',
  },
] as const;

export type CategorySlug = (typeof CATEGORY_CATALOG)[number]['slug'];

export type ProductCatalogEntry = {
  name: string;
  category: CategorySlug;
  price: number;
  brand: string;
  description: string;
  materials?: string;
  origin?: string;
  warranty?: string;
};

export const PRODUCT_CATALOG: readonly ProductCatalogEntry[] = [
  // Audio
  {
    name: 'Wireless Headphones',
    category: 'audio',
    price: 199.99,
    brand: 'Sonora',
    description: 'Noise cancelling over-ear headphones with 20 hours of battery life.',
    materials: 'Aluminium, protein leather',
    origin: 'Denmark',
    warranty: '2 years',
  },
  {
    name: 'Portable Speaker',
    category: 'audio',
    price: 79.99,
    brand: 'Sonora',
    description: 'Waterproof Bluetooth speaker with 360-degree sound.',
    origin: 'Denmark',
    warranty: '1 year',
  },
  {
    name: 'Studio Microphone',
    category: 'audio',
    price: 149,
    brand: 'Clarion',
    description: 'USB-C condenser microphone tuned for calls, podcasts, and streaming.',
    materials: 'Steel mesh grille',
    warranty: '2 years',
  },
  {
    name: 'Earbuds Pro',
    category: 'audio',
    price: 129.5,
    brand: 'Clarion',
    description: 'True wireless earbuds with adaptive transparency and a pocketable case.',
    warranty: '1 year',
  },
  // Electronics
  {
    name: 'Ultrawide Monitor',
    category: 'electronics',
    price: 549,
    brand: 'Vista',
    description: '34-inch curved display with USB-C power delivery and a built-in KVM.',
    origin: 'Taiwan',
    warranty: '3 years',
  },
  {
    name: 'Mechanical Keyboard',
    category: 'electronics',
    price: 159,
    brand: 'Keystone',
    description: 'Hot-swappable 75% keyboard with gasket mount and PBT keycaps.',
    materials: 'Aluminium case, PBT keycaps',
    warranty: '2 years',
  },
  {
    name: 'Ergonomic Mouse',
    category: 'electronics',
    price: 89.99,
    brand: 'Keystone',
    description: 'Vertical wireless mouse that pairs with three devices.',
    warranty: '2 years',
  },
  {
    name: 'Webcam 4K',
    category: 'electronics',
    price: 119,
    brand: 'Vista',
    description: '4K webcam with auto framing and a magnetic privacy shutter.',
    warranty: '2 years',
  },
  // Accessories
  {
    name: 'Laptop Stand',
    category: 'accessories',
    price: 59,
    brand: 'Formwork',
    description: 'Folding aluminium stand that raises your screen to eye level.',
    materials: 'Anodised aluminium',
    warranty: '5 years',
  },
  {
    name: 'Cable Organizer',
    category: 'accessories',
    price: 19.99,
    brand: 'Formwork',
    description: 'Weighted desk organizer that keeps five cables within reach.',
    materials: 'Silicone, steel',
  },
  {
    name: 'Desk Mat',
    category: 'accessories',
    price: 34.5,
    brand: 'Formwork',
    description: 'Felt desk mat with a water-resistant cork underside.',
    materials: 'Merino felt, cork',
    origin: 'Portugal',
  },
  {
    name: 'USB-C Hub',
    category: 'accessories',
    price: 69,
    brand: 'Keystone',
    description: 'Eight-port hub with 100W pass-through charging and 4K HDMI.',
    warranty: '2 years',
  },
  // Home
  {
    name: 'Desk Lamp',
    category: 'home',
    price: 89,
    brand: 'Lumen',
    description: 'Dimmable LED lamp with adjustable colour temperature.',
    materials: 'Steel, aluminium',
    warranty: '2 years',
  },
  {
    name: 'Air Purifier',
    category: 'home',
    price: 229,
    brand: 'Breeze',
    description: 'Quiet HEPA purifier sized for offices up to 40 square metres.',
    warranty: '3 years',
  },
  {
    name: 'Linen Throw',
    category: 'home',
    price: 74,
    brand: 'Hearth',
    description: 'Stonewashed linen throw for the reading corner.',
    materials: 'European flax linen',
    origin: 'Lithuania',
  },
  {
    name: 'Ceramic Planter',
    category: 'home',
    price: 39,
    brand: 'Hearth',
    description: 'Glazed planter with a hidden drainage tray.',
    materials: 'Stoneware',
    origin: 'Portugal',
  },
  // Kitchen
  {
    name: 'Pour-Over Kettle',
    category: 'kitchen',
    price: 129,
    brand: 'Brewline',
    description: 'Variable temperature gooseneck kettle with a hold mode.',
    materials: 'Stainless steel',
    warranty: '2 years',
  },
  {
    name: 'Burr Grinder',
    category: 'kitchen',
    price: 189,
    brand: 'Brewline',
    description: 'Conical burr grinder with 40 settings from espresso to cold brew.',
    warranty: '2 years',
  },
  {
    name: 'Chef Knife',
    category: 'kitchen',
    price: 145,
    brand: 'Hagane',
    description: '21 cm gyuto forged from layered steel.',
    materials: 'VG-10 steel, walnut',
    origin: 'Japan',
    warranty: 'Lifetime',
  },
  {
    name: 'Cast Iron Skillet',
    category: 'kitchen',
    price: 65,
    brand: 'Hearth',
    description: 'Pre-seasoned 26 cm skillet that goes from stove to oven.',
    materials: 'Cast iron',
    warranty: 'Lifetime',
  },
  // Smart Home
  {
    name: 'Smart Thermostat',
    category: 'smart-home',
    price: 199,
    brand: 'Nestor',
    description: 'Learning thermostat that schedules itself around your week.',
    warranty: '2 years',
  },
  {
    name: 'Smart Plug Pack',
    category: 'smart-home',
    price: 49,
    brand: 'Nestor',
    description: 'Four Matter-compatible plugs with energy monitoring.',
    warranty: '1 year',
  },
  {
    name: 'Video Doorbell',
    category: 'smart-home',
    price: 179,
    brand: 'Sentry',
    description: 'Battery doorbell with package detection and local storage.',
    warranty: '2 years',
  },
  {
    name: 'Light Strip',
    category: 'smart-home',
    price: 59.99,
    brand: 'Lumen',
    description: 'Two-metre RGBW strip that syncs with your screen.',
    warranty: '1 year',
  },
  // Wearables
  {
    name: 'Fitness Watch',
    category: 'wearables',
    price: 249,
    brand: 'Pulse',
    description: 'GPS watch with heart-rate variability and a two-week battery.',
    materials: 'Titanium, sapphire glass',
    warranty: '2 years',
  },
  {
    name: 'Sleep Ring',
    category: 'wearables',
    price: 299,
    brand: 'Pulse',
    description: 'Titanium ring that tracks sleep stages and recovery.',
    materials: 'Titanium',
    warranty: '1 year',
  },
  {
    name: 'Posture Sensor',
    category: 'wearables',
    price: 79,
    brand: 'Align',
    description: 'Clip-on sensor that nudges you when you slouch.',
    warranty: '1 year',
  },
  {
    name: 'Blue Light Glasses',
    category: 'wearables',
    price: 69,
    brand: 'Align',
    description: 'Lightweight frames with a clear blue light filter.',
    materials: 'Acetate',
    origin: 'Italy',
  },
];

/** Products featured by the seed, by catalog name. */
export const FEATURED_PRODUCT_NAMES = [
  'Wireless Headphones',
  'Ultrawide Monitor',
  'Pour-Over Kettle',
  'Fitness Watch',
] as const;

export const REVIEW_TEMPLATES = [
  {
    rating: 5,
    title: 'Exceeded expectations',
    body: 'Build quality is excellent and it fits right into my daily routine.',
  },
  {
    rating: 5,
    title: 'Worth every penny',
    body: 'I compared a few options and this was the clear winner. No regrets.',
  },
  {
    rating: 4,
    title: 'Great, with one caveat',
    body: 'Does everything I need. The packaging could be less wasteful.',
  },
  {
    rating: 4,
    title: 'Solid choice',
    body: 'Reliable and well designed. Setup took a little longer than expected.',
  },
  {
    rating: 3,
    title: 'It is fine',
    body: 'Works as described, but I expected a bit more at this price.',
  },
  {
    rating: 2,
    title: 'Not for me',
    body: 'The finish scratched within a week. Support was helpful though.',
  },
  {
    rating: 1,
    title: 'Arrived damaged',
    body: 'Had to return it. The replacement has not shipped yet.',
  },
] as const;

export const REVIEWER_NAMES = [
  'Ava M.',
  'Noah K.',
  'Mia T.',
  'Liam S.',
  'Yuki H.',
  'Omar R.',
  'Ines P.',
  'Lucas B.',
] as const;
