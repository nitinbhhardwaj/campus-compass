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
});
