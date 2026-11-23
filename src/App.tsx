import { useState, useMemo } from 'react';
import { useTasks } from './features/tasks/hooks/useTasks';
import { TodayHeader } from './features/tasks/components/TodayHeader';
import { TaskList } from './features/tasks/components/TaskList';
import { TaskForm } from './features/tasks/components/TaskForm';
import { CategoryFilter } from './features/tasks/components/CategoryFilter';
import { WeeklySummaryCard } from './features/tasks/components/WeeklySummaryCard';
import { Modal } from './components/Modal';
import { Task } from './types/task';
import { useProtein } from './features/protein/hooks/useProtein';
import { ProteinCard } from './features/protein/components/ProteinCard';
import { ProteinSettingsModal } from './features/protein/components/ProteinSettingsModal';
import { useExpenses } from './features/expenses/hooks/useExpenses';
import { ExpenseCard } from './features/expenses/components/ExpenseCard';
import { ExpenseSettingsModal } from './features/expenses/components/ExpenseSettingsModal';
import { formatMonthDisplay } from './lib/dateUtils';
import { buildDaySnapshot } from './app/buildDaySnapshot';
import { generateSuggestions } from './features/suggestions/logic/engine';
import { SuggestionsCard } from './features/suggestions/components/SuggestionsCard';
import { AppHeader } from './components/AppHeader';
import { BottomNav, MobileTab } from './components/BottomNav';

