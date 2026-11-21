# Campus Compass

> A context-aware daily planner for college students: study, gym, protein, expenses, and chores in one prioritized **Today** view. Built with code quality, testability, and explainability as first-class priorities.

---

## 🏛️ Architecture & Interview Defense Guide

When discussing Campus Compass in interviews, the core themes are **Separation of Concerns**, **Domain-Driven Purity**, and **Future-Proofing without Premature Complexity**.

### 1. Swappable Async Repository Pattern (`TaskRepository`)
- **Decision:** UI components and hooks interact with an abstract `TaskRepository` interface returning `Promise<T>`. The default implementation is `LocalStorageTaskRepository`.
- **Interview Defense:** "Local-first now, Supabase later." In early development, `localStorage` provides immediate zero-config iteration. Because the repository interface is asynchronous (`Promise`-based), swapping to Supabase, IndexedDB, or a REST API requires writing a new class implementing `TaskRepository`. Zero React components or hooks require refactoring.

### 2. Pure Business Logic Engine (`src/features/tasks/logic/taskLogic.ts`)
- **Decision:** All filtering, sorting, recurrence rules, completion transitions, weekly aggregations, and streaks are 100% pure functions decoupled from React state, DOM, and `new Date()` calls.
- **Interview Defense:** "Deterministic domain logic is trivial to test and reason about." Passing `today: string` explicitly into every pure function ensures tests never flake due to machine timezones or execution timestamps. Tests run in under 200ms using Vitest without DOM emulation overhead.

### 3. Avoiding the UTC Date Bug (`date.toISOString()`)
- **Decision:** Dates are standardized as local `YYYY-MM-DD` strings. We deliberately avoid `date.toISOString().split('T')[0]`.
- **Interview Defense:** `toISOString()` returns the timestamp in UTC (GMT+0). If a student in Tokyo (+09:00), Mumbai (+05:30), or Los Angeles (-08:00) opens the app near midnight, UTC may be the next or previous day, causing today's tasks to falsely disappear or appear overdue. `formatLocalDate()` formats using the user's local year, month, and day.

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
- **Interview Defense:** "Respecting the user's current day." If a student opens the app at 8:00 AM, today's workout has not yet been logged. A naive streak counter would reset to 0 because today is missing. Our pure `computeStreak` checks whether yesterday was completed: if yes, yesterday's streak is preserved as active pending today. If yesterday was missed and today is incomplete, the streak breaks to 0. Completing today restarts the streak at 1.

### 7. Weekly Aggregation Helper (`getWeeklySummary`)
- **Decision:** Given tasks and an arbitrary date range `[startDate, endDate]`, `getWeeklySummary` pure function projects completion metrics grouped by category.
- **Interview Defense:** Pure analytical projection. Whether tasks are recurring habits or one-off assignments, the function parses historical dates within the week window without needing relational SQL joins or complex state machinery.

### 8. Category Filtering & Empty States
- **Decision:** Category filtering is computed as a pure pipeline stage: `All Tasks -> Today Filter -> Priority Sort -> Category Filter`.
- **Interview Defense:** Composable pure function pipelines. Empty states adapt contextually: if no tasks exist in the selected category (e.g., "Gym"), the UI informs the user ("No gym tasks scheduled for today") and offers a single-click action to view all categories.

### 9. Accessibility (a11y) & Mobile Ergonomics
- **Decision:** Semantic HTML, ARIA dialogs (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), radio groups (`role="radiogroup"`), explicit label-input connections (`htmlFor` / `id`), and minimum 44px hit targets on interactive controls.
- **Interview Defense:** Accessibility isn't an afterthought; building with semantic controls ensures keyboard navigation and screen-reader usability out-of-the-box.

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
│   └── tasks/                  # Task domain module
│       ├── components/         # Feature UI
│       │   ├── CategoryFilter.tsx # Category filter chips
│       │   ├── TaskForm.tsx    # Add / Edit task modal form
│       │   ├── TaskItem.tsx    # Card with complete, edit, delete, streaks, badges
│       │   ├── TaskList.tsx    # List container with contextual empty states
│       │   ├── TodayHeader.tsx # Date, completion counter, and overdue alert
│       │   └── WeeklySummaryCard.tsx # "This week" category breakdown
│       ├── hooks/              # useTasks hook orchestrating state & repository operations
│       │   └── useTasks.ts
│       └── logic/              # Pure domain logic (0% React/DOM dependencies)
│           ├── taskLogic.ts    # Filter, sort, recurrence, streaks, weekly summaries
│           └── taskLogic.test.ts # 32 exhaustive Vitest unit tests
├── lib/                        # Cross-cutting infrastructure
│   ├── storage/                # Repository interface & LocalStorage implementation
│   │   ├── taskRepository.ts
│   │   ├── localTaskRepository.ts
│   │   └── localTaskRepository.test.ts
│   └── dateUtils.ts            # Local timezone date formatting & day-of-week helpers
├── types/                      # TypeScript domain types & contracts
│   └── task.ts                 # Task, Category, Priority, Recurrence
├── App.tsx                     # Top-level composition for the mobile-first Today view
├── main.tsx                    # React bootstrap entrypoint
└── index.css                   # Tailwind CSS styling
```

---

## 🧪 Testing

The pure domain logic and storage adapters are covered with Vitest:

```bash
# Run unit test suite
npm run test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- **Daily recurrence across days:** verifying completed status today resets tomorrow.
- **Weekly recurrence:** verifying tasks appear only on the correct weekday and not prior to start date.
- **Overdue tasks:** verifying past incomplete tasks surface in Today, while past completed tasks are excluded.
- **Priority sorting:** verifying incomplete tasks always precede completed tasks, and P1 > P2 > P3 with overdue prioritization.
- **Category filtering:** verifying "all" returns everything, category selection filters strictly, and empty arrays on non-matches.
- **Weekly summary calculation:** verifying completion counts by category and range boundaries.
- **Streak calculation:** active streak preservation, broken streaks on missed days, restart after break, and weekly habit streaks.
- **Storage repository:** verifying initial seeding, async save, update, and delete.

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
