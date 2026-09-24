import React, { useState } from 'react';
import { Assignment } from '../../types/assignment';
import { 
  formatDeadlineCountdown, 
  formatStopwatchTime, 
  copyAssignmentRequirements 
} from '../../utils/analytics';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  Share2, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Award,
  Calendar,
  Zap,
  TrendingUp
} from 'lucide-react';

interface WarmTaskCardProps {
  assignment: Assignment;
  onUpdate: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
}

export const WarmTaskCard: React.FC<WarmTaskCardProps> = ({
  assignment,
  onUpdate,
  onDelete,
  onStartTimer,
  onPauseTimer,
  onResetTimer
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingMarks, setIsEditingMarks] = useState(false);
  const [marksInput, setMarksInput] = useState(assignment.marksReceived?.toString() || '');
  const [maxMarksInput, setMaxMarksInput] = useState(assignment.maxMarks?.toString() || '100');

  const countdown = formatDeadlineCountdown(assignment.deadline);
  const isDone = assignment.status === 'completed';

  // Live Efficiency calculation:
  // Efficiency % = Estimated Hours / Actual Hours * 100
  const estimated = assignment.estimatedHours;
  const actual = assignment.actualHours || 0;
  
  let efficiencyPercent: number | null = null;
  if (actual > 0) {
    efficiencyPercent = Math.round((estimated / actual) * 100);
  } else {
    // If not started yet, 100% baseline
    efficiencyPercent = 100;
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyAssignmentRequirements(assignment);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleStatus = () => {
    const newStatus = isDone ? 'in_progress' : 'completed';
    onUpdate({
      ...assignment,
      status: newStatus,
      isTimerRunning: false,
      completedAt: newStatus === 'completed' ? Date.now() : undefined
    });
  };

  const handleSaveMarks = () => {
    const marks = parseFloat(marksInput);
    const maxMarks = parseFloat(maxMarksInput);
    if (!isNaN(marks) && !isNaN(maxMarks) && maxMarks > 0) {
      onUpdate({
        ...assignment,
        marksReceived: marks,
        maxMarks: maxMarks,
        gradedDate: new Date().toISOString().split('T')[0]
      });
      setIsEditingMarks(false);
    }
  };

  const getCourseBadgeColor = (course: string) => {
    if (course.includes('CS') || course.includes('Operating')) return 'bg-amber-100/90 text-amber-900 border-amber-300';
    if (course.includes('MATH') || course.includes('Linear')) return 'bg-orange-100/90 text-orange-900 border-orange-300';
    if (course.includes('PHYS') || course.includes('Electro')) return 'bg-rose-100/90 text-rose-900 border-rose-300';
    if (course.includes('BIO') || course.includes('Genetics')) return 'bg-emerald-100/90 text-emerald-900 border-emerald-300';
    return 'bg-purple-100/90 text-purple-900 border-purple-300';
  };

  return (
    <div
      className={`warm-card rounded-2xl border transition-all duration-200 overflow-hidden ${
        assignment.isTimerRunning
          ? 'border-orange-400 ring-2 ring-orange-400/30 shadow-lg shadow-orange-500/10'
          : isDone
          ? 'bg-stone-50/70 border-stone-200 opacity-85'
          : 'bg-white border-amber-200/70 hover:border-orange-300'
      }`}
    >
      {/* Top Header Row */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badges Row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {/* Course Tag */}
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg border shadow-xs ${getCourseBadgeColor(assignment.courseName)}`}>
                {assignment.courseName}
              </span>

              {/* Complexity Badge */}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-semibold">
                ★ Level {assignment.complexity}
              </span>

              {/* Deadline & Live Countdown Badge */}
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border shadow-xs ${
                  countdown.status === 'overdue'
                    ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                    : countdown.status === 'urgent'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <Clock className="w-3 h-3 text-current" />
                <span>{countdown.text}</span>
              </span>
            </div>

            {/* Assignment Title */}
            <h3 className={`text-base font-bold text-stone-900 tracking-tight leading-snug ${isDone ? 'line-through text-stone-400' : ''}`}>
              {assignment.title}
            </h3>

            {/* Target Deadline Date String */}
            <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 font-mono">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Target: {new Date(assignment.deadline).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Quick Actions (Check done, Share, Delete) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleShare}
              title="Copy Requirements Summary"
              className="p-1.5 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onDelete(assignment.id)}
              title="Delete Assignment"
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleStatus}
              title={isDone ? 'Mark as in progress' : 'Mark as completed'}
              className="p-1.5 text-stone-400 hover:text-emerald-600 transition"
            >
              {isDone ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
              ) : (
                <Circle className="w-6 h-6 hover:scale-105 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Live Stopwatch & Experiment Controls (Item 4) */}
      <div className="px-4 sm:px-5 py-3 bg-amber-50/40 border-y border-amber-200/50 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Stopwatch Digital Display */}
          <div className="flex items-center gap-2 bg-white border border-amber-200 px-3 py-1.5 rounded-xl font-mono text-sm font-extrabold text-stone-900 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${assignment.isTimerRunning ? 'bg-orange-500 animate-ping' : 'bg-stone-300'}`} />
            <span>{formatStopwatchTime(assignment.timerSecondsElapsed || 0)}</span>
          </div>

          {/* Stopwatch Buttons: Start / Pause / Reset */}
          {assignment.isTimerRunning ? (
            <button
              onClick={() => onPauseTimer(assignment.id)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => onStartTimer(assignment.id)}
              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{assignment.timerSecondsElapsed ? 'Resume' : 'Start Timer'}</span>
            </button>
          )}

          {/* Reset Button */}
          <button
            onClick={() => onResetTimer(assignment.id)}
            title="Reset Stopwatch"
            className="p-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-400 hover:text-stone-700 border border-stone-200 transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Academic Marks & Score Editor */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {isEditingMarks ? (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-orange-300 shadow-sm">
              <input
                type="number"
                placeholder="Score"
                value={marksInput}
                onChange={(e) => setMarksInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 bg-stone-50 text-stone-900 rounded text-center outline-none border border-stone-200"
              />
              <span className="text-stone-400 font-bold">/</span>
              <input
                type="number"
                placeholder="Max"
                value={maxMarksInput}
                onChange={(e) => setMaxMarksInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 bg-stone-50 text-stone-900 rounded text-center outline-none border border-stone-200"
              />
              <button
                onClick={handleSaveMarks}
                className="px-2 py-0.5 rounded bg-orange-500 text-white font-bold hover:bg-orange-600"
              >
                ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingMarks(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-stone-50 border border-amber-200/80 text-stone-700 transition shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-orange-500" />
              {typeof assignment.marksReceived === 'number' && typeof assignment.maxMarks === 'number' ? (
                <span className="font-bold text-stone-900">
                  {assignment.marksReceived}/{assignment.maxMarks} ({Math.round((assignment.marksReceived / assignment.maxMarks) * 100)}%)
                </span>
              ) : (
                <span className="text-stone-500 font-medium">Pending Grade</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Metrics Bar (Item 5) */}
      <div className="px-4 sm:px-5 py-3 bg-white flex items-center justify-between text-xs font-mono flex-wrap gap-2">
        {/* Estimated vs Actual */}
        <div className="flex items-center gap-3">
          <span className="text-stone-500">
            Est: <strong className="text-stone-800">{assignment.estimatedHours}h</strong>
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-500">
            Actual: <strong className="text-stone-900">{actual}h</strong>
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            AI Pred: ~{assignment.predictedHours}h
          </span>
        </div>

        {/* Live Efficiency % badge */}
        <div>
          <span
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border font-mono ${
              efficiencyPercent !== null && efficiencyPercent >= 90
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-orange-100 text-orange-800 border-orange-300'
            }`}
          >
            {efficiencyPercent}% Efficiency
          </span>
        </div>
      </div>

      {/* Expandable Requirements / Rubrics Drawer */}
      {assignment.requirements && (
        <div className="px-4 sm:px-5 pb-3 bg-white">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-mono text-stone-500 hover:text-stone-800 transition py-1 border-t border-stone-100"
          >
            <span>Requirements & Rubrics Specifications</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-2 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-800 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-150">
              {assignment.requirements}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
