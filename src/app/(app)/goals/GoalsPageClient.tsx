'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Plus, Star, CheckCircle2, Tag, SlidersHorizontal, TrendingUp } from 'lucide-react';
import type { CardWithRelations } from '@/lib/types';
import { CardCompactView } from '@/components/cards/CardCompactView';
import { CardEditorModal } from '@/components/cards/CardEditorModal';
import { toggleCardCompleted, toggleCardStarred } from '@/lib/actions/cards';

interface GoalsPageClientProps {
  initialCards: CardWithRelations[];
}

const CATEGORIES = ['Career', 'Health', 'Travel', 'Home', 'Relationships'];

export function GoalsPageClient({ initialCards }: GoalsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters & Sorting State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showStarred, setShowStarred] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Editor Modal State
  const [selectedCard, setSelectedCard] = useState<CardWithRelations | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Progress Calculations
  const completedCount = initialCards.filter((c) => c.is_completed).length;
  const totalCount = initialCards.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  initialCards.forEach((c) => {
    if (c.category) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }
  });

  // Filter & Sort Logic
  const filteredCards = initialCards
    .filter((card) => {
      if (activeCategory !== 'All' && card.category !== activeCategory) return false;
      if (showStarred && !card.is_starred) return false;
      if (showCompleted && !card.is_completed) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Target size={22} className="text-cork-500" />
            <h1 className="font-display text-2xl font-bold text-stone-900">Goals</h1>
          </div>
          <p className="text-stone-500 text-sm font-sans">
            Pin your dreams. Track your journey.
          </p>
        </div>
        <button
          id="add-goal-btn"
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
          New goal
        </button>
      </div>

      {/* ── Progress Widget ── */}
      <div className="mb-6">
        <div className="glass-card p-5 rounded-2xl flex items-center gap-6 border border-stone-200/50">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              {/* Outer track */}
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#eeeada"
                strokeWidth="3.5"
              />
              {/* Filled progress */}
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#d9902e"
                strokeWidth="3.5"
                strokeDasharray={`${percentComplete} 100`}
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-bold text-lg text-stone-850">{percentComplete}%</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} className="text-cork-500" />
              <span className="font-semibold text-stone-800 font-display text-sm">Goal Progress</span>
            </div>
            <p className="text-stone-500 text-xs font-sans">
              {completedCount} of {totalCount} goals completed
            </p>
            <div className="flex flex-wrap gap-2.5 mt-3">
              {CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] || 0;
                return (
                  <span
                    key={cat}
                    className={`category-tag text-[10px] font-semibold font-sans px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                      count > 0 ? 'bg-cork-100 text-cork-800' : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <Tag size={10} />
                    {cat} ({count})
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Sort Bar ── */}
      <div className="flex items-center gap-2 mb-6 flex-wrap select-none">
        {/* Category filters */}
        <button
          id="filter-all-goals"
          className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 ${
            activeCategory === 'All'
              ? 'bg-cork-500 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-600 hover:border-cork-300 hover:text-cork-700'
          }`}
          onClick={() => setActiveCategory('All')}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`filter-${cat.toLowerCase()}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-cork-500 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-cork-300 hover:text-cork-700'
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}

        {/* Right side filter toggles */}
        <div className="ml-auto flex items-center gap-2">
          {/* Star Filter */}
          <button
            id="filter-starred-goals"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${
              showStarred
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700'
            }`}
            onClick={() => setShowStarred(!showStarred)}
          >
            <Star size={11} className={showStarred ? 'fill-white' : ''} />
            Starred
          </button>

          {/* Completed Filter */}
          <button
            id="filter-completed-goals"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 border ${
              showCompleted
                ? 'bg-green-600 border-green-600 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-green-300 hover:text-green-700'
            }`}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <CheckCircle2 size={11} />
            Done
          </button>

          {/* Sort Menu */}
          <div className="relative">
            <button
              id="sort-goals"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans bg-white border border-stone-200 text-stone-600 hover:border-stone-300 transition-all duration-200"
            >
              <SlidersHorizontal size={11} />
              Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Title'}
            </button>

            {isSortDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSortDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-32 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-20 animate-fade-in">
                  {(['newest', 'oldest', 'title'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-medium font-sans hover:bg-stone-50 transition-colors ${
                        sortBy === mode ? 'text-cork-600 font-semibold' : 'text-stone-600'
                      }`}
                      onClick={() => {
                        setSortBy(mode);
                        setIsSortDropdownOpen(false);
                      }}
                    >
                      {mode === 'newest' ? 'Newest First' : mode === 'oldest' ? 'Oldest First' : 'Title (A-Z)'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Goals Grid ── */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 transition-opacity duration-200 ${
          isPending ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {filteredCards.map((card) => (
          <CardCompactView
            key={card.id}
            card={card}
            onClick={() => {
              setSelectedCard(card);
              setIsEditorOpen(true);
            }}
            onToggleCompleted={handleToggleCompleted}
            onToggleStarred={handleToggleStarred}
          />
        ))}

        {/* Inline Add Button */}
        <button
          id="goals-add-inline"
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
          <span className="text-xs font-semibold font-sans">Add Goal</span>
        </button>
      </div>

      {/* ── Editor Modal ── */}
      <CardEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        card={selectedCard}
        cardType="goal"
      />
    </div>
  );
}
