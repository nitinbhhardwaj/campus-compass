import { AssistantContext, LLMProvider } from '../types/assistant';

export interface FetchLLMProviderOptions {
  endpoint?: string;
  fetchFn?: typeof fetch;
}

export class FetchLLMProvider implements LLMProvider {
  private endpoint: string;
  private fetchFn: typeof fetch;

  constructor(options?: FetchLLMProviderOptions) {
    this.endpoint = options?.endpoint || '/api/parse';
    this.fetchFn = options?.fetchFn || (typeof window !== 'undefined' ? window.fetch.bind(window) : fetch);
  }

  async parse(transcript: string, context: AssistantContext): Promise<unknown> {
    const response = await this.fetchFn(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript, context }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let parsedError: string | null = null;
      try {
        const errorJson = JSON.parse(errorText);
        parsedError = errorJson.error;
      } catch {}

      if (parsedError === 'assistant model unavailable' || response.status === 404) {
        throw new Error("assistant isn't available right now");
      }

      throw new Error(`Assistant parse error (${response.status}): ${parsedError || errorText || response.statusText}`);
    }

    return await response.json();
  }
}
