import { ProteinEntry, ProteinSettings } from '../types/protein';

/**
 * Pure function: Calculates the default daily protein goal (in grams) based on body weight.
 * Multiplier is 1.6g per kg of body weight, rounded to the nearest integer.
 */
export function defaultGoalFromWeight(bodyWeightKg: number): number {
  if (bodyWeightKg <= 0 || !Number.isFinite(bodyWeightKg)) {
    return 0;
  }
  return Math.round(bodyWeightKg * 1.6);
}

/**
 * Pure function: Sums the total protein intake in grams for a given local date.
 * Does not cap the total.
 */
export function totalForDate(entries: ProteinEntry[], date: string): number {
  return entries
    .filter((entry) => entry.date === date)
    .reduce((sum, entry) => sum + (Number.isFinite(entry.grams) ? entry.grams : 0), 0);
}

/**
 * Pure function: Calculates remaining protein grams needed to reach the daily goal.
 * Floored at 0 so exceeding the goal never returns negative remaining grams.
 */
export function remainingForDate(
  entries: ProteinEntry[],
  goalGrams: number,
  date: string
): number {
  if (goalGrams <= 0) return 0;
  const total = totalForDate(entries, date);
  return Math.max(0, goalGrams - total);
}

/**
 * Pure function: Computes the progress percentage (0 - 100) for display.
 * Capped at 100 for progress bar visualization, even when the user exceeds their goal.
 */
export function progressPercent(totalGrams: number, goalGrams: number): number {
  if (goalGrams <= 0 || totalGrams <= 0) {
    return 0;
  }
  const percent = Math.round((totalGrams / goalGrams) * 100);
  return Math.min(100, Math.max(0, percent));
}

/**
 * Pure function: Filters protein entries for a given date, sorted newest first.
 */
export function entriesForDate(entries: ProteinEntry[], date: string): ProteinEntry[] {
  return entries
    .filter((entry) => entry.date === date)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: {
    bodyWeightKg?: string;
    goalGrams?: string;
  };
}

/**
 * Pure function: Validates protein settings inputs.
 * Checks for positive numbers and sensible realistic maximums.
 */
export function validateProteinSettings(
  settings: Partial<ProteinSettings>
): SettingsValidationResult {
  const errors: SettingsValidationResult['errors'] = {};

  if (settings.bodyWeightKg === undefined || Number.isNaN(settings.bodyWeightKg)) {
    errors.bodyWeightKg = 'Body weight is required.';
  } else if (settings.bodyWeightKg <= 0) {
    errors.bodyWeightKg = 'Weight must be greater than 0 kg.';
  } else if (settings.bodyWeightKg > 300) {
    errors.bodyWeightKg = 'Weight must be 300 kg or less.';
  }

  if (settings.goalGrams !== undefined) {
    if (Number.isNaN(settings.goalGrams) || settings.goalGrams <= 0) {
      errors.goalGrams = 'Goal must be greater than 0 grams.';
    } else if (settings.goalGrams > 500) {
      errors.goalGrams = 'Goal must be 500 grams or less.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
