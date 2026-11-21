import { ProteinEntry, ProteinSettings } from '../../features/protein/types/protein';

/**
 * Abstract Repository Interface for Protein tracking persistence.
 * Decouples the UI from localStorage and enables future swapping
 * with Supabase or an offline-first database.
 */
export interface ProteinRepository {
  getEntries(): Promise<ProteinEntry[]>;
  saveEntry(entry: ProteinEntry): Promise<ProteinEntry>;
  deleteEntry(id: string): Promise<void>;
  getSettings(): Promise<ProteinSettings>;
  saveSettings(settings: ProteinSettings): Promise<ProteinSettings>;
}
