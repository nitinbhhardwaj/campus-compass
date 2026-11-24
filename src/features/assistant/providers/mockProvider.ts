import { AssistantContext, LLMProvider } from '../types/assistant';

export type MockParserFn = (transcript: string, context: AssistantContext) => Promise<unknown> | unknown;

export class MockLLMProvider implements LLMProvider {
  private cannedResponse?: unknown;
  private customParser?: MockParserFn;
  public lastTranscript?: string;
  public lastContext?: AssistantContext;

  constructor(responseOrParser?: unknown | MockParserFn) {
    if (typeof responseOrParser === 'function') {
      this.customParser = responseOrParser as MockParserFn;
    } else {
      this.cannedResponse = responseOrParser;
    }
  }

  setResponse(response: unknown): void {
    this.cannedResponse = response;
    this.customParser = undefined;
  }

  setParser(parser: MockParserFn): void {
    this.customParser = parser;
    this.cannedResponse = undefined;
  }

  async parse(transcript: string, context: AssistantContext): Promise<unknown> {
    this.lastTranscript = transcript;
    this.lastContext = context;

    if (this.customParser) {
      return await this.customParser(transcript, context);
    }
    return this.cannedResponse ?? { intents: [] };
  }
}
