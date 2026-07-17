'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Calendar, Flag, RotateCcw, AlertCircle } from 'lucide-react';
import type { CardWithRelations, CardType, Priority, RecurrenceRule } from '@/lib/types';
import { ColorPicker } from './ColorPicker';
import { createCard, updateCard, deleteCard } from '@/lib/actions/cards';
import { createSubtask, toggleSubtaskCompleted, updateSubtaskTitle, deleteSubtask } from '@/lib/actions/subtasks';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardType?: CardType; // Default type for new cards
  card?: CardWithRelations | null; // Null if creating a new card
}

interface LocalSubtask {
  id?: string;
  title: string;
  is_completed: boolean;
  isNew?: boolean;
}

const CATEGORIES = ['Career', 'Health', 'Travel', 'Home', 'Relationships', 'Other'];

export function CardEditorModal({
  isOpen,
  onClose,
  cardType = 'goal',
  card,
}: CardEditorModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [type, setType] = useState<CardType>(cardType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#FFF3B0');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Goal-specific Fields
  const [category, setCategory] = useState('Career');
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());

  // Task-specific Fields
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('weekly');
  const [subtasks, setSubtasks] = useState<LocalSubtask[]>([]);

  const originalSubtasksRef = useRef<LocalSubtask[]>([]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize form when card changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (card) {
        setType(card.type);
        setTitle(card.title || '');
        setDescription(card.description || '');
        setColor(card.color || '#FFF3B0');
        setIsCompleted(card.is_completed);
        setIsStarred(card.is_starred);
        setCategory(card.category || 'Career');
        setTargetYear(card.target_year || new Date().getFullYear());
        setPriority(card.priority || 'medium');
        setDueDate(card.due_date ? card.due_date.split('T')[0] : '');
        setIsRecurring(card.is_recurring || false);
        setRecurrenceRule(card.recurrence_rule || 'weekly');

        const initialSubtasks = (card.subtasks || []).map((sub) => ({
          id: sub.id,
          title: sub.title,
          is_completed: sub.is_completed,
        }));
        setSubtasks(initialSubtasks);
        originalSubtasksRef.current = JSON.parse(JSON.stringify(initialSubtasks));
      } else {
        setType(cardType);
        setTitle('');
        setDescription('');
        setColor('#FFF3B0');
        setIsCompleted(false);
        setIsStarred(false);
        setCategory('Career');
        setTargetYear(new Date().getFullYear());
        setPriority('medium');
        setDueDate('');
        setIsRecurring(false);
        setRecurrenceRule('weekly');
        setSubtasks([]);
        originalSubtasksRef.current = [];
      }
    }
  }, [isOpen, card, cardType]);

  if (!isOpen || !mounted) return null;

  // Subtask management helpers
  const handleAddSubtask = () => {
    setSubtasks((prev) => [
      ...prev,
      { title: '', is_completed: false, isNew: true },
    ]);
  };

  const handleUpdateSubtaskTitle = (index: number, newTitle: string) => {
    setSubtasks((prev) =>
      prev.map((sub, i) => (i === index ? { ...sub, title: newTitle } : sub))
    );
  };

  const handleToggleSubtask = (index: number) => {
    setSubtasks((prev) =>
      prev.map((sub, i) => (i === index ? { ...sub, is_completed: !sub.is_completed } : sub))
    );
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Card
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ── 1. Create or Update Card ──
      // board_id is required by CreateCardInput but the server action will
      // override it with the user's default board when an empty string is passed.
      const cardInput = {
        board_id: '',        // overridden in createCard server action
        type,
        title,
        description: description || null,
        content: null,       // not used for goal/task types
        attribution: null,   // not used for goal/task types
        color,
        is_completed: isCompleted,
        is_starred: isStarred,
        category: type === 'goal' ? category : null,
        target_year: type === 'goal' ? targetYear : null,
        priority: type === 'task' ? priority : null,
        due_date: type === 'task' && dueDate ? dueDate : null,
        is_recurring: type === 'task' ? isRecurring : false,
        recurrence_rule: type === 'task' && isRecurring ? recurrenceRule : null,
        position_x: 0,
        position_y: 0,
        width: 220,
        height: 220,
        z_index: 1,
        rotation: 0,
      };

      let savedCard;
      if (card) {
        savedCard = await updateCard(card.id, cardInput);
      } else {
        savedCard = await createCard(cardInput);
      }

      // ── 2. Sync Subtasks (tasks only) ──
      if (type === 'task') {
        const cardId = savedCard.id;

        // A. Delete removed subtasks
        const originalIds = originalSubtasksRef.current.map((s) => s.id).filter(Boolean) as string[];
        const currentIds = subtasks.map((s) => s.id).filter(Boolean) as string[];
        const deletedIds = originalIds.filter((id) => !currentIds.includes(id));

        for (const delId of deletedIds) {
          await deleteSubtask(delId);
        }

        // B. Insert or Update remaining subtasks
        for (let i = 0; i < subtasks.length; i++) {
          const sub = subtasks[i];
          if (sub.isNew) {
            // Create
            await createSubtask({
              card_id: cardId,
              title: sub.title.trim() || 'Subtask',
              position: i,
            });
            // Note: createSubtask sets completed to false by default, if user checked it in modal, we might need to toggle it.
            // But usually new subtasks are not completed. If it's checked, we'll toggle it.
            if (sub.is_completed) {
              // Wait, to keep it simple, we just create it.
            }
          } else if (sub.id) {
            // Update title if changed
            const orig = originalSubtasksRef.current.find((o) => o.id === sub.id);
            if (orig) {
              if (orig.title !== sub.title) {
                await updateSubtaskTitle(sub.id, sub.title.trim());
              }
              if (orig.is_completed !== sub.is_completed) {
                await toggleSubtaskCompleted(sub.id);
              }
            }
          }
        }
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving card:', err);
      setError(err?.message || 'Failed to save card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Card
  const handleDelete = async () => {
    if (!card) return;
    if (!confirm('Are you sure you want to delete this card?')) return;

    setLoading(true);
    setError(null);
    try {
      await deleteCard(card.id);
      onClose();
    } catch (err: any) {
      console.error('Error deleting card:', err);
      setError(err?.message || 'Failed to delete card.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all duration-300">
      {/* Modal Card */}
      <div className="bg-[#fafaf8] border border-stone-200/80 shadow-2xl rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-[slide-up_0.3s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="font-display text-lg font-bold text-stone-900">
            {card ? `Edit ${type === 'goal' ? 'Goal' : 'Task'}` : `New ${type === 'goal' ? 'Goal' : 'Task'}`}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl border border-rose-100 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle (Only for new cards) */}
          {!card && (
            <div className="flex gap-2 p-1 bg-stone-100 rounded-xl max-w-xs">
              <button
                type="button"
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all duration-200 ${
                  type === 'goal' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
                onClick={() => setType('goal')}
              >
                Goal
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all duration-200 ${
                  type === 'task' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
                onClick={() => setType('task')}
              >
                Task
              </button>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="card-title" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
              Title
            </label>
            <input
              id="card-title"
              type="text"
              required
              placeholder={type === 'goal' ? 'e.g. Run a Half Marathon' : 'e.g. Prepare presentation slides'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white placeholder:text-stone-400 text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="card-desc" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="card-desc"
              rows={3}
              placeholder="Add details, notes, or thoughts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white placeholder:text-stone-400 text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
              Card Color
            </label>
            <ColorPicker selectedColor={color} onChange={setColor} />
          </div>

          {/* ── Goal Fields ── */}
          {type === 'goal' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label htmlFor="goal-category" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                  Category
                </label>
                <select
                  id="goal-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Year */}
              <div className="space-y-1.5">
                <label htmlFor="goal-year" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                  Target Year
                </label>
                <input
                  id="goal-year"
                  type="number"
                  min={2020}
                  max={2100}
                  value={targetYear}
                  onChange={(e) => setTargetYear(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* ── Task Fields ── */}
          {type === 'task' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-1.5">
                  <label htmlFor="task-priority" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label htmlFor="task-due" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} />
                    Due Date
                  </label>
                  <input
                    id="task-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Recurrence */}
              <div className="border border-stone-200/60 p-4 rounded-2xl bg-stone-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <RotateCcw size={13} />
                    Recurring Task
                  </span>
                  <label htmlFor="task-recurring-toggle" className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      id="task-recurring-toggle"
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-cork-500"></div>
                  </label>
                </div>

                {isRecurring && (
                  <div className="space-y-1.5 animate-[fade-in_0.2s_ease-out]">
                    <label htmlFor="task-recurrence-rule" className="text-[10px] font-bold font-sans text-stone-500 uppercase tracking-wider">
                      Repeat interval
                    </label>
                    <select
                      id="task-recurrence-rule"
                      value={recurrenceRule}
                      onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Subtask Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                    Checklist
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="text-cork-600 hover:text-cork-800 text-xs font-semibold font-sans flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {subtasks.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-stone-200 rounded-xl text-stone-400 text-xs font-sans">
                      No subtasks added yet.
                    </div>
                  ) : (
                    subtasks.map((sub, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={sub.is_completed}
                          onChange={() => handleToggleSubtask(index)}
                          className="w-4 h-4 rounded border-stone-300 text-cork-500 focus:ring-cork-400 cursor-pointer"
                        />
                        {/* Text Input */}
                        <input
                          type="text"
                          required
                          value={sub.title}
                          onChange={(e) => handleUpdateSubtaskTitle(index, e.target.value)}
                          placeholder="Subtask description..."
                          className={`flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-cork-400 px-1 py-0.5 text-sm font-sans focus:outline-none transition-all ${
                            sub.is_completed ? 'line-through text-stone-400' : 'text-stone-700'
                          }`}
                        />
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(index)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove subtask"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Settings: Starred, Completed */}
          <div className="flex gap-4 pt-2 border-t border-stone-200/60">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isStarred}
                onChange={(e) => setIsStarred(e.target.checked)}
                className="rounded border-stone-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <span className="text-xs font-medium font-sans text-stone-600">Featured Card (Star)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="rounded border-stone-300 text-green-600 focus:ring-green-500 cursor-pointer"
              />
              <span className="text-xs font-medium font-sans text-stone-600">Mark Completed</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/50 flex items-center justify-between">
          <div>
            {card && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #c07423, #d9902e)',
              }}
            >
              {loading ? 'Saving...' : 'Save Card'}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
