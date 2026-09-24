import React from 'react';
import { ScheduleBlock, Task } from '../../types/task';
import { formatMinutesTo12Hour } from '../../engine/scheduler';
import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react';

interface CalmTimeline2DProps {
  scheduleBlocks: ScheduleBlock[];
  onSelectTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
}

export const CalmTimeline2D: React.FC<CalmTimeline2DProps> = ({
  scheduleBlocks,
  onSelectTask,
  onCompleteTask
}) => {
  return (
    <div className="bg-[#10131a] rounded-2xl border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Calm 2D Flow Matrix</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Low-Motion / Zero Distractions
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Minimalist linear view with high contrast for rapid review and hallway check-offs.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500">
          {scheduleBlocks.length} planned items
        </div>
      </div>

      <div className="divide-y divide-slate-800/60">
        {scheduleBlocks.map((block) => {
          const task = block.task;
          const isDone = task.status === 'completed';

          return (
            <div
              key={block.id}
              onClick={() => onSelectTask(task)}
              className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-slate-800/30 rounded-lg cursor-pointer transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteTask(task);
                  }}
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-sky-400 font-medium">
                      {formatMinutesTo12Hour(block.startMinutes)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • {task.category}
                    </span>
                    {task.priority === 'urgent' && (
                      <span className="text-[10px] font-mono text-rose-400 font-bold">
                        [URGENT]
                      </span>
                    )}
                  </div>
                  <h4 className={`text-sm font-medium leading-snug truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{task.predictedDuration}m</span>
                </div>
                <div className="text-emerald-400 text-[11px]">
                  {Math.round(block.confidenceScore * 100)}% Match
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