export default function App() {
  const {
    tasks,
    filteredTasks,
    categoryCounts,
    categoryFilter,
    setCategoryFilter,
    stats,
    weekRange,
    weeklySummary,
    isLoading: isTasksLoading,
    error: taskError,
    today,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useTasks();

  const {
    settings: proteinSettings,
    totalGrams: proteinTotal,
    remainingGrams: proteinRemaining,
    progress: proteinProgress,
    todayEntries: todayProteinEntries,
    addEntry: addProteinEntry,
    deleteEntry: deleteProteinEntry,
    updateSettings: updateProteinSettings,
    isLoading: isProteinLoading,
    error: proteinError,
  } = useProtein(undefined, today);

  const {
    settings: expenseSettings,
    selectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    totalSpentPaise,
    remainingBudgetPaise,
    usedPercent,
    status: expenseStatus,
    categoryTotals: expenseCategoryTotals,
    categoryWarnings: expenseCategoryWarnings,
    monthExpenses,
    addExpense,
    deleteExpense,
    updateSettings: updateExpenseSettings,
    isLoading: isExpensesLoading,
    error: expenseError,
  } = useExpenses(undefined, today);

  const [mobileTab, setMobileTab] = useState<MobileTab>('today');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isProteinSettingsOpen, setIsProteinSettingsOpen] = useState(false);
  const [isExpenseSettingsOpen, setIsExpenseSettingsOpen] = useState(false);

  const handleOpenAddTaskModal = () => {
    setTaskToEdit(null);
    setIsAddTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setIsAddTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const isLoading = isTasksLoading || isProteinLoading || isExpensesLoading;
  const combinedError = taskError || proteinError || expenseError;

  // Build DaySnapshot via anti-corruption adapter and generate rule-based suggestions
  const currentHour = useMemo(() => new Date().getHours(), []);

  const daySnapshot = useMemo(() => {
    return buildDaySnapshot({
      tasks,
      today,
      hour: currentHour,
      protein: {
        totalGrams: proteinTotal,
        goalGrams: proteinSettings.goalGrams,
      },
      expenses: {
        totalSpentPaise,
        monthlyBudgetPaise: expenseSettings.monthlyBudgetPaise,
        categoryTotals: expenseCategoryTotals,
        categoryBudgetsPaise: expenseSettings.categoryBudgetsPaise,
      },
      weekRange,
    });
  }, [
    tasks,
    today,
    currentHour,
    proteinTotal,
    proteinSettings.goalGrams,
    totalSpentPaise,
    expenseSettings.monthlyBudgetPaise,
    expenseCategoryTotals,
    expenseSettings.categoryBudgetsPaise,
    weekRange,
  ]);

  const suggestions = useMemo(() => {
    return generateSuggestions(daySnapshot);
  }, [daySnapshot]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center">
      {/* Responsive layout: Single-column on mobile, 2-column bento on desktop */}
      <main className="w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 pb-24 lg:pb-12 flex-1">
        {/* Personalized Greeting Header & Theme Switcher */}
        <AppHeader today={today} hour={currentHour} userName="Nitin" />

        {/* Global Loading Feedback */}
        {isLoading && (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            Loading your student dashboard...
          </div>
        )}

        {/* Global Error Banner */}
        {combinedError && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
            {combinedError}
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (Desktop: 7 cols) -> Insights & Agenda */}
            <div className={`lg:col-span-7 flex flex-col gap-6 ${mobileTab !== 'today' && mobileTab !== 'insights' ? 'hidden lg:flex' : ''}`}>
              {/* Contextual Nudges (Visible on desktop or when 'insights' / 'today' selected on mobile) */}
              <div className={`${mobileTab === 'today' ? 'block' : mobileTab === 'insights' ? 'block' : 'hidden lg:block'}`}>
                <SuggestionsCard suggestions={suggestions} />
              </div>

              {/* Tasks Agenda & Filtering */}
              {(mobileTab === 'today' || mobileTab === 'insights') && (
                <section aria-label="Today Schedule" className="flex flex-col gap-4">
                  <TodayHeader
                    today={today}
                    totalTasks={stats.total}
                    completedTasks={stats.completed}
                    overdueCount={stats.overdueCount}
                    completionPercentage={stats.percentage}
                    onOpenAddModal={handleOpenAddTaskModal}
                  />

                  <WeeklySummaryCard
                    summary={weeklySummary}
                    weekStart={weekRange.startDate}
                    weekEnd={weekRange.endDate}
                  />

                  <CategoryFilter
                    selected={categoryFilter}
                    onChange={setCategoryFilter}
                    categoryCounts={categoryCounts}
                  />

                  <TaskList
                    tasks={filteredTasks}
                    today={today}
                    categoryFilter={categoryFilter}
                    onClearCategoryFilter={() => setCategoryFilter('all')}
                    onToggle={toggleTask}
                    onEdit={handleOpenEditTaskModal}
                    onDelete={deleteTask}
                    onOpenAddModal={handleOpenAddTaskModal}
                  />
                </section>
              )}
            </div>

            {/* Right Column (Desktop: 5 cols) -> Nutrition & Finances */}
            <div className={`lg:col-span-5 flex flex-col gap-6 ${mobileTab === 'insights' ? 'hidden lg:flex' : mobileTab === 'today' ? 'hidden lg:flex' : ''}`}>
              {/* Daily Protein Tracker */}
              {(mobileTab === 'protein' || mobileTab === 'today') && (
                <div className={`${mobileTab === 'protein' ? 'block' : 'hidden lg:block'}`}>
                  <ProteinCard
                    today={today}
                    totalGrams={proteinTotal}
                    goalGrams={proteinSettings.goalGrams}
                    remainingGrams={proteinRemaining}
                    progress={proteinProgress}
                    todayEntries={todayProteinEntries}
                    onAddEntry={async (dto) => {
                      await addProteinEntry(dto);
                    }}
                    onDeleteEntry={async (id) => {
                      await deleteProteinEntry(id);
                    }}
                    onOpenSettings={() => setIsProteinSettingsOpen(true)}
                  />
                </div>
              )}

              {/* Monthly Expense Tracker */}
              {(mobileTab === 'money' || mobileTab === 'today') && (
                <div className={`${mobileTab === 'money' ? 'block' : 'hidden lg:block'}`}>
                  <ExpenseCard
                    selectedMonth={selectedMonth}
                    selectedMonthDisplay={formatMonthDisplay(selectedMonth)}
                    totalSpentPaise={totalSpentPaise}
                    monthlyBudgetPaise={expenseSettings.monthlyBudgetPaise}
                    remainingBudgetPaise={remainingBudgetPaise}
                    usedPercent={usedPercent}
                    status={expenseStatus}
                    categoryTotals={expenseCategoryTotals}
                    categoryWarnings={expenseCategoryWarnings}
                    monthExpenses={monthExpenses}
                    today={today}
                    onAddExpense={async (dto) => {
                      await addExpense(dto);
                    }}
                    onDeleteExpense={async (id) => {
                      await deleteExpense(id);
                    }}
                    onPreviousMonth={goToPreviousMonth}
                    onNextMonth={goToNextMonth}
                    onOpenSettings={() => setIsExpenseSettingsOpen(true)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for adding / editing tasks */}
        <Modal
          isOpen={isAddTaskModalOpen}
          onClose={handleCloseTaskModal}
          title={taskToEdit ? 'Edit Task' : 'New Task'}
        >
          <TaskForm
            initialDueDate={today}
            taskToEdit={taskToEdit}
            onSubmit={async (dto) => {
              if (taskToEdit) {
                await updateTask(taskToEdit.id, dto);
              } else {
                await addTask(dto);
              }
            }}
            onClose={handleCloseTaskModal}
          />
        </Modal>

        {/* Modal for Protein Settings */}
        <ProteinSettingsModal
          isOpen={isProteinSettingsOpen}
          currentSettings={proteinSettings}
          onSave={async (newSettings) => {
            await updateProteinSettings(newSettings);
          }}
          onClose={() => setIsProteinSettingsOpen(false)}
        />

        {/* Modal for Expense Budget Settings */}
        <ExpenseSettingsModal
          isOpen={isExpenseSettingsOpen}
          currentSettings={expenseSettings}
          onSave={async (newSettings) => {
            await updateExpenseSettings(newSettings);
          }}
          onClose={() => setIsExpenseSettingsOpen(false)}
        />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={mobileTab}
        onChange={setMobileTab}
        insightCount={suggestions.length}
      />
    </div>
  );
}
