import { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { useTheme } from './lib/theme';
import { useAssistant } from './features/assistant/hooks/useAssistant';
import { AssistantTrigger } from './features/assistant/components/AssistantTrigger';
import { AssistantModal } from './features/assistant/components/AssistantModal';
import { executeIntents } from './app/executeIntents';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { NotFound } from './pages/NotFound';
import { Footer } from './components/Footer';

export default function App() {
  const { theme, toggleTheme } = useTheme();

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

  const {
    isOpen: isAssistantOpen,
    openAssistant,
    closeAssistant,
    settings: assistantSettings,
    updateSettings: updateAssistantSettings,
    inputText: assistantInputText,
    setInputText: setAssistantInputText,
    isParsing: assistantIsParsing,
    error: assistantError,
    pendingIntents: assistantPendingIntents,
    clarifyPrompt: assistantClarifyPrompt,
    parseUtterance: parseAssistantUtterance,
    updateIntent: updateAssistantIntent,
    removeIntent: removeAssistantIntent,
    clearIntents: clearAssistantIntents,
    confirmIntents: confirmAssistantIntents,
    isListening: assistantIsListening,
    startListening: startAssistantListening,
    stopListening: stopAssistantListening,
    isSpeechRecognitionSupported,
  } = useAssistant(today);

  const handleConfirmAssistantIntents = async () => {
    await confirmAssistantIntents(async (intents) => {
      await executeIntents(
        intents,
        {
          addTask: async (dto) => {
            await addTask(dto);
          },
          addExpense: async (dto) => {
            await addExpense(dto);
          },
          addProtein: async (dto) => {
            await addProteinEntry(dto);
          },
        },
        today
      );
    });
  };

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

  // Formatted date matching mockup: "Monday, 23 November"
  const formattedDate = useMemo(() => {
    if (!today) return '';
    const [year, month, day] = today.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [today]);

  const headline = useMemo(() => {
    const count = suggestions.length;
    if (count === 0) return "You’re completely on track today.";
    if (count === 1) return "One thing can’t wait today.";
    if (count === 2) return "Two things can’t wait today.";
    return `${count} things can’t wait today.`;
  }, [suggestions.length]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="wrap">
              <header className="header-row">
                <div className="header-greeting">
                  <p className="date">{formattedDate}</p>
                  <h1>{headline}</h1>
                </div>
                <div className="header-actions">
                  <button
                    className="toggle"
                    id="theme"
                    onClick={toggleTheme}
                    aria-label="Switch light or dark theme"
                  >
                    Theme: {theme}
                  </button>
                </div>
              </header>

              {/* Global Loading Feedback */}
              {isLoading && (
                <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: '14px' }}>
                  Loading your student dashboard...
                </div>
              )}

              {/* Global Error Banner */}
              {combinedError && (
                <div className="warn" role="alert" style={{ margin: '14px 0' }}>
                  {combinedError}
                </div>
              )}

              {/* Highlighter Notes for Suggestions */}
              <SuggestionsCard suggestions={suggestions} />

              {/* Responsive Grid matching spec */}
              <div className="dashboard-grid">
                {/* Left Column: Your day rail */}
                <section aria-labelledby="day">
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

                {/* Right Column: Side cards (Protein bottle & Expense ledger) */}
                <div className="side">
                  <ProteinCard
                    today={today}
                    totalGrams={proteinTotal}
                    goalGrams={proteinSettings.goalGrams}
                    remainingGrams={proteinRemaining}
                    progress={proteinProgress}
                    todayEntries={todayProteinEntries}
                    dietPreference={proteinSettings.dietPreference}
                    onUpdateDietPreference={async (diet) => {
                      await updateProteinSettings({
                        ...proteinSettings,
                        dietPreference: diet,
                      });
                    }}
                    onAddEntry={async (dto) => {
                      await addProteinEntry(dto);
                    }}
                    onDeleteEntry={async (id) => {
                      await deleteProteinEntry(id);
                    }}
                    onOpenSettings={() => setIsProteinSettingsOpen(true)}
                  />

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
              </div>
            </div>
          }
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Shared Footer on Every Screen */}
      <div className="wrap" style={{ paddingTop: 0, paddingBottom: '32px' }}>
        <Footer onClearAllData={() => window.location.reload()} />
      </div>

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

      {/* Floating AI Assistant Trigger */}
      <AssistantTrigger
        onClick={openAssistant}
        assistantName={assistantSettings.assistantName}
      />

      {/* Conversational Assistant Modal / Sheet */}
      <AssistantModal
        isOpen={isAssistantOpen}
        onClose={closeAssistant}
        assistantName={assistantSettings.assistantName}
        isListening={assistantIsListening}
        startListening={startAssistantListening}
        stopListening={stopAssistantListening}
        isSpeechSupported={isSpeechRecognitionSupported}
        inputText={assistantInputText}
        setInputText={setAssistantInputText}
        onParse={parseAssistantUtterance}
        isParsing={assistantIsParsing}
        error={assistantError}
        pendingIntents={assistantPendingIntents}
        clarifyPrompt={assistantClarifyPrompt}
        onUpdateIntent={updateAssistantIntent}
        onRemoveIntent={removeAssistantIntent}
        onConfirmAll={handleConfirmAssistantIntents}
        onClear={clearAssistantIntents}
        settings={assistantSettings}
        onSaveSettings={updateAssistantSettings}
      />
    </>
  );
}
