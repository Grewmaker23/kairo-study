import React, { useState } from 'react';
import { Task, ScheduleBlock, LearnedProfile } from '../../types/task';
import { formatMinutesTo12Hour } from '../../engine/scheduler';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  Play, 
  Square, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Zap,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimelineViewProps {
  scheduleBlocks: ScheduleBlock[];
  unallocatedTasks: Task[];
  learnedProfile: LearnedProfile;
  activeTaskId: string | null;
  activeTimerSeconds: number;
  onSelectTask: (task: Task) => void;
  onCompleteTask: (task: Task, actualMinutes?: number) => void;
  onStartTimer: (task: Task) => void;
  onStopTimer: () => void;
  onToggleSubtask: (task: Task, subtaskId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  scheduleBlocks,
  unallocatedTasks,
  learnedProfile,
  activeTaskId,
  activeTimerSeconds,
  onSelectTask,
  onCompleteTask,
  onStartTimer,
  onStopTimer,
  onToggleSubtask
}) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  const toggleSubtasks = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubtasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleQuickComplete = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Trigger celebratory micro-interaction
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#38BDF8', '#F59E0B', '#10B981', '#EAB308']
    });

    // If active timer is on this task, use the timer elapsed minutes
    let actualMinutes: number | undefined;
    if (activeTaskId === task.id && activeTimerSeconds > 0) {
      actualMinutes = Math.max(1, Math.round(activeTimerSeconds / 60));
      onStopTimer();
    } else {
      actualMinutes = task.predictedDuration || task.estimatedDuration;
    }

    onCompleteTask(task, actualMinutes);
  };

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'CS / Coding':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Mathematics':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Reading & Essays':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Exams & Quizzes':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Admin & Quick Tasks':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            <span>Today's Effort Trajectory</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {learnedProfile.isColdStart ? 'Circadian Baseline' : 'Bayesian Optimized'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Blocks dynamically sized and scheduled to match your peak cognitive energy windows.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500/80" />
            <span>Deep Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-purple-500/80" />
            <span>Quick Sprint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/80" />
            <span>AI Adjusted</span>
          </div>
        </div>
      </div>

      {/* Effort Blocks Timeline */}
      <div className="space-y-3.5 relative">
        {scheduleBlocks.map((block) => {
          const task = block.task;
          const isDeep = task.sizeBucket === 'large' || task.predictedDuration >= 60;
          const isSmall = task.sizeBucket === 'small' || task.predictedDuration <= 30;
          const isTimerActive = activeTaskId === task.id;
          const isCompleted = task.status === 'completed';
          const subtasksTotal = task.subtasks.length;
          const subtasksDone = task.subtasks.filter(s => s.completed).length;

          return (
            <div
              key={block.id}
              onClick={() => onSelectTask(task)}
              className={`group relative rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden border ${
                isTimerActive
                  ? 'studio-panel-glow border-sky-400 ring-2 ring-sky-500/30'
                  : isCompleted
                  ? 'bg-slate-900/40 border-emerald-900/40 opacity-75'
                  : isDeep
                  ? 'studio-panel border-slate-700/80 hover:border-slate-500 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              } ${isDeep ? 'p-5' : 'p-4'}`}
            >
              {/* Category Color Accent Border Indicator */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  task.category === 'CS / Coding'
                    ? 'bg-blue-500'
                    : task.category === 'Mathematics'
                    ? 'bg-amber-500'
                    : task.category === 'Reading & Essays'
                    ? 'bg-emerald-500'
                    : task.category === 'Exams & Quizzes'
                    ? 'bg-rose-500'
                    : 'bg-purple-500'
                }`}
              />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pl-2">
                {/* Left: Time & Core Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Quick-Complete Check Button */}
                  <button
                    onClick={(e) => handleQuickComplete(task, e)}
                    title={isCompleted ? 'Completed' : 'Click to complete task'}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Scheduled Time Pill */}
                      <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                        {formatMinutesTo12Hour(block.startMinutes)} – {formatMinutesTo12Hour(block.endMinutes)}
                      </span>

                      {/* Category Tag */}
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border font-medium ${getCategoryBadgeClass(task.category)}`}>
                        {task.category}
                      </span>

                      {/* Size Indicator Badge */}
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {isDeep ? '🧠 Deep Work' : isSmall ? '⚡ Quick Sprint' : 'Standard'}
                      </span>

                      {/* Priority Badge */}
                      {task.priority === 'urgent' && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Urgent
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-semibold leading-snug truncate ${
                      isCompleted ? 'line-through text-slate-400' : 'text-white group-hover:text-sky-300 transition-colors'
                    }`}>
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {task.notes}
                      </p>
                    )}

                    {/* AI Reasoning Pill */}
                    {block.reasoning && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2.5 py-1">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate italic">{block.reasoning}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Duration metrics, Live Timer, Subtask trigger */}
                <div className="flex items-center gap-3.5 shrink-0 pl-8 md:pl-0">
                  {/* Estimated vs Predicted duration display */}
                  <div className="text-right font-mono text-xs">
                    <div className="text-slate-400">
                      Est: <span className="text-slate-200">{task.estimatedDuration}m</span>
                    </div>
                    <div className="font-semibold text-amber-400 flex items-center justify-end gap-1">
                      <span>Pred:</span>
                      <span>{task.predictedDuration}m</span>
                    </div>
                  </div>

                  {/* Active Timer Control */}
                  {!isCompleted && (
                    <div>
                      {isTimerActive ? (
                        <div className="flex items-center gap-2 bg-sky-950/90 border border-sky-400 px-3 py-1.5 rounded-xl shadow-lg animate-pulse">
                          <span className="text-sm font-mono font-bold text-sky-300">
                            {formatTimerTime(activeTimerSeconds)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStopTimer();
                            }}
                            title="Stop Focus Timer"
                            className="p-1 rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 transition"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartTimer(task);
                          }}
                          title="Start Active Focus Timer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-600/30 text-slate-200 hover:text-sky-300 border border-slate-700 hover:border-sky-500/40 transition text-xs font-mono font-medium"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Focus</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Subtask toggle if task has subtasks */}
                  {subtasksTotal > 0 && (
                    <button
                      onClick={(e) => toggleSubtasks(task.id, e)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 text-xs font-mono text-slate-300 hover:text-white"
                    >
                      <span>{subtasksDone}/{subtasksTotal}</span>
                      {expandedSubtasks[task.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Subtasks Accordion */}
              {subtasksTotal > 0 && expandedSubtasks[task.id] && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="mt-3.5 pt-3 border-t border-slate-800/80 pl-8 space-y-1.5"
                >
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Checklist & Steps
                  </p>
                  {task.subtasks.map((st) => (
                    <div 
                      key={st.id} 
                      onClick={() => onToggleSubtask(task, st.id)}
                      className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                    >
                      {st.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span className={`text-xs ${st.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overflow / Unallocated Tasks Section */}
      {unallocatedTasks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-heading font-semibold text-slate-200">
              Overflow Backlog (Cannot fit into today's working hours without burnout)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unallocatedTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="studio-panel p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">{task.title}</h4>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {task.category} • {task.predictedDuration}m
                  </div>
                </div>
                <button
                  onClick={(e) => handleQuickComplete(task, e)}
                  className="text-slate-500 hover:text-emerald-400"
                >
                  <Circle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
