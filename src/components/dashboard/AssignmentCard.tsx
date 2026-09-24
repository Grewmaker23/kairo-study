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
  Square, 
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
  AlertTriangle,
  Zap,
  Edit3
} from 'lucide-react';

interface AssignmentCardProps {
  assignment: Assignment;
  onUpdate: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
  onStopTimer: (id: string) => void;
  onEdit: (assignment: Assignment) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onUpdate,
  onDelete,
  onStartTimer,
  onPauseTimer,
  onStopTimer,
  onEdit
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingMarks, setIsEditingMarks] = useState(false);
  const [marksInput, setMarksInput] = useState(assignment.marksReceived?.toString() || '');
  const [maxMarksInput, setMaxMarksInput] = useState(assignment.maxMarks?.toString() || '100');

  const countdown = formatDeadlineCountdown(assignment.deadline);

  // Time metrics
  const estimated = assignment.estimatedHours;
  const actual = assignment.actualHours || 0;
  const isDone = assignment.status === 'completed';

  // Efficiency / Accuracy calculation:
  // If task has actual recorded time:
  const efficiencyRatio = actual > 0 ? Number((actual / estimated).toFixed(2)) : null;
  const accuracyPercent = actual > 0 ? Math.min(100, Math.round((estimated / actual) * 100)) : null;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyAssignmentRequirements(assignment);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = isDone ? 'in_progress' : 'completed';
    const updated: Assignment = {
      ...assignment,
      status: newStatus,
      completedAt: newStatus === 'completed' ? Date.now() : undefined,
      isTimerRunning: false
    };
    onUpdate(updated);
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

  return (
    <div
      className={`dashboard-card rounded-2xl transition-all duration-200 border overflow-hidden ${
        assignment.isTimerRunning
          ? 'card-glow-teal border-teal-500/50 ring-1 ring-teal-500/30'
          : isDone
          ? 'bg-slate-900/40 border-slate-800 opacity-80'
          : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Top Banner Indicator */}
      <div className="px-5 pt-4 pb-2 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {/* Course Tag */}
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {assignment.courseName}
            </span>

            {/* Complexity Badge */}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              ★ Level {assignment.complexity}
            </span>

            {/* Countdown Badge */}
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                countdown.status === 'overdue'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : countdown.status === 'urgent'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/80 text-teal-400 border border-slate-700'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{countdown.text}</span>
            </span>
          </div>

          <h3 className={`text-base font-bold text-white tracking-tight leading-snug ${isDone ? 'line-through text-slate-400' : ''}`}>
            {assignment.title}
          </h3>
        </div>

        {/* Quick Checkmark & Action Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleShare}
            title="Share / Copy Requirements"
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition text-xs font-mono flex items-center gap-1"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onEdit(assignment)}
            title="Edit Assignment"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(assignment.id)}
            title="Delete Assignment"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleStatus}
            title={isDone ? 'Mark in progress' : 'Mark completed'}
            className="p-1.5 text-slate-400 hover:text-emerald-400 transition"
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Middle Row: Duration & Predictive Comparison */}
      <div className="px-5 py-2.5 bg-slate-950/40 border-y border-slate-800/60 flex items-center justify-between text-xs font-mono flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            Est: <strong className="text-slate-200">{assignment.estimatedHours}h</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-teal-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Pred: <strong>{assignment.predictedHours}h</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actual > 0 ? (
            <span className="text-slate-300">
              Actual: <strong className="text-white">{actual}h</strong>
              {accuracyPercent !== null && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${
                  accuracyPercent >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {accuracyPercent}% eff.
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-500 italic">No time logged yet</span>
          )}
        </div>
      </div>

      {/* Live Stopwatch / Experiment Tracker Controls */}
      <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Stopwatch Digital Display */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-sm font-bold text-white">
            <span className={`w-2 h-2 rounded-full ${assignment.isTimerRunning ? 'bg-teal-400 animate-ping' : 'bg-slate-600'}`} />
            <span>{formatStopwatchTime(assignment.timerSecondsElapsed || 0)}</span>
          </div>

          {/* Stopwatch Action Buttons */}
          {assignment.isTimerRunning ? (
            <button
              onClick={() => onPauseTimer(assignment.id)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-medium flex items-center gap-1 transition"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => onStartTimer(assignment.id)}
              className="px-2.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-mono font-medium flex items-center gap-1 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{assignment.timerSecondsElapsed ? 'Resume' : 'Start Timer'}</span>
            </button>
          )}

          {assignment.timerSecondsElapsed ? (
            <button
              onClick={() => onStopTimer(assignment.id)}
              title="Stop & Log Time"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {/* Academic Marks & Score Input */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {isEditingMarks ? (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-teal-500/50">
              <input
                type="number"
                placeholder="Marks"
                value={marksInput}
                onChange={(e) => setMarksInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 bg-slate-950 text-white rounded text-center outline-none"
              />
              <span className="text-slate-500">/</span>
              <input
                type="number"
                placeholder="Max"
                value={maxMarksInput}
                onChange={(e) => setMaxMarksInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 bg-slate-950 text-white rounded text-center outline-none"
              />
              <button
                onClick={handleSaveMarks}
                className="px-2 py-0.5 rounded bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
              >
                ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingMarks(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            >
              <Award className="w-3.5 h-3.5 text-teal-400" />
              {typeof assignment.marksReceived === 'number' && typeof assignment.maxMarks === 'number' ? (
                <span className="font-bold text-teal-300">
                  {assignment.marksReceived} / {assignment.maxMarks} ({Math.round((assignment.marksReceived / assignment.maxMarks) * 100)}%)
                </span>
              ) : (
                <span className="text-slate-400">+ Record Grade</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Requirements / Rubrics Hub Details */}
      {assignment.requirements && (
        <div className="px-5 pb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 hover:text-slate-200 transition py-1"
          >
            <span>Requirements & Rubric Specifications</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-150">
              {assignment.requirements}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
