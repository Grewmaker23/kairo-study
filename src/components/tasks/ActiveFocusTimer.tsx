import React from 'react';
import { Task } from '../../types/task';
import { Play, Pause, Square, CheckCircle2, Sparkles, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActiveFocusTimerProps {
  task: Task;
  secondsElapsed: number;
  isRunning: boolean;
  onPauseResume: () => void;
  onStop: () => void;
  onComplete: (task: Task, actualMinutes: number) => void;
}

export const ActiveFocusTimer: React.FC<ActiveFocusTimerProps> = ({
  task,
  secondsElapsed,
  isRunning,
  onPauseResume,
  onStop,
  onComplete
}) => {
  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const targetMinutes = task.predictedDuration || task.estimatedDuration || 30;
  const progressRatio = Math.min(1.0, secondsElapsed / (targetMinutes * 60));

  const handleFinish = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#38BDF8', '#10B981', '#EAB308', '#F43F5E']
    });

    const actualMins = Math.max(1, Math.round(secondsElapsed / 60));
    onComplete(task, actualMins);
    onStop();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-auto animate-in slide-in-from-bottom-6 duration-300">
      <div className="studio-panel-glow bg-[#121620]/95 rounded-2xl border border-sky-400/50 p-4 shadow-2xl flex flex-col gap-3">
        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400 transition-all duration-300"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider block">
                Live Focus Session ({task.category})
              </span>
              <h4 className="text-sm font-semibold text-white truncate max-w-xs">
                {task.title}
              </h4>
            </div>
          </div>

          {/* Large Monospace Timer Display */}
          <div className="font-mono text-xl font-bold text-white tracking-wider">
            {timeFormatted}
            <span className="text-xs text-slate-400 font-normal ml-1.5">
              / {targetMinutes}m
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPauseResume}
              title={isRunning ? 'Pause Timer' : 'Resume Timer'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={handleFinish}
              title="Finish Task & Log Time"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Done</span>
            </button>

            <button
              onClick={onStop}
              title="Cancel Timer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
