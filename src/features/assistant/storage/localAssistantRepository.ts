import { AssistantSettings } from '../types/assistant';
import { AssistantRepository } from './assistantRepository';

export const ASSISTANT_SETTINGS_KEY = 'campus_compass_assistant_settings_v1';

export const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
  assistantName: 'Nova',
  voiceReplyEnabled: false,
  recognitionLanguage: 'en-IN',
};

export class LocalAssistantRepository implements AssistantRepository {
  private key: string;

  constructor(key = ASSISTANT_SETTINGS_KEY) {
    this.key = key;
  }

  async getSettings(): Promise<AssistantSettings> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { ...DEFAULT_ASSISTANT_SETTINGS };
      }
      const raw = window.localStorage.getItem(this.key);
      if (!raw) {
        return { ...DEFAULT_ASSISTANT_SETTINGS };
      }
      const parsed = JSON.parse(raw);
      return {
        assistantName:
          typeof parsed.assistantName === 'string' && parsed.assistantName.trim()
            ? parsed.assistantName.trim()
            : DEFAULT_ASSISTANT_SETTINGS.assistantName,
        voiceReplyEnabled: Boolean(parsed.voiceReplyEnabled),
        recognitionLanguage:
          typeof parsed.recognitionLanguage === 'string' && parsed.recognitionLanguage.trim()
            ? parsed.recognitionLanguage.trim()
            : DEFAULT_ASSISTANT_SETTINGS.recognitionLanguage,
      };
    } catch {
      return { ...DEFAULT_ASSISTANT_SETTINGS };
    }
  }

  async saveSettings(settings: AssistantSettings): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.key, JSON.stringify(settings));
      }
    } catch (err) {
      console.error('Failed to save assistant settings to localStorage', err);
    }
  }
}
