# Campus Compass

> A context-aware daily planner for college students: study, gym, protein, expenses, and chores in one prioritized **Today** view. Built with code quality, testability, and explainability as first-class priorities.

---

## 🏛️ Architecture & Interview Defense Guide

When discussing Campus Compass in interviews, the core themes are **Domain-Driven Bounded Contexts**, **Dependency Inversion (DIP)**, **Integer-Exact Financial Computation**, **Pure Functional Rule Engines**, and **Future-Proof Local-First Persistence**.

### 1. Swappable Async Repository Pattern (`TaskRepository`, `ProteinRepository`, `ExpenseRepository`)
- **Decision:** UI components and hooks interact exclusively with abstract repository interfaces returning `Promise<T>` (`LocalStorageTaskRepository`, `LocalStorageProteinRepository`, and `LocalStorageExpenseRepository`).
- **Interview Defense:** "Local-first now, Supabase later." In early development, `localStorage` provides immediate zero-config iteration. Because all repository methods return `Promise`, swapping to Supabase, IndexedDB, or an external REST API requires writing a new class implementing the interface. Zero React components or hooks require refactoring.

### 2. Dependency Inversion in the Suggestion Engine (`DaySnapshot` & `buildDaySnapshot.ts`)
- **Decision:** `src/features/suggestions` is completely isolated: it does **NOT** import from `tasks`, `protein`, or `expenses`. Instead, it defines its own input contract (`DaySnapshot`) consisting exclusively of primitive facts. A single adapter, `src/app/buildDaySnapshot.ts`, reads from the three domain modules and maps them to `DaySnapshot`.
- **Interview Defense:** "Dependency Inversion Principle (DIP) & Hexagonal Architecture." The core rule engine does not know that Tasks, ProteinEntries, or Expenses exist as storage entities. It depends only on an abstract snapshot of facts (`hour`, `nearestP1StudyDueDaysAway`, `foodBudgetUsedPercent`). The application adapter (`buildDaySnapshot.ts`) acts as an anti-corruption layer. If the internal schema of tasks or expenses changes, only the adapter is updated; the suggestion engine and its test suite remain untouched.

### 3. Pure Business Logic & Rule Engine
- **Decision:** Every suggestion rule is an independent pure function `(snapshot: DaySnapshot) => Suggestion | null`. The engine runs all rules, sorts by severity (`warning` > `nudge` > `info`), and caps output at the top 3 suggestions.
- **Interview Defense:** "Deterministic, explainable heuristics." Every suggestion includes an explicit `reason` string referencing the exact triggering data points (e.g., *"Protein is 45g of 112g (40%) and it is 18:00 (after 6 PM)"*). Nothing is a black box. Pure functions ensure 100% predictable boundary tests (e.g., hour 17 vs 18, 59% vs 60%, 2 vs 3 overdue tasks).

### 4. Integer Paise for Financial Calculations (Why Never Floats)
- **Decision:** All monetary amounts (`amountPaise`, `monthlyBudgetPaise`, `categoryBudgetsPaise`) are stored and computed strictly as **integer paise** (1 Rupee = 100 paise), never binary floating-point numbers. Conversion to INR is performed strictly at the display boundary.
- **Interview Defense:** "Eliminating IEEE 754 precision bugs." Binary floating-point arithmetic cannot precisely represent base-10 fractions (e.g., `0.1 + 0.2 === 0.30000000000000004`). In financial apps, recurring float addition and subtraction lead to accumulating rounding discrepancies, broken balance checks, and off-by-one paise errors. `rupeeStringToPaise` uses string splitting and integer padding to convert inputs like `"12.5"` to `1250` paise without touching `parseFloat`.

### 5. Avoiding the UTC Date Bug (`date.toISOString()`)
- **Decision:** Dates are standardized as local `YYYY-MM-DD` strings. We deliberately avoid `date.toISOString().split('T')[0]`.
- **Interview Defense:** `toISOString()` returns the timestamp in UTC (GMT+0). If a student in Tokyo (+09:00), Mumbai (+05:30), or Los Angeles (-08:00) opens the app near midnight, UTC may be the next or previous day, causing today's items to falsely disappear or appear overdue. `formatLocalDate()` formats using the user's local year, month, and day.

