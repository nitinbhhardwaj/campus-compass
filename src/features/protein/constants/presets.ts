export interface ProteinPreset {
  id: string;
  label: string;
  grams: number;
  description: string;
}

/**
 * Quick-add presets with approximate protein values.
 * All values are approximate references for convenience.
 */
export const PROTEIN_PRESETS: readonly ProteinPreset[] = [
  { id: 'egg', label: 'Egg', grams: 6, description: '1 whole egg (~6g)' },
  { id: 'paneer', label: '100g Paneer', grams: 18, description: 'Raw cottage cheese (~18g)' },
  { id: 'dal', label: 'Bowl of Dal', grams: 9, description: '1 medium cooked bowl (~9g)' },
  { id: 'whey', label: 'Whey Scoop', grams: 24, description: '1 standard scoop (~24g)' },
  { id: 'chicken', label: '100g Chicken', grams: 27, description: 'Cooked breast (~27g)' },
  { id: 'milk', label: 'Glass of Milk', grams: 8, description: '250ml cup (~8g)' },
  { id: 'soya', label: '100g Soya Chunks', grams: 52, description: 'Uncooked chunks (~52g)' },
  { id: 'curd', label: 'Bowl of Curd', grams: 8, description: '1 medium bowl/yogurt (~8g)' },
] as const;
