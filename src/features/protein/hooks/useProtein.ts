import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProteinEntry, ProteinSettings, CreateProteinEntryDTO } from '../types/protein';
import { ProteinRepository } from '../../../lib/storage/proteinRepository';
import { proteinRepository as defaultRepo, DEFAULT_PROTEIN_SETTINGS } from '../../../lib/storage/localProteinRepository';
import {
  totalForDate,
  remainingForDate,
  progressPercent,
  entriesForDate,
} from '../logic/proteinLogic';
import { formatLocalDate } from '../../../lib/dateUtils';

export function useProtein(
  repo: ProteinRepository = defaultRepo,
  today: string = formatLocalDate()
) {
  const [entries, setEntries] = useState<ProteinEntry[]>([]);
  const [settings, setSettings] = useState<ProteinSettings>(DEFAULT_PROTEIN_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedEntries, fetchedSettings] = await Promise.all([
        repo.getEntries(),
        repo.getSettings(),
      ]);
      setEntries(fetchedEntries);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Failed to load protein data:', err);
      setError('Could not load protein tracking data.');
    } finally {
      setIsLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addEntry = async (dto: CreateProteinEntryDTO): Promise<ProteinEntry> => {
    const newEntry: ProteinEntry = {
      ...dto,
      id: `protein_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setEntries((prev) => [newEntry, ...prev]);

    try {
      await repo.saveEntry(newEntry);
      return newEntry;
    } catch (err) {
      console.error('Failed to save protein entry:', err);
      // Rollback on failure
      setEntries((prev) => prev.filter((e) => e.id !== newEntry.id));
      throw err;
    }
  };

  const deleteEntry = async (id: string): Promise<void> => {
    const previous = [...entries];
    // Optimistic UI update
    setEntries((prev) => prev.filter((e) => e.id !== id));

    try {
      await repo.deleteEntry(id);
    } catch (err) {
      console.error('Failed to delete protein entry:', err);
      // Rollback on failure
      setEntries(previous);
      throw err;
    }
  };

  const updateSettings = async (newSettings: ProteinSettings): Promise<void> => {
    const previous = { ...settings };
    setSettings(newSettings);

    try {
      await repo.saveSettings(newSettings);
    } catch (err) {
      console.error('Failed to update protein settings:', err);
      setSettings(previous);
      throw err;
    }
  };

  // Pure derived metrics for today
  const todayEntries = useMemo(() => {
    return entriesForDate(entries, today);
  }, [entries, today]);

  const totalGrams = useMemo(() => {
    return totalForDate(entries, today);
  }, [entries, today]);

  const remainingGrams = useMemo(() => {
    return remainingForDate(entries, settings.goalGrams, today);
  }, [entries, settings.goalGrams, today]);

  const progress = useMemo(() => {
    return progressPercent(totalGrams, settings.goalGrams);
  }, [totalGrams, settings.goalGrams]);

  return {
    entries,
    todayEntries,
    settings,
    totalGrams,
    remainingGrams,
    progress,
    isLoading,
    error,
    today,
    addEntry,
    deleteEntry,
    updateSettings,
    refreshProtein: loadData,
  };
}
