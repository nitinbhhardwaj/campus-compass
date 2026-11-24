import { DietPreference } from '../types/protein';

export interface ProteinPreset {
  id: string;
  label: string;
  grams: number;
  description: string;
  diet: DietPreference;
}

/**
 * Quick-add presets with approximate protein values.
 * All values are approximate references for convenience.
 */
export const PROTEIN_PRESETS: readonly ProteinPreset[] = [
  { id: 'egg', label: 'Egg', grams: 6, description: '1 whole egg (~6g)', diet: 'egg' },
  { id: 'paneer', label: '100g Paneer', grams: 18, description: 'Raw cottage cheese (~18g)', diet: 'veg' },
  { id: 'dal', label: 'Bowl of Dal', grams: 9, description: '1 medium cooked bowl (~9g)', diet: 'veg' },
  { id: 'whey', label: 'Whey Scoop', grams: 24, description: '1 standard scoop (~24g)', diet: 'veg' },
  { id: 'chicken', label: '100g Chicken', grams: 27, description: 'Cooked breast (~27g)', diet: 'non-veg' },
  { id: 'milk', label: 'Glass of Milk', grams: 8, description: '250ml cup (~8g)', diet: 'veg' },
  { id: 'soya', label: '100g Soya chunks (dry)', grams: 52, description: 'Uncooked chunks (~52g)', diet: 'veg' },
  { id: 'curd', label: 'Bowl of Curd', grams: 8, description: '1 medium bowl/yogurt (~8g)', diet: 'veg' },
] as const;
