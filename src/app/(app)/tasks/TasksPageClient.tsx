'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, Plus, Star, CheckCircle2, Flag, RotateCcw, Calendar, SlidersHorizontal, AlertCircle } from 'lucide-react';
import type { CardWithRelations, Priority } from '@/lib/types';
import { CardCompactView } from '@/components/cards/CardCompactView';
import { CardEditorModal } from '@/components/cards/CardEditorModal';
import { CardExpandedView } from '@/components/cards/CardExpandedView';
import { toggleCardCompleted, toggleCardStarred } from '@/lib/actions/cards';
import { toggleSubtaskCompleted } from '@/lib/actions/subtasks';

interface TasksPageClientProps {
  initialCards: CardWithRelations[];
}

export function TasksPageClient({ initialCards }: TasksPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [activePriority, setActivePriority] = useState<string>('All');
  const [activeDueRange, setActiveDueRange] = useState<string>('All'); // 'All' | 'Today' | 'Overdue' | 'Upcoming'
  const [showStarred, setShowStarred] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'newest' | 'oldest'>('due_date');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Editor Modal State
  const [selectedCard, setSelectedCard] = useState<CardWithRelations | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExpandedOpen, setIsExpandedOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Stats Calculations
  const dueTodayCount = initialCards.filter(
    (c) => c.due_date === todayStr && !c.is_completed
  ).length;

  const overdueCount = initialCards.filter(
    (c) => c.due_date && c.due_date < todayStr && !c.is_completed
  ).length;

  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };
  const startOfWeek = getStartOfWeek(new Date());
  startOfWeek.setHours(0, 0, 0, 0);

  const doneThisWeekCount = initialCards.filter(
    (c) => c.is_completed && c.updated_at && new Date(c.updated_at) >= startOfWeek
  ).length;

  // Filter & Sort Logic
  const filteredCards = initialCards
    .filter((card) => {
      // Priority
      if (activePriority !== 'All' && card.priority !== activePriority.toLowerCase()) return false;

      // Due range
      if (activeDueRange === 'Today') {
        if (card.due_date !== todayStr) return false;
      } else if (activeDueRange === 'Overdue') {
        if (!card.due_date || card.due_date >= todayStr || card.is_completed) return false;
      } else if (activeDueRange === 'Upcoming') {
        if (!card.due_date || card.due_date <= todayStr) return false;
      }

      // Starred
      if (showStarred && !card.is_starred) return false;

      // Completed
      if (showCompleted && !card.is_completed) return false;

      // Recurring
      if (showRecurring && !card.is_recurring) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'priority') {
        const priorityRank = { high: 3, medium: 2, low: 1 };
        const aRank = priorityRank[a.priority || 'medium'] || 2;
        const bRank = priorityRank[b.priority || 'medium'] || 2;
        return bRank - aRank; // High priority first
      }
      // Default: due_date asc (nulls last)
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  // Toggle Actions
  const handleToggleCompleted = async (cardId: string) => {
    startTransition(async () => {
      try {
        await toggleCardCompleted(cardId);
        router.refresh();
      } catch (err) {
        console.error('Failed to toggle card complete:', err);
      }
    });
  };

  const handleToggleStarred = async (cardId: string) => {
    startTransition(async () => {
      try {
        await toggleCardStarred(cardId);
        router.refresh();
      } catch (err) {
        console.error('Failed to toggle card star:', err);
      }
    });
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    startTransition(async () => {
      try {
        await toggleSubtaskCompleted(subtaskId);
        router.refresh();
      } catch (err) {
        console.error('Failed to toggle subtask:', err);
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <CheckSquare size={22} className="text-cork-500" />
            <h1 className="font-display text-2xl font-bold text-stone-900">Tasks</h1>
          </div>
          <p className="text-stone-500 text-sm font-sans">
            Break it down. Check it off.
          </p>
        </div>
        <button
          id="add-task-btn"
          onClick={() => {
            setSelectedCard(null);
            setIsEditorOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold font-sans transition-all duration-200 hover:scale-105 hover:opacity-90 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #c07423, #d9902e)',
          }}
        >
          <Plus size={16} />
          New task
        </button>
      </div>

      {/* ── Stat Widgets ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Due Today', value: dueTodayCount, color: '#FFF3B0', icon: Calendar },
          { label: 'Overdue', value: overdueCount, color: '#FFB3C6', icon: AlertCircle },
          { label: 'Done This Week', value: doneThisWeekCount, color: '#B7F0D4', icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="glass-card p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 border border-stone-200/50 dark:border-[#383a45]"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: color }}
            >
              <Icon size={18} className="text-stone-850" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-white leading-none mb-0.5">{value}</div>
              <div className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-sans font-semibold uppercase tracking-wider truncate">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-2 mb-6 flex-wrap select-none">
        <button
          id="task-filter-all"
          className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 ${activePriority === 'All' && activeDueRange === 'All' && !showRecurring
              ? 'bg-cork-500 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-600 hover:border-cork-300 hover:text-cork-700'
            }`}
          onClick={() => {
            setActivePriority('All');
            setActiveDueRange('All');
            setShowRecurring(false);
          }}
        >
          All
        </button>

        {/* Priority Filters */}
        <button
          id="task-filter-high"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${activePriority === 'High'
              ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
              : 'bg-white border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-700'
            }`}
          onClick={() => {
            setActivePriority(activePriority === 'High' ? 'All' : 'High');
            setActiveDueRange('All');
            setShowRecurring(false);
          }}
        >
          <Flag size={10} className={activePriority === 'High' ? 'fill-white' : ''} />
          High priority
        </button>

        <button
          id="task-filter-medium"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${activePriority === 'Medium'
              ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
              : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700'
            }`}
          onClick={() => {
            setActivePriority(activePriority === 'Medium' ? 'All' : 'Medium');
            setActiveDueRange('All');
            setShowRecurring(false);
          }}
        >
          <Flag size={10} className={activePriority === 'Medium' ? 'fill-white' : ''} />
          Medium
        </button>

        {/* Due Date Filters */}
        <button
          id="task-filter-today"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${activeDueRange === 'Today'
              ? 'bg-sky-500 border-sky-500 text-white shadow-sm'
              : 'bg-white border-stone-200 text-stone-600 hover:border-sky-300 hover:text-sky-750'
            }`}
          onClick={() => {
            setActiveDueRange(activeDueRange === 'Today' ? 'All' : 'Today');
            setActivePriority('All');
            setShowRecurring(false);
          }}
        >
          <Calendar size={10} />
          Due today
        </button>

        <button
          id="task-filter-overdue"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${activeDueRange === 'Overdue'
              ? 'bg-red-500 border-red-500 text-white shadow-sm'
              : 'bg-white border-stone-200 text-stone-600 hover:border-red-350 hover:text-red-700'
            }`}
          onClick={() => {
            setActiveDueRange(activeDueRange === 'Overdue' ? 'All' : 'Overdue');
            setActivePriority('All');
            setShowRecurring(false);
          }}
        >
          <AlertCircle size={10} />
          Overdue
        </button>

        {/* Recurring Filter */}
        <button
          id="task-filter-recurring"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${showRecurring
              ? 'bg-purple-650 border-purple-650 text-white shadow-sm'
              : 'bg-white border-stone-200 text-stone-600 hover:border-purple-300 hover:text-purple-750'
            }`}
          onClick={() => {
            setShowRecurring(!showRecurring);
            setActivePriority('All');
            setActiveDueRange('All');
          }}
        >
          <RotateCcw size={10} />
          Recurring
        </button>

        {/* Starred & Completed Buttons */}
        <div className="ml-auto flex items-center gap-2">
          <button
            id="task-filter-starred"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${showStarred
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-750'
              }`}
            onClick={() => setShowStarred(!showStarred)}
          >
            <Star size={11} className={showStarred ? 'fill-white' : ''} />
            Starred
          </button>

          <button
            id="task-filter-completed"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${showCompleted
                ? 'bg-green-600 border-green-600 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-green-300 hover:text-green-700'
              }`}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <CheckCircle2 size={11} />
            Done
          </button>

          {/* Sort selector */}
          <div className="relative">
            <button
              id="task-sort"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans bg-white border border-stone-200 text-stone-600 hover:border-stone-300 transition-all duration-200"
            >
              <SlidersHorizontal size={11} />
              Sort: {sortBy === 'due_date' ? 'Due Date' : sortBy === 'priority' ? 'Priority' : sortBy === 'newest' ? 'Newest' : 'Oldest'}
            </button>

            {isSortDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSortDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-20 animate-fade-in">
                  {(['due_date', 'priority', 'newest', 'oldest'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-medium font-sans hover:bg-stone-50 transition-colors ${sortBy === mode ? 'text-cork-600 font-semibold' : 'text-stone-600'
                        }`}
                      onClick={() => {
                        setSortBy(mode);
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      {mode === 'due_date' ? 'Due Date (Soonest)' : mode === 'priority' ? 'Priority (High first)' : mode === 'newest' ? 'Newest First' : 'Oldest First'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tasks Grid ── */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'
          }`}
      >
        {filteredCards.map((card) => (
          <CardCompactView
            key={card.id}
            card={card}
            onClick={() => {
              setSelectedCard(card);
              setIsExpandedOpen(true);
            }}
            onToggleCompleted={handleToggleCompleted}
            onToggleStarred={handleToggleStarred}
          />
        ))}

        {/* Inline Add Button */}
        <button
          id="tasks-add-inline"
          onClick={() => {
            setSelectedCard(null);
            setIsEditorOpen(true);
          }}
          className="
            w-full rounded-sticky border-2 border-dashed border-stone-300
            hover:border-cork-400 hover:bg-cork-50/50
            flex flex-col items-center justify-center gap-2
            text-stone-400 hover:text-cork-600
            transition-all duration-200 cursor-pointer p-5
            min-h-[190px]
          "
        >
          <Plus size={24} />
          <span className="text-xs font-semibold font-sans">Add Task</span>
        </button>
      </div>

      {/* ── Expanded Card View ── */}
      {selectedCard && (
        <CardExpandedView
          card={initialCards.find((c) => c.id === selectedCard.id) || selectedCard}
          isOpen={isExpandedOpen}
          onClose={() => setIsExpandedOpen(false)}
          onEdit={() => {
            setIsExpandedOpen(false);
            setIsEditorOpen(true);
          }}
          onToggleCompleted={handleToggleCompleted}
          onToggleStarred={handleToggleStarred}
          onToggleSubtask={handleToggleSubtask}
        />
      )}

      {/* ── Editor Modal ── */}
      <CardEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        card={selectedCard}
        cardType="task"
        allowedTypes={['task']}
      />
    </div>
  );
}
