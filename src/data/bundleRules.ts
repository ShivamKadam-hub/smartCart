import { Product } from './mockProducts';

/* ─── types ─── */
export interface BundleRule {
  /** unique key for this rule */
  id: string;
  /** human-readable label shown in the UI */
  label: string;
  /** tags that must be present on at least one cart item to activate */
  triggerTags: string[];
  /** tags of products to suggest */
  suggestTags: string[];
  /** discount fraction (0.15 = 15 %) */
  discount: number;
}

export interface Bundle {
  rule: BundleRule;
  products: Product[];
  savings: number;
}

/* ─── rule definitions ─── */
export const bundleRules: BundleRule[] = [
  {
    id: 'cookware-essentials',
    label: 'Add lid set & utensils — save 15%',
    triggerTags: ['cookware'],
    suggestTags: ['lids', 'utensils'],
    discount: 0.15,
  },
  {
    id: 'bakeware-essentials',
    label: 'Add cooling rack & parchment — save 15%',
    triggerTags: ['bakeware'],
    suggestTags: ['cooling_rack', 'parchment'],
    discount: 0.15,
  },
  {
    id: 'complete-the-set',
    label: 'Complete the set & save 10%',
    triggerTags: [],           // activated by cart total > $150
    suggestTags: ['accessories'],
    discount: 0.1,
  },
];
