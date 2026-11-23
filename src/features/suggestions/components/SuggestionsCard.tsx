import React, { useState } from 'react';
import { Suggestion, SuggestionSeverity } from '../types/suggestion';
import { Card } from '../../../components/Card';
import { Badge, BadgeProps } from '../../../components/Badge';
import { IconButton } from '../../../components/IconButton';
import {
  Sparkles,
  CheckCircle2,
  X,
  Lightbulb,
  AlertTriangle,
  AlertOctagon,
  Info,
  RotateCcw,
} from 'lucide-react';

interface SuggestionsCardProps {
  suggestions: Suggestion[];
}

interface SeverityConfig {
  label: string;
  badgeVariant: BadgeProps['variant'];
  borderAccent: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

const SEVERITY_CONFIG: Record<SuggestionSeverity, SeverityConfig> = {
  warning: {
    label: 'Priority',
    badgeVariant: 'rose',
    borderAccent: 'border-l-rose-500',
    icon: AlertOctagon,
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  nudge: {
    label: 'Nudge',
    badgeVariant: 'amber',
    borderAccent: 'border-l-amber-500',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    label: 'Balance',
    badgeVariant: 'indigo',
    borderAccent: 'border-l-indigo-500',
    icon: Info,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
};

export const SuggestionsCard: React.FC<SuggestionsCardProps> = ({ suggestions }) => {
  // Dismissed IDs held in component state as specified in Phase 5 requirements
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissingIds((prev) => new Set(prev).add(id));
    // Smooth transition animation before removing from rendered DOM
    setTimeout(() => {
      setDismissedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200);
  };

  const handleResetDismissed = () => {
    setDismissingIds(new Set());
    setDismissedIds(new Set());
  };

  const activeSuggestions = suggestions.filter((s) => !dismissedIds.has(s.id));

  return (
    <Card className="p-4 sm:p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Compass Insights & Nudges
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic, explainable daily suggestions
            </p>
          </div>
        </div>

        {activeSuggestions.length > 0 && (
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200/80 dark:border-indigo-800/60 tabular-nums">
            {activeSuggestions.length} active
          </span>
        )}
      </div>

      {activeSuggestions.length === 0 ? (
        <div className="py-4 px-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-medium">All clear! You're completely on track today.</span>
          </div>

          {dismissedIds.size > 0 && (
            <button
              type="button"
              onClick={handleResetDismissed}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ({dismissedIds.size})</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3" role="region" aria-label="Active Suggestions">
          {activeSuggestions.map((suggestion) => {
            const config = SEVERITY_CONFIG[suggestion.severity] || SEVERITY_CONFIG.info;
            const IconComponent = config.icon;
            const isDismissing = dismissingIds.has(suggestion.id);

            return (
              <div
                key={suggestion.id}
                className={`p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 border-l-4 ${config.borderAccent} shadow-2xs transition-all duration-200 ease-out hover:shadow-xs ${
                  isDismissing ? 'opacity-0 -translate-y-2 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'
                }`}
              >
                {/* Title & Severity Badge & Dismiss */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={config.badgeVariant} className="text-[10px] px-2 py-0.5">
                      {config.label}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <IconComponent className={`w-3.5 h-3.5 ${config.iconColor} flex-shrink-0`} />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {suggestion.title}
                      </span>
                    </div>
                  </div>

                  {/* Accessible 44px touch target dismiss */}
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(suggestion.id)}
                    aria-label={`Dismiss suggestion: ${suggestion.title}`}
                    className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 -mt-1 -mr-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </IconButton>
                </div>

                {/* Plain Explainable Reason in Muted Text */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  {suggestion.reason}
                </p>

                {/* Concrete Planning Action as an Interactive Button */}
                {suggestion.action && (
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      Recommendation
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[36px] shadow-2xs"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{suggestion.action}</span>
                    </button>
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
