import React, { useState, useEffect } from 'react';
import { Task, StudentCategory, TaskPriority, EnergyRequirement } from '../../types/task';
import { X, Trash2, Plus, Sparkles, Check, Clock } from 'lucide-react';
import { classifyTaskSize } from '../../engine/learningEngine';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  initialTask?: Task | null;
  predictedDuration?: number;
}

const CATEGORIES: StudentCategory[] = [
  'CS / Coding',
  'Mathematics',
  'Reading & Essays',
  'Natural Sciences',
  'Exams & Quizzes',
  'Admin & Quick Tasks'
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  predictedDuration
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(45);
  const [category, setCategory] = useState<StudentCategory>('CS / Coding');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [energyLevel, setEnergyLevel] = useState<EnergyRequirement>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string; completed: boolean }>>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setNotes(initialTask.notes || '');
      setEstimatedDuration(initialTask.estimatedDuration);
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setEnergyLevel(initialTask.energyLevel);
      setDueDate(initialTask.dueDate);
      setSubtasks(initialTask.subtasks || []);
    } else {
      setTitle('');
      setNotes('');
      setEstimatedDuration(45);
      setCategory('CS / Coding');
      setPriority('medium');
      setEnergyLevel('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setSubtasks([]);
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: newSubtaskTitle.trim(),
        completed: false
      }
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskToSave: Task = {
      id: initialTask ? initialTask.id : `task-${Date.now()}`,
      title: title.trim(),
      notes: notes.trim(),
      estimatedDuration,
      predictedDuration: predictedDuration || estimatedDuration,
      dueDate,
      category,
      priority,
      energyLevel,
      sizeBucket: classifyTaskSize(estimatedDuration),
      subtasks,
      status: initialTask ? initialTask.status : 'todo',
      createdAt: initialTask ? initialTask.createdAt : Date.now()
    };

    onSave(taskToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="studio-panel w-full max-w-lg rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <h2 className="text-lg font-heading font-bold text-white">
              {initialTask ? 'Edit Academic Task' : 'Schedule New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Task or Assignment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Multivariable Calculus Problem Set 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Notes / Textbook Problems / Links
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Problems 12-25 on Canvas, formulas on page 340..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-white placeholder-slate-500 outline-none transition text-xs"
            />
          </div>

          {/* Category & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Course / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StudentCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-sky-400"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Duration & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Estimated Duration: <strong className="text-white">{estimatedDuration} min</strong>
              </label>
              {predictedDuration && predictedDuration !== estimatedDuration && (
                <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Model Predicts: ~{predictedDuration} min
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setEstimatedDuration(mins)}
                  className={`py-1 rounded-lg text-xs font-mono border transition ${
                    estimatedDuration === mins
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* Priority & Energy Required */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Priority
              </label>
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1 rounded capitalize text-[11px] font-mono ${
                      priority === p ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Cognitive Effort
              </label>
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value as EnergyRequirement)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-sky-400"
              >
                <option value="high_focus">🧠 Deep High Focus</option>
                <option value="medium">⚡ Balanced Effort</option>
                <option value="low_energy">🌿 Low Energy / Quick</option>
              </select>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Subtasks & Milestones ({subtasks.length})
            </label>

            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-300">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add step (e.g. Read chapter 3 proofs)"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {initialTask && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialTask.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-mono font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition shadow-lg shadow-sky-500/20"
              >
                {initialTask ? 'Update Task' : 'Save & Slot into Timeline'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
