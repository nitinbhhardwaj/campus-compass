import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Settings, Trash2, Edit3, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { AssistantIntent, AssistantSettings } from '../types/assistant';
import { AssistantSettingsView } from './AssistantSettingsView';
import { AssistantItemEditor } from './AssistantItemEditor';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantName: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  isSpeechSupported: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  onParse: (text?: string) => Promise<void>;
  isParsing: boolean;
  error: string | null;
  pendingIntents: AssistantIntent[];
  clarifyPrompt: string | null;
  onUpdateIntent: (index: number, updated: AssistantIntent) => void;
  onRemoveIntent: (index: number) => void;
  onConfirmAll: () => Promise<void>;
  onClear: () => void;
  settings: AssistantSettings;
  onSaveSettings: (newSettings: AssistantSettings) => Promise<void>;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({
  isOpen,
  onClose,
  assistantName,
  isListening,
  startListening,
  stopListening,
  isSpeechSupported,
  inputText,
  setInputText,
  onParse,
  isParsing,
  error,
  pendingIntents,
  clarifyPrompt,
  onUpdateIntent,
  onRemoveIntent,
  onConfirmAll,
  onClear,
  settings,
  onSaveSettings,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingIndex !== null) {
          setEditingIndex(null);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, editingIndex, isSettingsOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isParsing) return;
    await onParse(inputText);
  };

  const renderIntentSummary = (intent: AssistantIntent) => {
    switch (intent.type) {
      case 'add_task':
        return {
          badge: 'Task',
          title: intent.title,
          details: `${intent.category.toUpperCase()} • P${intent.priority} • Due: ${intent.dueDate || 'Today'}${intent.recurrence !== 'none' ? ` (${intent.recurrence})` : ''}`,
          color: 'var(--ink)',
        };
      case 'add_expense':
        return {
          badge: 'Expense',
          title: `₹${intent.amountRupees} for ${intent.note}`,
          details: `${intent.category.toUpperCase()} • Date: ${intent.date}`,
          color: '#B04B14',
        };
      case 'add_protein':
        return {
          badge: 'Protein',
          title: `${intent.label} (+${intent.grams}g)`,
          details: 'Logged for Today',
          color: '#166534',
        };
      default:
        return {
          badge: 'Item',
          title: 'Action',
          details: '',
          color: 'var(--muted)',
        };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0',
        background: 'rgba(15, 20, 38, 0.65)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-modal-title"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--surface)',
          borderTop: '2px solid var(--ink)',
          borderLeft: '2px solid var(--ink)',
          borderRight: '2px solid var(--ink)',
          borderBottom: 'none',
          borderRadius: '12px 12px 0 0',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '2px solid var(--ink)',
            background: 'var(--paper)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isListening ? 'var(--danger)' : 'var(--hl)',
                boxShadow: isListening ? '0 0 8px var(--danger)' : 'none',
                transition: 'all 0.2s ease',
              }}
            />
            <h2
              id="assistant-modal-title"
              style={{
                fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              {isSettingsOpen ? 'Assistant Settings' : `${assistantName} Assistant`}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              aria-label="Assistant settings"
              style={{
                width: '44px',
                height: '44px',
                border: 0,
                background: 'none',
                color: 'var(--ink)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={20} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close assistant"
              style={{
                width: '44px',
                height: '44px',
                border: 0,
                background: 'none',
                color: 'var(--ink)',
                fontSize: '26px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSettingsOpen ? (
            <AssistantSettingsView
              settings={settings}
              onSave={onSaveSettings}
              onClose={() => setIsSettingsOpen(false)}
            />
          ) : (
            <>
              {/* Input Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: isListening ? '2px solid var(--danger)' : '2px solid var(--ink)',
                    borderRadius: '6px',
                    background: 'var(--paper)',
                    padding: '4px',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isListening ? 'Listening...' : `Tell ${assistantName} what you did or need to do...`}
                    disabled={isParsing}
                    style={{
                      flex: 1,
                      height: '44px',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text)',
                      fontSize: '15px',
                      outline: 'none',
                    }}
                  />

                  {/* Speech Toggle Button */}
                  {isSpeechSupported && (
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                      style={{
                        width: '44px',
                        height: '44px',
                        border: 'none',
                        borderRadius: '4px',
                        background: isListening ? 'var(--danger)' : 'transparent',
                        color: isListening ? '#ffffff' : 'var(--ink)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  )}

                  {/* Submit / Parse Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isParsing}
                    aria-label="Send utterance"
                    style={{
                      width: '44px',
                      height: '44px',
                      border: 'none',
                      borderRadius: '4px',
                      background: inputText.trim() && !isParsing ? 'var(--ink)' : 'var(--line)',
                      color: inputText.trim() && !isParsing ? 'var(--paper)' : 'var(--muted)',
                      cursor: inputText.trim() && !isParsing ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Send size={18} />
                  </button>
                </div>

                {/* Privacy Disclaimer */}
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    margin: '2px 0 0 2px',
                    lineHeight: 1.4,
                  }}
                >
                  🔒 <em>Your message is sent to an AI service to understand it.</em>
                </p>
              </form>

              {/* Status or Error Messages */}
              {isParsing && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '4px',
                    background: 'var(--paper)',
                    border: '1px dashed var(--ink)',
                    fontSize: '14px',
                    color: 'var(--ink)',
                    textAlign: 'center',
                  }}
                >
                  Analyzing with {assistantName}...
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '4px',
                    background: '#FEF2F2',
                    border: '1px solid #F87171',
                    color: '#991B1B',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Clarify Prompt (Highlighter Note Style) */}
              {clarifyPrompt && (
                <div
                  className="note"
                  style={{
                    background: 'var(--hl)',
                    color: 'var(--hl-text)',
                    border: '2px solid var(--ink)',
                    padding: '14px',
                    borderRadius: '4px',
                    boxShadow: '3px 3px 0 var(--ink)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <HelpCircle size={18} />
                    <b style={{ fontSize: '15px' }}>{assistantName} asks:</b>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', lineHeight: 1.5 }}>
                    {clarifyPrompt}
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.85 }}>
                    <em>Tip: Answer using voice or type in the input above.</em>
                  </p>
                </div>
              )}

              {/* Extracted Intents Confirmation List */}
              {pendingIntents.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3
                      style={{
                        fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
                        fontSize: '16px',
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      Detected Actions ({pendingIntents.length})
                    </h3>
                    <button
                      type="button"
                      onClick={onClear}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      Clear all
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pendingIntents.map((intent, idx) => {
                      const summary = renderIntentSummary(intent);
                      const isEditing = editingIndex === idx;

                      if (isEditing) {
                        return (
                          <AssistantItemEditor
                            key={idx}
                            intent={intent}
                            onSave={(updated) => {
                              onUpdateIntent(idx, updated);
                              setEditingIndex(null);
                            }}
                            onCancel={() => setEditingIndex(null)}
                          />
                        );
                      }

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 14px',
                            border: '1.5px solid var(--line)',
                            borderRadius: '4px',
                            background: 'var(--paper)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  background: 'var(--ink)',
                                  color: 'var(--paper)',
                                }}
                              >
                                {summary.badge}
                              </span>
                              <b style={{ fontSize: '15px', color: 'var(--text)' }}>{summary.title}</b>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{summary.details}</div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setEditingIndex(idx)}
                              aria-label={`Edit ${summary.badge} item`}
                              style={{
                                width: '36px',
                                height: '36px',
                                border: '1px solid var(--line)',
                                borderRadius: '4px',
                                background: 'transparent',
                                color: 'var(--ink)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveIntent(idx)}
                              aria-label={`Remove ${summary.badge} item`}
                              style={{
                                width: '36px',
                                height: '36px',
                                border: '1px solid var(--line)',
                                borderRadius: '4px',
                                background: 'transparent',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Confirm All Button */}
                  <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={onConfirmAll}
                      disabled={isParsing}
                      style={{
                        flex: 1,
                        minHeight: '46px',
                        padding: '10px 16px',
                        borderRadius: '4px',
                        background: 'var(--ink)',
                        color: 'var(--paper)',
                        border: '2px solid var(--ink)',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <CheckCircle2 size={18} />
                      <span>Confirm all ({pendingIntents.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
