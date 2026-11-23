import { useState } from 'react';
import { Compass } from 'lucide-react';
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

export default function App() {
  const {
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex justify-center selection:bg-indigo-500 selection:text-white">
      {/* Mobile-first centered frame: authentic mobile viewport on desktop */}
      <main className="w-full max-w-md min-h-screen bg-slate-50 border-x border-slate-200/80 px-4 py-6 sm:px-5 flex flex-col shadow-sm">
        {/* Brand App Bar */}
        <header className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                Campus Compass
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide">
                Daily Student Planner
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            Phase 4
          </span>
        </header>

        {/* Loading and Error Feedback */}
        {isLoading && (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading your student dashboard...
          </div>
        )}

        {combinedError && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {combinedError}
          </div>
        )}

        {!isLoading && (
          <>
            <TodayHeader
              today={today}
              totalTasks={stats.total}
              completedTasks={stats.completed}
              overdueCount={stats.overdueCount}
              completionPercentage={stats.percentage}
              onOpenAddModal={handleOpenAddTaskModal}
            />

            {/* Protein Tracker Module Card */}
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

            {/* Expense Tracker Module Card */}
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

            {/* Weekly Summary Card */}
            <WeeklySummaryCard
              summary={weeklySummary}
              weekStart={weekRange.startDate}
              weekEnd={weekRange.endDate}
            />

            {/* Category Filter Chips */}
            <CategoryFilter
              selected={categoryFilter}
              onChange={setCategoryFilter}
              categoryCounts={categoryCounts}
            />

            {/* Task List */}
            <section className="flex-1" aria-label="Task list section">
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
          </>
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
    </div>
  );
}
