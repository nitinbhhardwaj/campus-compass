import { describe, it, expect } from 'vitest';
import { ProteinEntry } from '../types/protein';
import { ProteinPreset } from '../constants/presets';
import {
  defaultGoalFromWeight,
  totalForDate,
  remainingForDate,
  progressPercent,
  entriesForDate,
  validateProteinSettings,
  presetsForDiet,
} from './proteinLogic';

describe('proteinLogic pure functions', () => {
  const mockEntries: ProteinEntry[] = [
    {
      id: 'entry-1',
      date: '2026-11-21',
      grams: 24,
      label: 'Whey Scoop',
      createdAt: '2026-11-21T08:00:00.000Z',
    },
    {
      id: 'entry-2',
      date: '2026-11-21',
      grams: 18,
      label: '100g Paneer',
      createdAt: '2026-11-21T13:00:00.000Z',
    },
    {
      id: 'entry-3',
      date: '2026-11-20', // Yesterday
      grams: 52,
      label: '100g Soya Chunks',
      createdAt: '2026-11-20T19:00:00.000Z',
    },
  ];

  describe('1. defaultGoalFromWeight', () => {
    it('calculates 1.6x body weight rounded to nearest integer', () => {
      expect(defaultGoalFromWeight(70)).toBe(112); // 70 * 1.6 = 112
      expect(defaultGoalFromWeight(65)).toBe(104); // 65 * 1.6 = 104
      expect(defaultGoalFromWeight(72.5)).toBe(116); // 72.5 * 1.6 = 116
    });

    it('returns 0 for non-positive or invalid weights', () => {
      expect(defaultGoalFromWeight(0)).toBe(0);
      expect(defaultGoalFromWeight(-10)).toBe(0);
      expect(defaultGoalFromWeight(NaN)).toBe(0);
    });
  });

  describe('2. totalForDate', () => {
    it('sums protein grams exclusively for the target date', () => {
      const todayTotal = totalForDate(mockEntries, '2026-11-21');
      expect(todayTotal).toBe(42); // 24 + 18

      const yesterdayTotal = totalForDate(mockEntries, '2026-11-20');
      expect(yesterdayTotal).toBe(52);
    });

    it('returns 0 when no entries exist for the date', () => {
      expect(totalForDate(mockEntries, '2026-11-22')).toBe(0);
      expect(totalForDate([], '2026-11-21')).toBe(0);
    });

    it('does not cap the total when it exceeds arbitrary thresholds', () => {
      const largeEntries: ProteinEntry[] = [
        { id: '1', date: '2026-11-21', grams: 150, label: 'Feast', createdAt: 'T1' },
        { id: '2', date: '2026-11-21', grams: 80, label: 'Shake', createdAt: 'T2' },
      ];
      expect(totalForDate(largeEntries, '2026-11-21')).toBe(230);
    });
  });

  describe('3. remainingForDate', () => {
    it('calculates remaining grams correctly when under goal', () => {
      // Goal 112, Total 42 -> Remaining 70
      expect(remainingForDate(mockEntries, 112, '2026-11-21')).toBe(70);
    });

    it('floors remaining grams at 0 when goal is reached or exceeded', () => {
      // Goal 40, Total 42 -> Remaining 0 (not -2)
      expect(remainingForDate(mockEntries, 40, '2026-11-21')).toBe(0);
      expect(remainingForDate(mockEntries, 42, '2026-11-21')).toBe(0);
    });

    it('returns 0 if goal is 0 or negative', () => {
      expect(remainingForDate(mockEntries, 0, '2026-11-21')).toBe(0);
      expect(remainingForDate(mockEntries, -10, '2026-11-21')).toBe(0);
    });
  });

  describe('4. progressPercent', () => {
    it('calculates progress percentage accurately', () => {
      // 50g of 100g -> 50%
      expect(progressPercent(50, 100)).toBe(50);
      // 42g of 112g -> 37.5% -> 38%
      expect(progressPercent(42, 112)).toBe(38);
    });

    it('caps progress percentage at 100% for display when exceeded', () => {
      expect(progressPercent(150, 100)).toBe(100);
      expect(progressPercent(200, 100)).toBe(100);
    });

    it('handles zero total or zero goal safely without NaN or Infinity', () => {
      expect(progressPercent(0, 100)).toBe(0);
      expect(progressPercent(50, 0)).toBe(0);
      expect(progressPercent(0, 0)).toBe(0);
    });
  });

  describe('5. entriesForDate', () => {
    it('filters for the specified date and sorts newest first', () => {
      const todayEntries = entriesForDate(mockEntries, '2026-11-21');
      expect(todayEntries.length).toBe(2);
      expect(todayEntries[0].id).toBe('entry-2'); // 13:00 is newer than 08:00
      expect(todayEntries[1].id).toBe('entry-1');
    });

    it('returns empty array when no entries match the date', () => {
      expect(entriesForDate(mockEntries, '2026-11-19')).toEqual([]);
    });
  });

  describe('6. validateProteinSettings', () => {
    it('passes for valid body weight and goal', () => {
      const result = validateProteinSettings({ bodyWeightKg: 70, goalGrams: 112 });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('rejects zero or negative body weight', () => {
      const zeroResult = validateProteinSettings({ bodyWeightKg: 0 });
      expect(zeroResult.isValid).toBe(false);
      expect(zeroResult.errors.bodyWeightKg).toBeDefined();

      const negResult = validateProteinSettings({ bodyWeightKg: -5 });
      expect(negResult.isValid).toBe(false);
    });

    it('rejects unrealistically high body weight (> 300 kg)', () => {
      const result = validateProteinSettings({ bodyWeightKg: 350 });
      expect(result.isValid).toBe(false);
      expect(result.errors.bodyWeightKg).toContain('300 kg');
    });

    it('rejects unrealistically high goal (> 500 g)', () => {
      const result = validateProteinSettings({ bodyWeightKg: 70, goalGrams: 600 });
      expect(result.isValid).toBe(false);
      expect(result.errors.goalGrams).toContain('500 grams');
    });
  });

  describe('7. presetsForDiet', () => {
    const testPresets: ProteinPreset[] = [
      { id: 'paneer', label: '100g Paneer', grams: 18, description: '', diet: 'veg' },
      { id: 'dal', label: 'Bowl of Dal', grams: 9, description: '', diet: 'veg' },
      { id: 'egg', label: 'Egg', grams: 6, description: '', diet: 'egg' },
      { id: 'chicken', label: '100g Chicken', grams: 27, description: '', diet: 'non-veg' },
    ];

    it('returns only veg presets when diet is veg', () => {
      const result = presetsForDiet(testPresets, 'veg');
      expect(result.map((p) => p.id)).toEqual(['paneer', 'dal']);
      expect(result.every((p) => p.diet === 'veg')).toBe(true);
    });

    it('returns veg and egg presets when diet is egg', () => {
      const result = presetsForDiet(testPresets, 'egg');
      expect(result.map((p) => p.id)).toEqual(['paneer', 'dal', 'egg']);
      expect(result.some((p) => p.diet === 'non-veg')).toBe(false);
    });

    it('returns all presets when diet is non-veg', () => {
      const result = presetsForDiet(testPresets, 'non-veg');
      expect(result.map((p) => p.id)).toEqual(['paneer', 'dal', 'egg', 'chicken']);
      expect(result.length).toBe(testPresets.length);
    });

    it('returns empty array when given empty presets', () => {
      expect(presetsForDiet([], 'veg')).toEqual([]);
      expect(presetsForDiet([], 'egg')).toEqual([]);
      expect(presetsForDiet([], 'non-veg')).toEqual([]);
    });
  });
});