### 6. Per-Date Recurrence Completion (`completedDates: string[]`)
- **Decision:** Recurring tasks (daily, weekly) track completion in a `completedDates: string[]` array, while non-recurring tasks use a boolean `completed` flag.
- **Interview Defense:** For a daily task (e.g. "Morning Gym"), marking it done today should not mark it done tomorrow. By tracking completion dates per day, daily tasks reset cleanly on subsequent days while preserving historical completion data.

### 7. Overdue Task Surfacing & Priority Sorting
- **Decision:** Incomplete past tasks are categorized as **Overdue** and surfaced in the Today view rather than dropped. The sorting algorithm enforces:
  1. Incomplete tasks before completed tasks (even a low-priority incomplete task comes before a completed high-priority task).
  2. Priority order: `1 (High) -> 2 (Medium) -> 3 (Low)`.
  3. Overdue urgency: Overdue tasks precede on-time tasks at equal priority.
- **Interview Defense:** A planner that silently drops yesterday's unfinished work causes missed deadlines. Surfacing overdue tasks keeps college students accountable while maintaining a clean, prioritized list.

### 8. Habit Streak Calculation (`computeStreak`)
- **Decision:** Streaks are computed dynamically from `completedDates: string[]` relative to `today: string`.
- **Interview Defense:** "Respecting the user's active day." If a student opens the app at 8:00 AM, today's workout has not yet been logged. A naive streak counter would reset to 0 because today is missing. Our pure `computeStreak` checks whether yesterday was completed: if yes, yesterday's streak is preserved as active pending today. If yesterday was missed and today is incomplete, the streak breaks to 0. Completing today restarts the streak at 1.

### 9. Component-Level Dismiss State
- **Decision:** Suggestion dismissals are managed in React component state (`dismissedIds: Set<string>`) rather than polluting domain databases.
- **Interview Defense:** Nudges are ephemeral planning hints for the active session. If the user dismisses a nudge, it stays hidden for their current flow, with an option to reset dismissed items. Persisting dismissals to storage would introduce unwanted session-state coupling in domain entities.

---

## 🛠️ How to Add a New Suggestion Rule

Adding a new rule to the engine is clean and modular:

1. **Write the Rule:**
   Create a pure function in `src/features/suggestions/logic/rules.ts`:
   ```typescript
   export function ruleHydrationReminder(snapshot: DaySnapshot): Suggestion | null {
     if (snapshot.gym.isGymPendingToday && snapshot.hour >= 14) {
       return {
         id: 'rule-hydration',
         severity: 'info',
         title: 'Midday Hydration',
         reason: 'Gym session planned for today and it is past 2 PM.',
         action: 'Drink a glass of water to prepare for your workout.',
       };
     }
     return null;
   }
   ```
2. **Extend Snapshot (if new primitive facts are required):**
   Add the field to `DaySnapshot` in `src/features/suggestions/types/suggestion.ts` and compute it in `src/app/buildDaySnapshot.ts`.
3. **Register the Rule:**
   Add the function to `ALL_RULES` array in `src/features/suggestions/logic/engine.ts`.
4. **Add Unit Tests:**
   Add tests in `src/features/suggestions/logic/engine.test.ts` verifying when it triggers, when it doesn't, and exact boundary cases.

---

## 📁 Clean Folder Structure

