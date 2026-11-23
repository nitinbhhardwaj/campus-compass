# Campus Compass

> A context-aware daily planner for college students: study, gym, protein, expenses, and chores in one prioritized **Today** view. Built with code quality, testability, and explainability as first-class priorities.

---

## 🏛️ Architecture & Interview Defense Guide

When discussing Campus Compass in interviews, the core themes are **Domain-Driven Bounded Contexts**, **Pure Functional Domain Logic**, **Integer-Exact Financial Computation**, and **Future-Proof Local-First Persistence**.

### 1. Swappable Async Repository Pattern (`TaskRepository`, `ProteinRepository`, `ExpenseRepository`)
- **Decision:** UI components and hooks interact exclusively with abstract repository interfaces returning `Promise<T>` (`LocalStorageTaskRepository`, `LocalStorageProteinRepository`, and `LocalStorageExpenseRepository`).
- **Interview Defense:** "Local-first now, Supabase later." In early development, `localStorage` provides immediate zero-config iteration. Because all repository methods return `Promise`, swapping to Supabase, IndexedDB, or an external REST API requires writing a new class implementing the interface. Zero React components or hooks require refactoring.

### 2. Pure Business Logic Engines
- **Decision:** All filtering, sorting, recurrence rules, streaks, weekly aggregations, nutritional metrics, and financial budget calculations are 100% pure functions decoupled from React state, DOM, and `new Date()` calls.
- **Interview Defense:** "Deterministic domain logic is trivial to test and reason about." Passing `today: string` or `yearMonth: string` explicitly into every pure function ensures tests never flake due to machine timezones or execution timestamps. Tests execute in under 250ms using Vitest without DOM emulation overhead.

### 3. Avoiding the UTC Date Bug (`date.toISOString()`)
- **Decision:** Dates are standardized as local `YYYY-MM-DD` strings. We deliberately avoid `date.toISOString().split('T')[0]`.
- **Interview Defense:** `toISOString()` returns the timestamp in UTC (GMT+0). If a student in Tokyo (+09:00), Mumbai (+05:30), or Los Angeles (-08:00) opens the app near midnight, UTC may be the next or previous day, causing today's items to falsely disappear or appear overdue. `formatLocalDate()` formats using the user's local year, month, and day.

### 4. Per-Date Recurrence Completion (`completedDates: string[]`)
- **Decision:** Recurring tasks (daily, weekly) track completion in a `completedDates: string[]` array, while non-recurring tasks use a boolean `completed` flag.
- **Interview Defense:** For a daily task (e.g. "Morning Gym"), marking it done today should not mark it done tomorrow. By tracking completion dates per day, daily tasks reset cleanly on subsequent days while preserving historical completion data.

### 5. Overdue Task Surfacing & Priority Sorting
- **Decision:** Incomplete past tasks are categorized as **Overdue** and surfaced in the Today view rather than dropped. The sorting algorithm enforces:
  1. Incomplete tasks before completed tasks (even a low-priority incomplete task comes before a completed high-priority task).
  2. Priority order: `1 (High) -> 2 (Medium) -> 3 (Low)`.
  3. Overdue urgency: Overdue tasks precede on-time tasks at equal priority.
- **Interview Defense:** A planner that silently drops yesterday's unfinished work causes missed deadlines. Surfacing overdue tasks keeps college students accountable while maintaining a clean, prioritized list.

### 6. Habit Streak Calculation (`computeStreak`)
- **Decision:** Streaks are computed dynamically from `completedDates: string[]` relative to `today: string`.
- **Interview Defense:** "Respecting the user's active day." If a student opens the app at 8:00 AM, today's workout has not yet been logged. A naive streak counter would reset to 0 because today is missing. Our pure `computeStreak` checks whether yesterday was completed: if yes, yesterday's streak is preserved as active pending today. If yesterday was missed and today is incomplete, the streak breaks to 0. Completing today restarts the streak at 1.

### 7. Weekly Aggregation Helper (`getWeeklySummary`)
- **Decision:** Given tasks and an arbitrary date range `[startDate, endDate]`, `getWeeklySummary` pure function projects completion metrics grouped by category.
- **Interview Defense:** Pure analytical projection. Whether tasks are recurring habits or one-off assignments, the function parses historical dates within the week window without needing relational SQL joins or complex state machinery.

