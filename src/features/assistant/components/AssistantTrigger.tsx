import React from 'react';
import { Mic } from 'lucide-react';

interface AssistantTriggerProps {
  onClick: () => void;
  assistantName?: string;
}

export const AssistantTrigger: React.FC<AssistantTriggerProps> = ({
  onClick,
  assistantName = 'Nova',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open AI Assistant (${assistantName})`}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 40,
        minWidth: '48px',
        minHeight: '48px',
        padding: '10px 16px',
        borderRadius: '4px',
        background: 'var(--ink)',
        color: 'var(--paper)',
        border: '2px solid var(--paper)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
        fontSize: '15px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '3px solid var(--hl)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '4px',
          background: 'var(--hl)',
          color: 'var(--hl-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Mic size={16} strokeWidth={2.5} />
      </div>
      <span>Ask {assistantName}</span>
    </button>
  );
};
