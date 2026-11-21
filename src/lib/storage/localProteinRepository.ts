import { ProteinEntry, ProteinSettings } from '../../features/protein/types/protein';
import { ProteinRepository } from './proteinRepository';
import { defaultGoalFromWeight } from '../../features/protein/logic/proteinLogic';

const ENTRIES_KEY = 'campus_compass_protein_entries_v1';
const SETTINGS_KEY = 'campus_compass_protein_settings_v1';

export const DEFAULT_PROTEIN_SETTINGS: ProteinSettings = {
  bodyWeightKg: 70,
  goalGrams: defaultGoalFromWeight(70), // 112g
};

export const INITIAL_SEED_PROTEIN_ENTRIES: ProteinEntry[] = [
  {
    id: 'seed-protein-1',
    date: '2026-11-21',
    grams: 24,
    label: 'Whey Scoop (Post-workout)',
    createdAt: '2026-11-21T08:30:00.000Z',
  },
  {
    id: 'seed-protein-2',
    date: '2026-11-21',
    grams: 18,
    label: '100g Paneer (Lunch)',
    createdAt: '2026-11-21T13:15:00.000Z',
  },
  {
    id: 'seed-protein-3',
    date: '2026-11-20',
    grams: 52,
    label: '100g Soya Chunks (Dinner)',
    createdAt: '2026-11-20T20:00:00.000Z',
  },
];

export class LocalStorageProteinRepository implements ProteinRepository {
  private entriesKey: string;
  private settingsKey: string;

  constructor(entriesKey = ENTRIES_KEY, settingsKey = SETTINGS_KEY) {
    this.entriesKey = entriesKey;
    this.settingsKey = settingsKey;
  }

  private readEntries(): ProteinEntry[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [...INITIAL_SEED_PROTEIN_ENTRIES];
      }
      const raw = window.localStorage.getItem(this.entriesKey);
      if (!raw) {
        this.writeEntries(INITIAL_SEED_PROTEIN_ENTRIES);
        return [...INITIAL_SEED_PROTEIN_ENTRIES];
      }
      return JSON.parse(raw) as ProteinEntry[];
    } catch (err) {
      console.error('Failed to read protein entries from localStorage:', err);
      return [];
    }
  }

  private writeEntries(entries: ProteinEntry[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.entriesKey, JSON.stringify(entries));
      }
    } catch (err) {
      console.error('Failed to write protein entries to localStorage:', err);
    }
  }

  private readSettings(): ProteinSettings {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { ...DEFAULT_PROTEIN_SETTINGS };
      }
      const raw = window.localStorage.getItem(this.settingsKey);
      if (!raw) {
        this.writeSettings(DEFAULT_PROTEIN_SETTINGS);
        return { ...DEFAULT_PROTEIN_SETTINGS };
      }
      return JSON.parse(raw) as ProteinSettings;
    } catch (err) {
      console.error('Failed to read protein settings from localStorage:', err);
      return { ...DEFAULT_PROTEIN_SETTINGS };
    }
  }

  private writeSettings(settings: ProteinSettings): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      }
    } catch (err) {
      console.error('Failed to write protein settings to localStorage:', err);
    }
  }

  async getEntries(): Promise<ProteinEntry[]> {
    return Promise.resolve(this.readEntries());
  }

  async saveEntry(entry: ProteinEntry): Promise<ProteinEntry> {
    const entries = this.readEntries();
    const existingIndex = entries.findIndex((e) => e.id === entry.id);
    let updated: ProteinEntry[];

    if (existingIndex >= 0) {
      updated = [...entries];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...entries];
    }

    this.writeEntries(updated);
    return Promise.resolve(entry);
  }

  async deleteEntry(id: string): Promise<void> {
    const entries = this.readEntries();
    const filtered = entries.filter((e) => e.id !== id);
    this.writeEntries(filtered);
    return Promise.resolve();
  }

  async getSettings(): Promise<ProteinSettings> {
    return Promise.resolve(this.readSettings());
  }

  async saveSettings(settings: ProteinSettings): Promise<ProteinSettings> {
    this.writeSettings(settings);
    return Promise.resolve(settings);
  }
}

// Default singleton instance for the app
export const proteinRepository = new LocalStorageProteinRepository();
