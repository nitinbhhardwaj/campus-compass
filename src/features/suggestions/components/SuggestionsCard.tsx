import React, { useState } from 'react';
import { Suggestion, SuggestionSeverity } from '../types/suggestion';
import { Card } from '../../../components/Card';
import { Badge, BadgeProps } from '../../../components/Badge';
import { Sparkles, CheckCircle2, X, Lightbulb } from 'lucide-react';

interface SuggestionsCardProps {
  suggestions: Suggestion[];
}

const SEVERITY_BADGES: Record<
  SuggestionSeverity,
  { label: string; variant: BadgeProps['variant'] }
> = {
  warning: { label: 'Priority', variant: 'rose' },
  nudge: { label: 'Nudge', variant: 'amber' },
  info: { label: 'Balance', variant: 'indigo' },
};

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

  return (
    <Card className="p-4 mb-4 bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/30 border-indigo-100/80 shadow-xs">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 tracking-tight">
              Compass Insights & Nudges
            </h2>
          </div>
        </div>

        {activeSuggestions.length > 0 && (
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            {activeSuggestions.length} active
          </span>
        )}
      </div>

      {activeSuggestions.length === 0 ? (
        <div className="py-3 px-3 rounded-xl bg-white/70 border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="font-medium">Nothing to adjust, you're on track.</span>
          </div>

          {dismissedIds.size > 0 && (
            <button
              type="button"
              onClick={handleResetDismissed}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5"
            >
              Reset dismissed ({dismissedIds.size})
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5" role="region" aria-label="Active Suggestions">
          {activeSuggestions.map((suggestion) => {
            const badgeMeta =
              SEVERITY_BADGES[suggestion.severity] || SEVERITY_BADGES.info;

            return (
              <div
                key={suggestion.id}
                className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs transition-all hover:border-indigo-200"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant={badgeMeta.variant} className="text-[10px] px-1.5 py-0">
                      {badgeMeta.label}
                    </Badge>
                    <span className="text-xs font-bold text-slate-900">
                      {suggestion.title}
                    </span>
                  </div>

                  {/* Accessible 44px hit-target dismiss button */}
                  <button
                    type="button"
                    onClick={() => handleDismiss(suggestion.id)}
                    className="relative p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 after:content-[''] after:absolute after:-inset-2"
                    aria-label={`Dismiss suggestion: ${suggestion.title}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Plain Explainable Reason */}
                <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                  {suggestion.reason}
                </p>

                {/* Concrete Planning Action */}
                {suggestion.action && (
                  <div className="flex items-start gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] font-medium text-slate-800">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{suggestion.action}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
