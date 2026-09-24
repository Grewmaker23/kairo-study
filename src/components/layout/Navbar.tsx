import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Brain, 
  Eye, 
  Sliders, 
  Play, 
  RefreshCw,
  Compass,
  CheckCircle,
  Clock
} from 'lucide-react';
import { LearnedProfile } from '../../types/task';

interface NavbarProps {
  viewMode: '3d' | '2d_calm';
  onToggleViewMode: (mode: '3d' | '2d_calm') => void;
  onOpenNewTask: () => void;
  onOpenBrainProfile: () => void;
  onOpenDemoSwitcher: () => void;
  onTriggerHero: () => void;
  learnedProfile: LearnedProfile;
  scheduledMinutes: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onToggleViewMode,
  onOpenNewTask,
  onOpenBrainProfile,
  onOpenDemoSwitcher,
  onTriggerHero,
  learnedProfile,
  scheduledMinutes
}) => {
  const hours = Math.floor(scheduledMinutes / 60);
  const mins = scheduledMinutes % 60;

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e12]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
            <span className="font-heading font-black text-white text-base">K</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#0c0e12] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-heading font-bold text-white tracking-tight">
                Kairos Study
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                v1.0 Adaptive
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Cognitive Chrono-Scheduling for High-Effort Students
            </p>
          </div>
        </div>

        {/* Center: Realtime Effort Summary */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-xl text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Planned Effort: <strong className="text-white">{hours}h {mins}m</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{learnedProfile.isColdStart ? 'Circadian Baseline' : `${learnedProfile.totalCompletedTasks} Tasks Learned`}</span>
          </div>
        </div>

        {/* Right: Actions & View Toggles */}
        <div className="flex items-center gap-2.5">
          {/* 3D vs 2D Calm Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => onToggleViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === '3d'
                  ? 'bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Studio</span>
            </button>

            <button
              onClick={() => onToggleViewMode('2d_calm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === '2d_calm'
                  ? 'bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calm 2D</span>
            </button>
          </div>

          {/* Re-Synthesize (Hero Moment Replay) */}
          {viewMode === '3d' && (
            <button
              onClick={onTriggerHero}
              title="Re-synthesize Day Timeline in 3D"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Brain / Learning Insights Button */}
          <button
            onClick={onOpenBrainProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition text-xs font-mono"
          >
            <Brain className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Brain Profile</span>
          </button>

          {/* Dataset demo switch */}
          <button
            onClick={onOpenDemoSwitcher}
            title="Switch Demo Data"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition text-xs font-mono"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Add Task Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold transition shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
