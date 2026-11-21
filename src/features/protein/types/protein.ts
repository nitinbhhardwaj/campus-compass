export interface ProteinEntry {
  id: string;
  date: string;       // Local date in 'YYYY-MM-DD' format
  grams: number;      // Protein in grams (positive integer or decimal)
  label: string;      // Name of item/meal (e.g. 'Whey Scoop', '100g Paneer')
  createdAt: string;  // ISO 8601 timestamp
}

export interface ProteinSettings {
  bodyWeightKg: number;
  goalGrams: number;  // Default is bodyWeightKg * 1.6, user-overridable
}

export type CreateProteinEntryDTO = Omit<ProteinEntry, 'id' | 'createdAt'>;
