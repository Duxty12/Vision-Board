'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Calendar, Flag, RotateCcw, AlertCircle, Play, Youtube } from 'lucide-react';
import type { CardWithRelations, CardType, Priority, RecurrenceRule, Media } from '@/lib/types';
import { ColorPicker } from './ColorPicker';
import { createCard, updateCard, deleteCard } from '@/lib/actions/cards';
import { createSubtask, toggleSubtaskCompleted, updateSubtaskTitle, deleteSubtask } from '@/lib/actions/subtasks';
import { ImageDropzone } from '../media/ImageDropzone';
import { VideoUrlInput } from '../media/VideoUrlInput';
import { createMedia, deleteMedia } from '@/lib/actions/media';

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

  // Quote-specific Fields
  const [content, setContent] = useState('');
  const [attribution, setAttribution] = useState('');

  // Media-specific Fields
  const [imageStoragePath, setImageStoragePath] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    youtube_url: string | null;
    youtube_video_id: string | null;
    thumbnail_url: string | null;
    title?: string | null;
  } | null>(null);

  const originalMediaRef = useRef<Media[]>([]);

  // Video Playing state for enlarged detail modal player
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize form when card changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsVideoPlaying(false);
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

        setContent(card.content || '');
        setAttribution(card.attribution || '');

        const initialSubtasks = (card.subtasks || []).map((sub) => ({
          id: sub.id,
          title: sub.title,
          is_completed: sub.is_completed,
        }));
        setSubtasks(initialSubtasks);
        originalSubtasksRef.current = JSON.parse(JSON.stringify(initialSubtasks));

        const cardMedia = card.media || [];
        originalMediaRef.current = cardMedia;

        const img = cardMedia.find((m) => m.media_type === 'image');
        setImageStoragePath(img ? img.storage_path : null);

        const vid = cardMedia.find((m) => m.media_type === 'video');
        setVideoInfo(
          vid
            ? {
                youtube_url: vid.youtube_url,
                youtube_video_id: vid.youtube_video_id,
                thumbnail_url: vid.thumbnail_url,
                title: 'YouTube Video',
              }
            : null
        );
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

        setContent('');
        setAttribution('');
        setImageStoragePath(null);
        setVideoInfo(null);
        originalMediaRef.current = [];
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

    // ── 0. Validate Fields based on Type ──
    let cardTitle = title.trim();
    if (type === 'quote') {
      if (!content.trim()) {
        setError('Quote content is required');
        return;
      }
      cardTitle = title.trim() || 'Quote';
    } else if (type === 'image') {
      if (!imageStoragePath) {
        setError('An image upload is required for image cards');
        return;
      }
      cardTitle = title.trim() || 'Image Card';
    } else if (type === 'video') {
      if (!videoInfo || !videoInfo.youtube_video_id) {
        setError('A YouTube video link is required for video cards');
        return;
      }
      cardTitle = title.trim() || videoInfo.title || 'Video Card';
    } else {
      if (!cardTitle) {
        setError('Title is required');
        return;
      }
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
        title: cardTitle,
        description: description || null,
        content: type === 'quote' ? content : null,
        attribution: type === 'quote' ? attribution : null,
        color,
        is_completed: isCompleted,
        is_starred: isStarred,
        category: type === 'goal' ? category : null,
        target_year: type === 'goal' ? targetYear : null,
        priority: type === 'task' ? priority : null,
        due_date: type === 'task' && dueDate ? dueDate : null,
        is_recurring: type === 'task' ? isRecurring : false,
        recurrence_rule: type === 'task' && isRecurring ? recurrenceRule : null,
        position_x: card ? card.position_x : 0,
        position_y: card ? card.position_y : 0,
        width: card ? card.width : 220,
        height: card ? card.height : 220,
        z_index: card ? card.z_index : 1,
        rotation: card ? card.rotation : 0,
      };

      let savedCard;
      if (card) {
        savedCard = await updateCard(card.id, cardInput);
      } else {
        savedCard = await createCard(cardInput);
      }

      const cardId = savedCard.id;

      // ── 2. Sync Subtasks (tasks only) ──
      if (type === 'task') {
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
            await createSubtask({
              card_id: cardId,
              title: sub.title.trim() || 'Subtask',
              position: i,
            });
          } else if (sub.id) {
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

      // ── 3. Sync Media (images & videos) ──
      const originalMedia = originalMediaRef.current || [];
      const originalImage = originalMedia.find((m) => m.media_type === 'image');
      const originalVideo = originalMedia.find((m) => m.media_type === 'video');

      // Sync Image attachment
      if (imageStoragePath !== (originalImage?.storage_path || null)) {
        if (originalImage) {
          await deleteMedia(originalImage.id);
        }
        if (imageStoragePath) {
          await createMedia({
            card_id: cardId,
            media_type: 'image',
            storage_path: imageStoragePath,
          });
        }
      }

      // Sync Video attachment
      const currentVideoUrl = videoInfo?.youtube_url || null;
      const originalVideoUrl = originalVideo?.youtube_url || null;
      if (currentVideoUrl !== originalVideoUrl) {
        if (originalVideo) {
          await deleteMedia(originalVideo.id);
        }
        if (videoInfo && videoInfo.youtube_video_id) {
          await createMedia({
            card_id: cardId,
            media_type: 'video',
            youtube_url: videoInfo.youtube_url,
            youtube_video_id: videoInfo.youtube_video_id,
            thumbnail_url: videoInfo.thumbnail_url,
          });
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

          {/* Playable YouTube Video Player (Enlarged card view iframe/facade) */}
          {videoInfo?.youtube_video_id && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-200/20 shadow-md group mb-4">
              {isVideoPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoInfo.youtube_video_id}?autoplay=1`}
                  title={title || 'YouTube video player'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full absolute inset-0"
                />
              ) : (
                <div 
                  className="w-full h-full relative cursor-pointer"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  {videoInfo.thumbnail_url ? (
                    <img
                      src={videoInfo.thumbnail_url}
                      alt="Video preview"
                      className="w-full h-full object-cover select-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                      <Youtube size={48} className="text-rose-600" />
                    </div>
                  )}
                  {/* Overlay and play button */}
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/95 text-stone-850 flex items-center justify-center shadow-lg transition-transform duration-300 scale-95 group-hover:scale-105">
                      <Play size={20} className="fill-stone-855 translate-x-0.5 text-stone-855" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Type Toggle (Only for new cards) */}
          {!card && (
            <div className="flex flex-wrap gap-1 p-1 bg-stone-100 rounded-xl">
              {(['goal', 'task', 'image', 'quote', 'video'] as CardType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold font-sans transition-all duration-200 capitalize ${
                    type === t ? 'bg-white text-stone-850 shadow-sm' : 'text-stone-500 hover:text-stone-850'
                  }`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Title - Hidden for quotes */}
          {type !== 'quote' && (
            <div className="space-y-1.5 animate-[fade-in_0.2s_ease-out]">
              <label htmlFor="card-title" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                {type === 'image' ? 'Caption' : 'Title'}
              </label>
              <input
                id="card-title"
                type="text"
                required={type !== 'image' && type !== 'video'}
                placeholder={
                  type === 'goal'
                    ? 'e.g. Run a Half Marathon'
                    : type === 'task'
                    ? 'e.g. Prepare presentation slides'
                    : type === 'image'
                    ? 'e.g. Dream House (optional caption)'
                    : 'e.g. Inspiring Talk (optional)'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white placeholder:text-stone-400 text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200"
              />
            </div>
          )}

          {/* Description - Hidden for quotes */}
          {type !== 'quote' && (
            <div className="space-y-1.5 animate-[fade-in_0.2s_ease-out]">
              <label htmlFor="card-desc" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                {type === 'image' || type === 'video' ? 'Notes' : 'Description'}
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
          )}

          {/* Quote Fields */}
          {type === 'quote' && (
            <div className="space-y-4 animate-[fade-in_0.2s_ease-out]">
              <div className="space-y-1.5">
                <label htmlFor="quote-text" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                  Quote Text
                </label>
                <textarea
                  id="quote-text"
                  required
                  rows={4}
                  placeholder="Type or paste the quote text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white placeholder:text-stone-400 text-stone-850 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200 font-serif italic"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="quote-author" className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                  Attribution (Author)
                </label>
                <input
                  id="quote-author"
                  type="text"
                  placeholder="e.g. Maya Angelou"
                  value={attribution}
                  onChange={(e) => setAttribution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white placeholder:text-stone-400 text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Image Fields */}
          {type === 'image' && (
            <div className="space-y-4 animate-[fade-in_0.2s_ease-out]">
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                  Upload Image
                </label>
                <ImageDropzone
                  cardId={card?.id}
                  value={imageStoragePath}
                  onUploadSuccess={setImageStoragePath}
                  onRemove={() => setImageStoragePath(null)}
                />
              </div>
            </div>
          )}

          {/* Video Fields */}
          {type === 'video' && (
            <div className="space-y-4 animate-[fade-in_0.2s_ease-out]">
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                  YouTube Video Link
                </label>
                <VideoUrlInput
                  value={videoInfo}
                  onSelect={(info) => {
                    setVideoInfo({
                      youtube_url: info.youtubeUrl,
                      youtube_video_id: info.youtubeVideoId,
                      thumbnail_url: info.thumbnailUrl,
                      title: info.title,
                    });
                    if (!title) {
                      setTitle(info.title);
                    }
                  }}
                  onRemove={() => setVideoInfo(null)}
                />
              </div>
            </div>
          )}

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
              Card Color
            </label>
            <ColorPicker selectedColor={color} onChange={setColor} />
          </div>

          {/* ── Goal Fields ── */}
          {type === 'goal' && (
            <div className="grid grid-cols-2 gap-4 animate-[fade-in_0.2s_ease-out]">
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
            <div className="space-y-5 animate-[fade-in_0.2s_ease-out]">
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

          {/* Media Attachments (for Goal and Task) */}
          {(type === 'goal' || type === 'task') && (
            <div className="border-t border-stone-200/60 pt-4 space-y-4 animate-[fade-in_0.2s_ease-out]">
              <h4 className="text-xs font-bold font-sans text-stone-700 uppercase tracking-wider">
                Media Attachments (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-sans text-stone-500 uppercase tracking-wider">
                    Attach Image
                  </label>
                  <ImageDropzone
                    cardId={card?.id}
                    value={imageStoragePath}
                    onUploadSuccess={setImageStoragePath}
                    onRemove={() => setImageStoragePath(null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-sans text-stone-500 uppercase tracking-wider">
                    Attach YouTube Video
                  </label>
                  <VideoUrlInput
                    value={videoInfo}
                    onSelect={(info) => {
                      setVideoInfo({
                        youtube_url: info.youtubeUrl,
                        youtube_video_id: info.youtubeVideoId,
                        thumbnail_url: info.thumbnailUrl,
                        title: info.title,
                      });
                    }}
                    onRemove={() => setVideoInfo(null)}
                  />
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
