import { AssistantSettings } from '../types/assistant';

export interface AssistantRepository {
  getSettings(): Promise<AssistantSettings>;
  saveSettings(settings: AssistantSettings): Promise<void>;
}
