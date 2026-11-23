import { DaySnapshot, Suggestion, SuggestionSeverity } from '../types/suggestion';
import {
  ruleDeadlinePressure,
  ruleProteinLowInEvening,
  ruleFoodBudgetWarning,
  ruleGymAtRisk,
  ruleOverduePileUp,
  ruleBalanceCheck,
} from './rules';

const ALL_RULES = [
  ruleDeadlinePressure,
  ruleProteinLowInEvening,
  ruleFoodBudgetWarning,
  ruleGymAtRisk,
  ruleOverduePileUp,
  ruleBalanceCheck,
] as const;

const SEVERITY_WEIGHT: Record<SuggestionSeverity, number> = {
  warning: 3,
  nudge: 2,
  info: 1,
};

/**
 * Pure function: Runs all rules against the snapshot facts,
 * filters out nulls, sorts by severity (warning > nudge > info) then rule order,
 * and caps output at the top 3 highest-priority suggestions.
 */
export function generateSuggestions(
  snapshot: DaySnapshot,
  maxResults = 3
): Suggestion[] {
  const activeSuggestions: Suggestion[] = [];

  for (const rule of ALL_RULES) {
    const suggestion = rule(snapshot);
    if (suggestion !== null) {
      activeSuggestions.push(suggestion);
    }
  }

  // Stable sort: higher severity weight first; preserve rule declaration order for ties
  activeSuggestions.sort((a, b) => {
    return SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
  });

  return activeSuggestions.slice(0, maxResults);
}
