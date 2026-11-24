import React, { useState } from 'react';
import { Suggestion } from '../types/suggestion';

interface SuggestionsCardProps {
  suggestions: Suggestion[];
}

export const SuggestionsCard: React.FC<SuggestionsCardProps> = ({ suggestions }) => {
  // Dismissed IDs held in component state as specified in Phase 5 requirements
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleResetDismissed = () => {
    setDismissedIds(new Set());
  };

  const activeSuggestions = suggestions.filter((s) => !dismissedIds.has(s.id));

  if (activeSuggestions.length === 0 && dismissedIds.size === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '4px' }}>
      {activeSuggestions.length > 0 && (
        <div className="notes" id="notes" role="region" aria-label="Planning Nudges">
          {activeSuggestions.map((suggestion, index) => {
            const isEven = index % 2 === 1;
            return (
              <div
                key={suggestion.id}
                className="note"
                style={isEven ? { transform: 'rotate(0.5deg)', marginLeft: '14px' } : undefined}
              >
                <button
                  type="button"
                  onClick={() => handleDismiss(suggestion.id)}
                  aria-label={`Dismiss note: ${suggestion.title}`}
                >
                  ×
                </button>
                <b>{suggestion.title}</b>
                {suggestion.action && <p>{suggestion.action}</p>}
                <p className="why">Why: {suggestion.reason}</p>
              </div>
            );
          })}
        </div>
      )}

      {dismissedIds.size > 0 && (
        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="chip"
            onClick={handleResetDismissed}
            style={{ fontSize: '12px', minHeight: '36px' }}
          >
            Reset dismissed notes ({dismissedIds.size})
          </button>
        </div>
      )}
    </div>
  );
};
