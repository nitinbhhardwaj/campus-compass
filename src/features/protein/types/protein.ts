export interface ProteinEntry {
  id: string;
  date: string;       // Local date in 'YYYY-MM-DD' format
  grams: number;      // Protein in grams (positive integer or decimal)
  label: string;      // Name of item/meal (e.g. 'Whey Scoop', '100g Paneer')
  createdAt: string;  // ISO 8601 timestamp
}

export type DietPreference = 'veg' | 'egg' | 'non-veg';

export interface ProteinSettings {
  bodyWeightKg: number;
  goalGrams: number;  // Default is bodyWeightKg * 1.6, user-overridable
  dietPreference: DietPreference;
}

export type CreateProteinEntryDTO = Omit<ProteinEntry, 'id' | 'createdAt'>;
