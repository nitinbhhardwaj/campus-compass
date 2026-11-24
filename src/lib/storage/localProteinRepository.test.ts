import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageProteinRepository } from './localProteinRepository';
import { ProteinEntry, ProteinSettings } from '../../features/protein/types/protein';

describe('LocalStorageProteinRepository', () => {
  let mockStorage: Record<string, string> = {};
  const testEntriesKey = 'test_protein_entries_repo';
  const testSettingsKey = 'test_protein_settings_repo';

  beforeEach(() => {
    mockStorage = {};
    (globalThis as unknown as { window: { localStorage: Storage } }).window = {
      localStorage: {
        getItem: (k: string) => mockStorage[k] ?? null,
        setItem: (k: string, v: string) => {
          mockStorage[k] = v;
        },
        removeItem: (k: string) => {
          delete mockStorage[k];
        },
        clear: () => {
          mockStorage = {};
        },
        key: (_index: number) => null,
        length: Object.keys(mockStorage).length,
      } as Storage,
    };
  });

  it('seeds default entries and settings when storage is empty', async () => {
    const repo = new LocalStorageProteinRepository(testEntriesKey, testSettingsKey);
    const entries = await repo.getEntries();
    const settings = await repo.getSettings();

    expect(entries.length).toBeGreaterThan(0);
    expect(settings.bodyWeightKg).toBe(70);
    expect(settings.goalGrams).toBe(112);
    expect(settings.dietPreference).toBe('veg');
  });

  it('saves and retrieves a new protein entry asynchronously', async () => {
    const repo = new LocalStorageProteinRepository(testEntriesKey, testSettingsKey);
    const newEntry: ProteinEntry = {
      id: 'custom-egg-1',
      date: '2026-11-21',
      grams: 12,
      label: '2 Boiled Eggs',
      createdAt: '2026-11-21T09:00:00.000Z',
    };

    const saved = await repo.saveEntry(newEntry);
    expect(saved).toEqual(newEntry);

    const all = await repo.getEntries();
    const found = all.find((e) => e.id === 'custom-egg-1');
    expect(found).toBeDefined();
    expect(found?.grams).toBe(12);
  });

  it('deletes an entry by id', async () => {
    const repo = new LocalStorageProteinRepository(testEntriesKey, testSettingsKey);
    const entry: ProteinEntry = {
      id: 'to-delete-1',
      date: '2026-11-21',
      grams: 20,
      label: 'Snack',
      createdAt: '2026-11-21T10:00:00.000Z',
    };

    await repo.saveEntry(entry);
    await repo.deleteEntry('to-delete-1');

    const all = await repo.getEntries();
    expect(all.some((e) => e.id === 'to-delete-1')).toBe(false);
  });

  it('saves and updates protein settings', async () => {
    const repo = new LocalStorageProteinRepository(testEntriesKey, testSettingsKey);
    const newSettings: ProteinSettings = {
      bodyWeightKg: 75,
      goalGrams: 130, // custom overridden goal
      dietPreference: 'egg',
    };

    await repo.saveSettings(newSettings);
    const retrieved = await repo.getSettings();

    expect(retrieved.bodyWeightKg).toBe(75);
    expect(retrieved.goalGrams).toBe(130);
    expect(retrieved.dietPreference).toBe('egg');
  });

  it('loads old-format settings without dietPreference and defaults to veg', async () => {
    const repo = new LocalStorageProteinRepository(testEntriesKey, testSettingsKey);
    mockStorage[testSettingsKey] = JSON.stringify({
      bodyWeightKg: 65,
      goalGrams: 104,
    });

    const loaded = await repo.getSettings();
    expect(loaded.bodyWeightKg).toBe(65);
    expect(loaded.goalGrams).toBe(104);
    expect(loaded.dietPreference).toBe('veg');
  });
});