### 8. Category Filtering & Empty States
- **Decision:** Category filtering is computed as a pure pipeline stage: `All Tasks -> Today Filter -> Priority Sort -> Category Filter`.
- **Interview Defense:** Composable pure function pipelines. Empty states adapt contextually: if no tasks exist in the selected category (e.g., "Gym"), the UI informs the user ("No gym tasks scheduled for today") and offers a single-click action to view all categories.

### 9. Bounded Context Isolation (`tasks`, `protein`, `expenses`)
- **Decision:** The three domain modules (`tasks`, `protein`, `expenses`) reside in isolated directories under `src/features/` with **zero cross-module imports**.
- **Interview Defense:** "Domain-Driven Design (Bounded Contexts)." Mixing expense or nutrition tracking into the Task model would create an unwieldy God Object polluted with money and macro fields. Decoupled modules allow independent maintenance, scaling, and testing. When the rule-based suggestion engine arrives in future phases ("low protein by evening => suggest snack"; "exam in 2 days => defer chores"), an application orchestrator coordinates across repositories without leaking domain logic between modules.

### 10. Integer Paise for Financial Calculations (Why Never Floats)
- **Decision:** All monetary amounts (`amountPaise`, `monthlyBudgetPaise`, `categoryBudgetsPaise`) are stored and computed strictly as **integer paise** (1 Rupee = 100 paise), never binary floating-point numbers. Conversion to INR is performed strictly at the display boundary.
- **Interview Defense:** "Eliminating IEEE 754 precision bugs." Binary floating-point arithmetic cannot precisely represent base-10 fractions (e.g., `0.1 + 0.2 === 0.30000000000000004`). In financial apps, recurring float addition and subtraction lead to accumulating rounding discrepancies, broken balance checks, and off-by-one paise errors. `rupeeStringToPaise` uses string splitting and integer padding to convert inputs like `"12.5"` to `1250` paise without touching `parseFloat`.

### 11. Budget Warning & Monitoring Logic
- **Decision:** Budget status is evaluated as a pure state transition: `'ok'` (< 80%), `'warning'` (80%–100%), and `'over'` (> 100%).
- **Interview Defense:** Contextual threshold alerts. When overall budget or any individual category budget reaches $\ge 80\%$, the UI surfaces an alert (e.g. "You've used 82% of your food budget") without preachy or financial advice text. Budget usage percentage is uncapped, providing transparency when students are over budget (e.g. 115%).

---

## 📁 Clean Folder Structure

```
src/
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
│   └── expenses/               # Expense tracking bounded context (zero dependency on tasks/protein)
│       ├── types/              # Expense, ExpenseSettings, ExpenseCategory
│       ├── logic/              # expenseLogic.ts & expenseLogic.test.ts (15 tests)
│       ├── hooks/              # useExpenses.ts
│       └── components/
│           ├── ExpenseCard.tsx # Spent vs budget, progress bar, warnings, category breakdown
│           ├── ExpenseForm.tsx # Quick-add expense form (rupee input -> integer paise)
│           ├── ExpenseList.tsx # Month's expense history with delete
│           └── ExpenseSettingsModal.tsx # Overall and per-category budget configuration
├── lib/                        # Cross-cutting infrastructure
│   ├── storage/                # Swappable async storage adapters
│   │   ├── taskRepository.ts & localTaskRepository.ts (4 tests)
│   │   ├── proteinRepository.ts & localProteinRepository.ts (4 tests)
│   │   └── expenseRepository.ts & localExpenseRepository.ts (4 tests)
│   └── dateUtils.ts            # Local timezone date & month navigation helpers
├── types/                      # Shared top-level contracts
│   └── task.ts
├── App.tsx                     # Mobile-first unified dashboard composition
├── main.tsx                    # React bootstrap entrypoint
└── index.css                   # Tailwind CSS styling
```

---

## 🧪 Testing

```bash
# Run full unit test suite (72 tests across all domain engines and repositories)
npm run test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- **Tasks Logic (28 tests):** Daily recurrence, weekly recurrence, overdue tasks, priority sorting hierarchy, category filtering, weekly aggregations, streak calculation.
- **Protein Logic (17 tests):** Weight-based goal computation, daily summation, remaining protein calculation, display progress capping, chronological sorting, settings validation.
- **Expenses Logic (15 tests):** Float-safe string-to-paise parser (`"12.5"` $\to$ 1250, `"100"` $\to$ 10000, `"0.75"` $\to$ 75), INR formatting, monthly totals, category totals, remaining budget, uncapped budget percentages, budget status transitions (ok, warning $\ge 80\%$, over $> 100\%$), category warning detection.
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
