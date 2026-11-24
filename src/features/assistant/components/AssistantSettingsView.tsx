import React, { useState } from 'react';
import { AssistantSettings } from '../types/assistant';

interface AssistantSettingsViewProps {
  settings: AssistantSettings;
  onSave: (newSettings: AssistantSettings) => Promise<void>;
  onClose: () => void;
}

export const AssistantSettingsView: React.FC<AssistantSettingsViewProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(settings.assistantName);
  const [voiceReply, setVoiceReply] = useState(settings.voiceReplyEnabled);
  const [language, setLanguage] = useState(settings.recognitionLanguage);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        assistantName: name.trim() || 'Nova',
        voiceReplyEnabled: voiceReply,
        recognitionLanguage: language,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label
          htmlFor="assistant-name"
          style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}
        >
          Assistant Wake Name
        </label>
        <input
          id="assistant-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nova"
          style={{
            width: '100%',
            height: '44px',
            padding: '8px 12px',
            border: '2px solid var(--line)',
            borderRadius: '4px',
            background: 'var(--paper)',
            color: 'var(--text)',
            fontSize: '15px',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="recognition-language"
          style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}
        >
          Speech Recognition Language
        </label>
        <select
          id="recognition-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            width: '100%',
            height: '44px',
            padding: '8px 12px',
            border: '2px solid var(--line)',
            borderRadius: '4px',
            background: 'var(--paper)',
            color: 'var(--text)',
            fontSize: '15px',
          }}
        >
          <option value="en-IN">English (India) - en-IN</option>
          <option value="en-US">English (United States) - en-US</option>
          <option value="en-GB">English (United Kingdom) - en-GB</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
        <input
          id="voice-reply-toggle"
          type="checkbox"
          checked={voiceReply}
          onChange={(e) => setVoiceReply(e.target.checked)}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
        <label
          htmlFor="voice-reply-toggle"
          style={{ fontSize: '14px', color: 'var(--text)', cursor: 'pointer', fontWeight: 500 }}
        >
          Speak responses & confirmations aloud (Text-to-Speech)
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
        <button
          type="button"
          onClick={onClose}
          className="chip"
          style={{ minHeight: '44px', padding: '0 16px' }}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            minHeight: '44px',
            padding: '0 20px',
            background: 'var(--ink)',
            color: 'var(--paper)',
            border: '2px solid var(--ink)',
            borderRadius: '4px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};