```
src/
├── app/                        # Application composition & anti-corruption adapters
│   ├── buildDaySnapshot.ts     # Adapter: maps Tasks, Protein, Expenses -> DaySnapshot (DIP)
│   └── buildDaySnapshot.test.ts # Adapter integration tests
├── components/                 # Reusable generic UI elements (Button, Card, Badge, Modal)
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Modal.tsx
├── features/
│   ├── tasks/                  # Tasks bounded context
│   │   ├── components/         # TodayHeader, TaskList, TaskItem, TaskForm, CategoryFilter, WeeklySummaryCard
│   │   ├── hooks/              # useTasks.ts
│   │   └── logic/              # taskLogic.ts & taskLogic.test.ts (28 tests)
│   ├── protein/                # Protein tracking bounded context
│   │   ├── constants/          # presets.ts (8 food presets)
│   │   ├── types/              # ProteinEntry, ProteinSettings
│   │   ├── logic/              # proteinLogic.ts & proteinLogic.test.ts (17 tests)
│   │   ├── hooks/              # useProtein.ts
│   │   └── components/         # ProteinCard, ProteinQuickAdd, ProteinEntryList, ProteinSettingsModal
│   ├── expenses/               # Expense tracking bounded context
│   │   ├── types/              # Expense, ExpenseSettings, ExpenseCategory
│   │   ├── logic/              # expenseLogic.ts & expenseLogic.test.ts (15 tests)
│   │   ├── hooks/              # useExpenses.ts
│   │   └── components/         # ExpenseCard, ExpenseForm, ExpenseList, ExpenseSettingsModal
│   └── suggestions/            # Rule-based suggestion engine (zero imports from other features)
│       ├── types/              # DaySnapshot, Suggestion, SuggestionSeverity
│       ├── logic/              # rules.ts (6 pure rules), engine.ts (ranking & capping)
│       │   └── engine.test.ts  # 24 boundary and ordering tests
│       └── components/         # SuggestionsCard.tsx (nudge presentation with dismiss state)
├── lib/                        # Cross-cutting infrastructure
│   ├── storage/                # Swappable async storage adapters
│   │   ├── taskRepository.ts & localTaskRepository.ts (4 tests)
│   │   ├── proteinRepository.ts & localProteinRepository.ts (4 tests)
│   │   └── expenseRepository.ts & localExpenseRepository.ts (4 tests)
│   └── dateUtils.ts            # Local timezone date & month navigation helpers
├── types/                      # Shared top-level contracts
│   └── task.ts
├── App.tsx                     # Mobile-first unified student dashboard
├── main.tsx                    # React bootstrap entrypoint
└── index.css                   # Tailwind CSS styling
```

---

## 🧪 Testing

```bash
# Run full unit test suite (97 tests across all domain engines, rules, and repositories)
npm run test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- **Suggestion Engine & Rules (24 tests):**
  - Rule 1 (Deadline pressure): trigger $\le 2$ days, boundary 2 vs 3 days, no P1 task.
  - Rule 2 (Protein evening low): hour 17 vs 18 boundary, 59% vs 60% boundary, budget-constrained vs standard suggestion text.
  - Rule 3 (Food budget warning): 79% vs 80% boundary, warning status $> 100\%$.
  - Rule 4 (Gym at risk): pending gym at hour 17 vs 16 boundary, deadline pressure correlation.
  - Rule 5 (Overdue pile-up): 2 vs 3 overdue tasks boundary.
  - Rule 6 (Balance check): 0 gym and 4 vs 5 study completions boundary.
  - Engine tests: severity ranking (`warning` $>$ `nudge` $>$ `info`), capping at max 3 suggestions, empty list when on track.
- **Adapter (1 test):** `buildDaySnapshot` end-to-end mapping from domain entities to plain snapshot.
- **Tasks Logic (28 tests):** Daily recurrence across days, weekly recurrence rules, overdue tasks, priority sorting, category filtering, weekly summary aggregations, habit streaks.
- **Protein Logic (17 tests):** Goal calculation, total intake, remaining protein, capped display percentage, sorting, settings validation.
- **Expenses Logic (15 tests):** Float-safe string-to-paise parser, INR formatting, monthly totals, category totals, remaining budget, uncapped budget percentages, budget status transitions.
- **Repositories (12 tests):** Seed data loading, async CRUD operations for Task, Protein, and Expense LocalStorage adapters.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```
