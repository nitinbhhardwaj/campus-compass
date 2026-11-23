# Campus Compass

> A context-aware daily planner for college students: study, gym, protein, expenses, and chores in one prioritized **Today** view. Built with code quality, testability, and explainability as first-class priorities.

---

## 🏛️ Architecture & Interview Defense Guide

When discussing Campus Compass in interviews, the core themes are **Separation of Concerns**, **Domain-Driven Bounded Contexts**, and **Future-Proofing without Premature Complexity**.

### 1. Swappable Async Repository Pattern (`TaskRepository` & `ProteinRepository`)
- **Decision:** UI components and hooks interact exclusively with abstract repository interfaces returning `Promise<T>` (`LocalStorageTaskRepository` and `LocalStorageProteinRepository`).
- **Interview Defense:** "Local-first now, Supabase later." In early development, `localStorage` provides immediate zero-config iteration. Because all repository methods return `Promise`, swapping to Supabase, IndexedDB, or an external REST API requires writing a new class implementing the interface. Zero React components or hooks require refactoring.

### 2. Pure Business Logic Engines
- **Decision:** All filtering, sorting, recurrence rules, streaks, weekly aggregations, and nutritional metrics are 100% pure functions decoupled from React state, DOM, and `new Date()` calls.
- **Interview Defense:** "Deterministic domain logic is trivial to test and reason about." Passing `today: string` explicitly into every pure function ensures tests never flake due to machine timezones or execution timestamps. Tests run in under 200ms using Vitest without DOM emulation overhead.

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
- **Interview Defense:** "Respecting the user's current day." If a student opens the app at 8:00 AM, today's workout has not yet been logged. A naive streak counter would reset to 0 because today is missing. Our pure `computeStreak` checks whether yesterday was completed: if yes, yesterday's streak is preserved as active pending today. If yesterday was missed and today is incomplete, the streak breaks to 0. Completing today restarts the streak at 1.

### 7. Weekly Aggregation Helper (`getWeeklySummary`)
- **Decision:** Given tasks and an arbitrary date range `[startDate, endDate]`, `getWeeklySummary` pure function projects completion metrics grouped by category.
- **Interview Defense:** Pure analytical projection. Whether tasks are recurring habits or one-off assignments, the function parses historical dates within the week window without needing relational SQL joins or complex state machinery.

### 8. Category Filtering & Empty States
- **Decision:** Category filtering is computed as a pure pipeline stage: `All Tasks -> Today Filter -> Priority Sort -> Category Filter`.
- **Interview Defense:** Composable pure function pipelines. Empty states adapt contextually: if no tasks exist in the selected category (e.g., "Gym"), the UI informs the user ("No gym tasks scheduled for today") and offers a single-click action to view all categories.

### 9. Protein Tracker Module & Bounded Context Isolation (`src/features/protein`)
- **Decision:** The protein module has its own types, pure logic, repository interface, and UI components, with **zero dependency on the tasks module**.
- **Interview Defense:** "High cohesion, loose coupling (Domain-Driven Design)." Mixing protein tracking into the Task entity would pollute the Task model with nutritional schema (grams, body weight, presets) that do not belong to general tasks. Keeping the modules decoupled means they can be tested, refactored, or replaced independently. When the rule-based suggestion engine arrives ("low protein by evening => suggest snack"), an orchestrator or rule engine will coordinate between both modules without either module depending directly on the other.

### 10. Nutrition Calculation Engine & Presets
- **Decision:** Default daily protein target calculated as `Math.round(bodyWeightKg * 1.6)` with optional manual user override. Presets are stored in a centralized constant file (`presets.ts`) and labeled as approximate reference estimates without prescriptive or medical advice.
- **Interview Defense:** Mathematical purity and safety. Input validators ensure positive weights (<= 300kg) and sensible target limits (<= 500g). Display progress is capped at 100% for the visual bar, while intake sums are never artificially capped.

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
│   ├── tasks/                  # Task domain module
│   │   ├── components/         # Feature UI
│   │   │   ├── CategoryFilter.tsx # Category filter chips
│   │   │   ├── TaskForm.tsx    # Add / Edit task modal form
│   │   │   ├── TaskItem.tsx    # Card with complete, edit, delete, streaks, badges
│   │   │   ├── TaskList.tsx    # List container with contextual empty states
│   │   │   ├── TodayHeader.tsx # Date, completion counter, and overdue alert
│   │   │   └── WeeklySummaryCard.tsx # "This week" category breakdown
│   │   ├── hooks/              # useTasks hook orchestrating state & repository operations
│   │   │   └── useTasks.ts
│   │   └── logic/              # Pure domain logic (0% React/DOM dependencies)
│   │       ├── taskLogic.ts    # Filter, sort, recurrence, streaks, weekly summaries
│   │       └── taskLogic.test.ts # 32 exhaustive Vitest unit tests
│   └── protein/                # Protein tracking domain module (isolated bounded context)
│       ├── constants/
│       │   └── presets.ts      # Quick-add food presets with approximate gram values
│       ├── types/
│       │   └── protein.ts      # ProteinEntry, ProteinSettings, CreateProteinEntryDTO
│       ├── logic/
│       │   ├── proteinLogic.ts # Pure functions: total, remaining, progress, validation
│       │   └── proteinLogic.test.ts # 17 exhaustive Vitest unit tests
│       ├── hooks/
│       │   └── useProtein.ts   # Custom hook connecting state and storage
│       └── components/
│           ├── ProteinCard.tsx # Daily protein progress card
│           ├── ProteinQuickAdd.tsx # Preset chips + custom entry form
│           ├── ProteinEntryList.tsx # Today's logged items with delete action
│           └── ProteinSettingsModal.tsx # Weight & target goal configuration
├── lib/                        # Cross-cutting infrastructure
│   ├── storage/                # Swappable async repositories
│   │   ├── taskRepository.ts
│   │   ├── localTaskRepository.ts
│   │   ├── localTaskRepository.test.ts
│   │   ├── proteinRepository.ts
│   │   ├── localProteinRepository.ts
│   │   └── localProteinRepository.test.ts
│   └── dateUtils.ts            # Local timezone date formatting & day-of-week helpers
├── types/                      # Top-level shared types
│   └── task.ts
├── App.tsx                     # Mobile-first composition container
├── main.tsx                    # React bootstrap entrypoint
└── index.css                   # Tailwind CSS styling
```

---

## 🧪 Testing

```bash
# Run full unit test suite (53 tests across domain logic and storage)
npm run test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- **Tasks Logic (28 tests):**
  - Daily recurrence across multiple days (completion resets cleanly).
  - Weekly recurrence on non-matching weekdays and prior to start date.
  - Overdue tasks surfacing in Today, completed past tasks excluded.
  - Priority sorting hierarchy with completed tasks anchored last.
  - Category filtering across all tags.
  - Weekly summary aggregations by category within date ranges.
  - Habit streak computation (active, pending, broken, restarted).
- **Protein Logic (17 tests):**
  - Default goal calculation from body weight (1.6x multiplier).
  - Accurate date-specific total intake summation without artificial caps.
  - Remaining grams calculation (floored at 0 when reached or exceeded).
  - Progress percentage calculation (capped at 100% for display).
  - Entry filtering and newest-first chronological ordering.
  - Settings input validation (positive numbers, realistic maximums).
- **Repositories (8 tests):**
  - `LocalStorageTaskRepository`: seed loading, async CRUD operations.
  - `LocalStorageProteinRepository`: seed loading, async entry logging, delete, settings persistence.

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
