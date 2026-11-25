import { describe, it, expect, vi } from 'vitest';
import { FetchLLMProvider } from './fetchProvider';
import { MockLLMProvider } from './mockProvider';
import { AssistantContext } from '../types/assistant';

describe('LLM Providers', () => {
  const dummyContext: AssistantContext = {
    today: '2026-11-24',
    allowedTaskCategories: ['study', 'gym', 'skincare', 'chore', 'other'],
    allowedExpenseCategories: ['food', 'travel', 'rent', 'subscriptions', 'study', 'other'],
    dietPreference: 'veg',
  };

  describe('FetchLLMProvider', () => {
    it('calls fetch endpoint with transcript and context and parses response JSON', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ intents: [{ type: 'clarify', question: 'What did you say?' }] }),
      });

      const provider = new FetchLLMProvider({
        endpoint: '/custom/api/parse',
        fetchFn: mockFetch as any,
      });

      const result = await provider.parse('hello nova', dummyContext);
      expect(mockFetch).toHaveBeenCalledWith('/custom/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: 'hello nova', context: dummyContext }),
      });
      expect(result).toEqual({ intents: [{ type: 'clarify', question: 'What did you say?' }] });
    });

    it('throws error on non-ok HTTP response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Missing transcript',
      });

      const provider = new FetchLLMProvider({
        fetchFn: mockFetch as any,
      });

      await expect(provider.parse('', dummyContext)).rejects.toThrow('Assistant parse error (400): Missing transcript');
    });

    it('throws friendly message when assistant model is unavailable (404)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => JSON.stringify({ error: 'assistant model unavailable' }),
      });

      const provider = new FetchLLMProvider({
        fetchFn: mockFetch as any,
      });

      await expect(provider.parse('test', dummyContext)).rejects.toThrow("assistant isn't available right now");
    });
  });

  describe('MockLLMProvider', () => {
    it('returns default empty intents when no canned response or parser is provided', async () => {
      const provider = new MockLLMProvider();
      const res = await provider.parse('test', dummyContext);
      expect(res).toEqual({ intents: [] });
      expect(provider.lastTranscript).toBe('test');
      expect(provider.lastContext).toEqual(dummyContext);
    });

    it('returns canned response when provided', async () => {
      const canned = { intents: [{ type: 'add_protein', label: '2 eggs', grams: 12 }] };
      const provider = new MockLLMProvider(canned);
      const res = await provider.parse('2 eggs', dummyContext);
      expect(res).toEqual(canned);
    });

    it('uses custom parser function when set', async () => {
      const provider = new MockLLMProvider();
      provider.setParser((transcript) => ({
        intents: [{ type: 'clarify', question: `Clarify: ${transcript}` }],
      }));

      const res = (await provider.parse('do chore', dummyContext)) as any;
      expect(res.intents[0].question).toBe('Clarify: do chore');
    });
  });
});
