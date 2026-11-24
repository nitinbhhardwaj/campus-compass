import React, { useState } from 'react';
import {
  AssistantIntent,
  AddTaskIntent,
  AddExpenseIntent,
  AddProteinIntent,
  AssistantTaskCategory,
  AssistantExpenseCategory,
  AssistantRecurrence,
} from '../types/assistant';

interface AssistantItemEditorProps {
  intent: AssistantIntent;
  onSave: (updated: AssistantIntent) => void;
  onCancel: () => void;
}

export const AssistantItemEditor: React.FC<AssistantItemEditorProps> = ({
  intent,
  onSave,
  onCancel,
}) => {
  // Task state
  const task = intent.type === 'add_task' ? (intent as AddTaskIntent) : null;
  const [taskTitle, setTaskTitle] = useState(task?.title || '');
  const [taskCategory, setTaskCategory] = useState<AssistantTaskCategory>(task?.category || 'study');
  const [taskPriority, setTaskPriority] = useState<1 | 2 | 3>(task?.priority || 2);
  const [taskDueDate, setTaskDueDate] = useState<string>(task?.dueDate || '');
  const [taskRecurrence, setTaskRecurrence] = useState<AssistantRecurrence>(task?.recurrence || 'none');

  // Expense state
  const expense = intent.type === 'add_expense' ? (intent as AddExpenseIntent) : null;
  const [amountRupees, setAmountRupees] = useState(expense?.amountRupees || '');
  const [expenseCategory, setExpenseCategory] = useState<AssistantExpenseCategory>(expense?.category || 'food');
  const [expenseNote, setExpenseNote] = useState(expense?.note || '');
  const [expenseDate, setExpenseDate] = useState(expense?.date || '');

  // Protein state
  const protein = intent.type === 'add_protein' ? (intent as AddProteinIntent) : null;
  const [proteinLabel, setProteinLabel] = useState(protein?.label || '');
  const [proteinGrams, setProteinGrams] = useState(protein?.grams.toString() || '0');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (intent.type === 'add_task') {
      onSave({
        type: 'add_task',
        title: taskTitle.trim() || 'New Task',
        category: taskCategory,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        recurrence: taskRecurrence,
      });
    } else if (intent.type === 'add_expense') {
      onSave({
        type: 'add_expense',
        amountRupees: amountRupees.trim() || '0',
        category: expenseCategory,
        note: expenseNote.trim() || 'Expense',
        date: expenseDate,
      });
    } else if (intent.type === 'add_protein') {
      onSave({
        type: 'add_protein',
        label: proteinLabel.trim() || 'Protein Item',
        grams: Math.max(1, parseInt(proteinGrams, 10) || 0),
      });
    }
  };

  return (
    <form
      onSubmit={handleSave}
      style={{
        padding: '12px',
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {intent.type === 'add_task' && (
        <>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Task Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              style={{ width: '100%', height: '36px', padding: '6px 8px', border: '1px solid var(--line)', borderRadius: '3px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Category</label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value as AssistantTaskCategory)}
                style={{ width: '100%', height: '36px', padding: '4px', border: '1px solid var(--line)', borderRadius: '3px' }}
              >
                <option value="study">Study</option>
                <option value="gym">Gym</option>
                <option value="skincare">Skincare</option>
                <option value="chore">Chore</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(Number(e.target.value) as 1 | 2 | 3)}
                style={{ width: '100%', height: '36px', padding: '4px', border: '1px solid var(--line)', borderRadius: '3px' }}
              >
                <option value={1}>P1 (Urgent)</option>
                <option value={2}>P2 (Normal)</option>
                <option value={3}>P3 (Optional)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '4px', border: '1px solid var(--line)', borderRadius: '3px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Recurrence</label>
              <select
                value={taskRecurrence}
                onChange={(e) => setTaskRecurrence(e.target.value as AssistantRecurrence)}
                style={{ width: '100%', height: '36px', padding: '4px', border: '1px solid var(--line)', borderRadius: '3px' }}
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </>
      )}

      {intent.type === 'add_expense' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Amount (₹)</label>
              <input
                type="text"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '6px 8px', border: '1px solid var(--line)', borderRadius: '3px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Category</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as AssistantExpenseCategory)}
                style={{ width: '100%', height: '36px', padding: '4px', border: '1px solid var(--line)', borderRadius: '3px' }}
              >
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="rent">Rent</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="study">Study</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '4px', border: '1px solid var(--line)', borderRadius: '3px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Description / Note</label>
              <input
                type="text"
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '6px 8px', border: '1px solid var(--line)', borderRadius: '3px' }}
              />
            </div>
          </div>
        </>
      )}

      {intent.type === 'add_protein' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Food Label</label>
            <input
              type="text"
              value={proteinLabel}
              onChange={(e) => setProteinLabel(e.target.value)}
              style={{ width: '100%', height: '36px', padding: '6px 8px', border: '1px solid var(--line)', borderRadius: '3px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>Protein (g)</label>
            <input
              type="number"
              min="1"
              value={proteinGrams}
              onChange={(e) => setProteinGrams(e.target.value)}
              style={{ width: '100%', height: '36px', padding: '6px 8px', border: '1px solid var(--line)', borderRadius: '3px' }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ minHeight: '36px', padding: '0 12px', fontSize: '13px', background: 'none', border: '1px solid var(--line)', cursor: 'pointer', borderRadius: '3px' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            minHeight: '36px',
            padding: '0 14px',
            fontSize: '13px',
            fontWeight: 600,
            background: 'var(--ink)',
            color: 'var(--paper)',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '3px',
          }}
        >
          Done
        </button>
      </div>
    </form>
  );
};
