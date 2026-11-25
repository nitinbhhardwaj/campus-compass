import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from './parse';

describe('api/parse handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns 404 with "assistant model unavailable" when Google API returns 404', async () => {
    process.env.GEMINI_API_KEY = 'test-secret-key';
    process.env.GEMINI_MODEL = 'gemini-nonexistent';

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock global fetch to return 404 from Google
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: { message: 'models/gemini-nonexistent is not found' } }),
    }));

    const req = new Request('http://localhost/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'add study task',
        context: { today: '2026-11-25' },
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data).toEqual({ error: 'assistant model unavailable' });

    // Verify model was logged without logging the API key
    expect(consoleErrorSpy).toHaveBeenCalledWith('assistant model unavailable: gemini-nonexistent');
    const loggedCalls = consoleErrorSpy.mock.calls.flat().join(' ');
    expect(loggedCalls).not.toContain('test-secret-key');
  });

  it('falls back to local heuristic parsing when GEMINI_API_KEY is absent even if other keys are present', async () => {
    delete process.env.GEMINI_API_KEY;
    // Set non-Gemini keys that should be ignored
    (process.env as Record<string, string | undefined>).OPENAI_API_KEY = 'openai-key';
    (process.env as Record<string, string | undefined>).LLM_API_KEY = 'other-key';

    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const req = new Request('http://localhost/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'spent 120 on lunch',
        context: { today: '2026-11-25' },
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);

    // fetch must not be called when GEMINI_API_KEY is absent
    expect(fetchSpy).not.toHaveBeenCalled();

    const data = await res.json();
    expect(data.intents).toBeDefined();
    expect(data.intents.length).toBeGreaterThan(0);
    expect(data.intents[0]).toMatchObject({
      type: 'add_expense',
      amountRupees: '120',
      category: 'food',
    });
  });

  it('calls Gemini endpoint with x-goog-api-key header and parses successful candidate output', async () => {
    process.env.GEMINI_API_KEY = 'gemini-secret-test-key';
    process.env.GEMINI_MODEL = 'gemini-3.8-flash';

    const expectedPayload = {
      intents: [
        {
          type: 'add_task',
          title: 'Submit DBMS assignment',
          category: 'Academics',
          priority: 2,
          dueDate: '2026-11-26',
          recurrence: 'none',
        },
      ],
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(expectedPayload),
                },
              ],
            },
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const req = new Request('http://localhost/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'submit DBMS assignment tomorrow',
        context: { today: '2026-11-25' },
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [fetchUrl, fetchOptions] = fetchSpy.mock.calls[0];
    expect(fetchUrl).toContain('/models/gemini-3.8-flash:generateContent');
    expect(fetchOptions.headers['x-goog-api-key']).toBe('gemini-secret-test-key');

    const data = await res.json();
    expect(data).toEqual(expectedPayload);
  });

  it('gracefully falls back to heuristic parsing if remote Gemini call fails with server error', async () => {
    process.env.GEMINI_API_KEY = 'gemini-secret-test-key';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }));

    const req = new Request('http://localhost/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'had 2 eggs',
        context: { today: '2026-11-25' },
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.intents).toBeDefined();
    expect(data.intents[0]).toMatchObject({
      type: 'add_protein',
      label: '2 eggs',
      grams: 12,
    });
  });
});
