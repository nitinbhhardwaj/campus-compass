import { useState } from 'react';
import { Compass } from 'lucide-react';
import { useTasks } from './features/tasks/hooks/useTasks';
import { TodayHeader } from './features/tasks/components/TodayHeader';
import { TaskList } from './features/tasks/components/TaskList';
import { TaskForm } from './features/tasks/components/TaskForm';
import { Modal } from './components/Modal';

export default function App() {
  const {
    todayTasks,
    stats,
    isLoading,
    error,
    today,
    addTask,
    toggleTask,
    deleteTask,
  } = useTasks();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex justify-center selection:bg-indigo-500 selection:text-white">
      {/* Mobile-first centered frame: authentic mobile viewport on desktop */}
      <main className="w-full max-w-md min-h-screen bg-slate-50 border-x border-slate-200/80 px-4 py-6 sm:px-5 flex flex-col shadow-sm">
        {/* Brand App Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60">
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
            Phase 1
          </span>
        </div>

        {/* Loading and Error Feedback */}
        {isLoading && (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading your schedule...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
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
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />

            <section className="flex-1">
              <TaskList
                tasks={todayTasks}
                today={today}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            </section>
          </>
        )}

        {/* Modal for adding tasks */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="New Task"
        >
          <TaskForm
            initialDueDate={today}
            onSubmit={async (dto) => {
              await addTask(dto);
            }}
            onClose={() => setIsAddModalOpen(false)}
          />
        </Modal>
      </main>
    </div>
  );
}
