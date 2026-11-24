import { describe, it, expect, beforeEach } from 'vitest';
import { LocalAssistantRepository, DEFAULT_ASSISTANT_SETTINGS } from './localAssistantRepository';

describe('LocalAssistantRepository', () => {
  let mockStorage: Record<string, string> = {};
  const testKey = 'test_assistant_settings';
  let repo: LocalAssistantRepository;

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
    repo = new LocalAssistantRepository(testKey);
  });

  it('returns default settings when storage is empty', async () => {
    const settings = await repo.getSettings();
    expect(settings).toEqual(DEFAULT_ASSISTANT_SETTINGS);
  });

  it('saves and retrieves updated settings', async () => {
    await repo.saveSettings({
      assistantName: 'Aura',
      voiceReplyEnabled: true,
      recognitionLanguage: 'en-US',
    });

    const settings = await repo.getSettings();
    expect(settings).toEqual({
      assistantName: 'Aura',
      voiceReplyEnabled: true,
      recognitionLanguage: 'en-US',
    });
  });

  it('recovers gracefully from corrupted JSON in localStorage', async () => {
    mockStorage[testKey] = 'invalid-json{{{';
    const settings = await repo.getSettings();
    expect(settings).toEqual(DEFAULT_ASSISTANT_SETTINGS);
  });

  it('preserves defaults for missing fields in stored JSON', async () => {
    mockStorage[testKey] = JSON.stringify({ assistantName: 'Custom' });
    const settings = await repo.getSettings();
    expect(settings.assistantName).toBe('Custom');
    expect(settings.voiceReplyEnabled).toBe(false);
    expect(settings.recognitionLanguage).toBe('en-IN');
  });
});
