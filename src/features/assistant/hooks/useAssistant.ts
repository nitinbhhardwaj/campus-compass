import { useState, useEffect, useCallback } from 'react';
import {
  AssistantIntent,
  AssistantSettings,
  LLMProvider,
  AssistantContext,
} from '../types/assistant';
import { stripAssistantName, validateIntents } from '../logic/intentValidation';
import { FetchLLMProvider } from '../providers/fetchProvider';
import {
  LocalAssistantRepository,
  DEFAULT_ASSISTANT_SETTINGS,
} from '../storage/localAssistantRepository';
import { AssistantRepository } from '../storage/assistantRepository';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';

const defaultProvider = new FetchLLMProvider();
const defaultRepo = new LocalAssistantRepository();

export function useAssistant(
  today: string,
  provider: LLMProvider = defaultProvider,
  repo: AssistantRepository = defaultRepo
) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AssistantSettings>(DEFAULT_ASSISTANT_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingIntents, setPendingIntents] = useState<AssistantIntent[]>([]);
  const [clarifyPrompt, setClarifyPrompt] = useState<string | null>(null);

  const { speak, isSpeaking, cancel: cancelSpeech, isSupported: isTtsSupported } = useSpeechSynthesis();

  // Load Assistant Settings from repository
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const loaded = await repo.getSettings();
        if (isMounted) {
          setSettings(loaded);
        }
      } catch (err) {
        console.error('Failed to load assistant settings:', err);
      } finally {
        if (isMounted) {
          setIsLoadingSettings(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [repo]);

  // Speech Recognition hook
  const speechRecognition = useSpeechRecognition({
    language: settings.recognitionLanguage,
    onResult: (finalTranscript) => {
      setInputText(finalTranscript);
    },
    onError: (errMsg) => {
      setError(errMsg);
    },
  });

  const openAssistant = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  const closeAssistant = useCallback(() => {
    speechRecognition.stopListening();
    cancelSpeech();
    setIsOpen(false);
  }, [speechRecognition, cancelSpeech]);

  const updateSettings = useCallback(
    async (newSettings: AssistantSettings) => {
      setSettings(newSettings);
      await repo.saveSettings(newSettings);
    },
    [repo]
  );

  const parseUtterance = useCallback(
    async (textToParse?: string) => {
      const rawText = textToParse !== undefined ? textToParse : inputText;
      const stripped = stripAssistantName(rawText, settings.assistantName);

      if (!stripped) {
        setError('Please speak or type a request.');
        return;
      }

      speechRecognition.stopListening();
      setIsParsing(true);
      setError(null);

      const context: AssistantContext = {
        today,
        allowedTaskCategories: ['study', 'gym', 'skincare', 'chore', 'other'],
        allowedExpenseCategories: ['food', 'travel', 'rent', 'subscriptions', 'study', 'other'],
      };

      try {
        const rawResponse = await provider.parse(stripped, context);
        const { validIntents, errors: validationErrors } = validateIntents(rawResponse, today);

        if (validIntents.length === 0) {
          setError(
            validationErrors[0] || "I couldn’t detect any actionable items or questions. Please try again."
          );
          return;
        }

        const clarifications = validIntents.filter((i) => i.type === 'clarify');
        const actionable = validIntents.filter((i) => i.type !== 'clarify');

        if (clarifications.length > 0) {
          const clarifyIntent = clarifications[0] as { type: 'clarify'; question: string };
          setClarifyPrompt(clarifyIntent.question);
          if (settings.voiceReplyEnabled) {
            speak(clarifyIntent.question, settings.recognitionLanguage);
          }
        } else {
          setClarifyPrompt(null);
        }

        setPendingIntents(actionable);

        if (actionable.length > 0 && settings.voiceReplyEnabled && clarifications.length === 0) {
          const spokenSummary = `I found ${actionable.length} item${actionable.length > 1 ? 's' : ''} to add. Please confirm them.`;
          speak(spokenSummary, settings.recognitionLanguage);
        }

        setInputText('');
      } catch (err: any) {
        const message = err?.message || 'Failed to understand request. Please try again.';
        setError(message);
      } finally {
        setIsParsing(false);
      }
    },
    [inputText, settings, today, provider, speechRecognition, speak]
  );

  const updateIntent = useCallback((index: number, updated: AssistantIntent) => {
    setPendingIntents((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const removeIntent = useCallback((index: number) => {
    setPendingIntents((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearIntents = useCallback(() => {
    setPendingIntents([]);
    setClarifyPrompt(null);
    setError(null);
    setInputText('');
  }, []);

  const confirmIntents = useCallback(
    async (onExecute: (intents: AssistantIntent[]) => Promise<void>) => {
      if (pendingIntents.length === 0) return;
      try {
        setIsParsing(true);
        await onExecute(pendingIntents);
        setPendingIntents([]);
        setClarifyPrompt(null);
        if (settings.voiceReplyEnabled) {
          speak('All confirmed actions saved successfully.', settings.recognitionLanguage);
        }
        closeAssistant();
      } catch (err: any) {
        setError(err?.message || 'Failed to save confirmed items.');
      } finally {
        setIsParsing(false);
      }
    },
    [pendingIntents, settings, speak, closeAssistant]
  );

  return {
    isOpen,
    openAssistant,
    closeAssistant,
    settings,
    isLoadingSettings,
    isSettingsOpen,
    setIsSettingsOpen,
    updateSettings,
    inputText,
    setInputText,
    isParsing,
    error,
    setError,
    pendingIntents,
    clarifyPrompt,
    setClarifyPrompt,
    parseUtterance,
    updateIntent,
    removeIntent,
    clearIntents,
    confirmIntents,
    // Speech Recognition
    isListening: speechRecognition.isListening,
    startListening: speechRecognition.startListening,
    stopListening: speechRecognition.stopListening,
    isSpeechRecognitionSupported: speechRecognition.isSupported,
    // Speech Synthesis
    isSpeaking,
    isTtsSupported,
  };
}
