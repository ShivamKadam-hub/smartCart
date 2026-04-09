export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  rating: number;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Stainless Steel Skillet',
    price: 89.95,
    image: 'https://via.placeholder.com/120/8B1A1A/FFFFFF?text=Skillet',
    category: 'cookware',
    tags: ['cookware', 'skillet', 'stainless'],
    rating: 4.7,
  },
  {
    id: '2',
    name: 'Nonstick Saucepan',
    price: 64.95,
    image: 'https://via.placeholder.com/120/8B1A1A/FFFFFF?text=Saucepan',
    category: 'cookware',
    tags: ['cookware', 'saucepan', 'nonstick'],
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Cast Iron Dutch Oven',
    price: 149.95,
    image: 'https://via.placeholder.com/120/8B1A1A/FFFFFF?text=DutchOven',
    category: 'cookware',
    tags: ['cookware', 'dutch_oven', 'cast_iron'],
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Silicone Spatula Set',
    price: 24.95,
    image: 'https://via.placeholder.com/120/C4753B/FFFFFF?text=Spatula',
    category: 'utensils',
    tags: ['utensils', 'spatula', 'silicone'],
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Wooden Spoon Collection',
    price: 29.95,
    image: 'https://via.placeholder.com/120/C4753B/FFFFFF?text=Spoons',
    category: 'utensils',
    tags: ['utensils', 'spoon', 'wooden'],
    rating: 4.4,
  },
  {
    id: '6',
    name: 'Stainless Steel Tongs',
    price: 18.95,
    image: 'https://via.placeholder.com/120/C4753B/FFFFFF?text=Tongs',
    category: 'utensils',
    tags: ['utensils', 'tongs', 'stainless'],
    rating: 4.3,
  },
  {
    id: '7',
    name: 'Universal Lid Set (3pc)',
    price: 39.95,
    image: 'https://via.placeholder.com/120/A0522D/FFFFFF?text=Lids',
    category: 'accessories',
    tags: ['lids', 'accessories', 'universal'],
    rating: 4.5,
  },
  {
    id: '8',
    name: 'Nonstick Baking Sheet',
    price: 34.95,
    image: 'https://via.placeholder.com/120/D2691E/FFFFFF?text=BakeSheet',
    category: 'bakeware',
    tags: ['bakeware', 'baking_sheet', 'nonstick'],
    rating: 4.6,
  },
  {
    id: '9',
    name: 'Silicone Baking Mat',
    price: 19.95,
    image: 'https://via.placeholder.com/120/D2691E/FFFFFF?text=BakeMat',
    category: 'bakeware',
    tags: ['bakeware', 'parchment', 'silicone'],
    rating: 4.7,
  },
  {
    id: '10',
    name: 'Wire Cooling Rack',
    price: 22.95,
    image: 'https://via.placeholder.com/120/D2691E/FFFFFF?text=CoolRack',
    category: 'bakeware',
    tags: ['bakeware', 'cooling_rack'],
    rating: 4.4,
  },
  {
    id: '11',
    name: 'Ceramic Mixing Bowl Set',
    price: 54.95,
    image: 'https://via.placeholder.com/120/A0522D/FFFFFF?text=Bowls',
    category: 'accessories',
    tags: ['accessories', 'mixing_bowl', 'ceramic'],
    rating: 4.8,
  },
  {
    id: '12',
    name: 'Digital Kitchen Scale',
    price: 44.95,
    image: 'https://via.placeholder.com/120/A0522D/FFFFFF?text=Scale',
    category: 'accessories',
    tags: ['accessories', 'scale', 'digital'],
    rating: 4.6,
  },
  {
    id: '13',
    name: 'Parchment Paper Roll',
    price: 12.95,
    image: 'https://via.placeholder.com/120/D2691E/FFFFFF?text=Parchment',
    category: 'bakeware',
    tags: ['bakeware', 'parchment'],
    rating: 4.3,
  },
  {
    id: '14',
    name: 'Premium Whisk Set',
    price: 27.95,
    image: 'https://via.placeholder.com/120/C4753B/FFFFFF?text=Whisk',
    category: 'utensils',
    tags: ['utensils', 'whisk', 'stainless'],
    rating: 4.5,
  },
];

export default mockProducts;
