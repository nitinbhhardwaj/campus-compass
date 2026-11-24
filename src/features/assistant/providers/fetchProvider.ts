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
      throw new Error(`Assistant parse error (${response.status}): ${errorText || response.statusText}`);
    }

    return await response.json();
  }
}
