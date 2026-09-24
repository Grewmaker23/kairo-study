import React from 'react';
import { GlobalAnalytics } from '../../types/assignment';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  Activity, 
  Target, 
  Plus, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface TopSummaryBarProps {
  analytics: GlobalAnalytics;
  onOpenNewModal: () => void;
  onResetData: () => void;
}

export const TopSummaryBar: React.FC<TopSummaryBarProps> = ({
  analytics,
  onOpenNewModal,
  onResetData
}) => {
  return (
    <div className="space-y-4">
      {/* Top Header / Brand Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Kairos • Assignment Efficiency Engine
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-teal-500/10 text-teal-300 border border-teal-500/30">
                Predictive v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Work-Time Forecasting, Live Experiment Stopwatch & Academic Marks Analytics
            </p>
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onResetData}
            title="Reset to default student assignment demo"
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition text-xs font-medium flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-slate-950 font-bold transition text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* 4 Responsive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Accuracy & Efficiency */}
        <div className="dashboard-card card-glow-indigo p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
              Time Accuracy
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {analytics.averageAccuracyPercent}%
            </span>
            <span className="text-xs text-indigo-400 font-mono font-medium">
              {analytics.overallEfficiencyRatio}x ratio
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Est: {analytics.totalEstimatedHours}h</span>
            <span className="text-slate-300 font-medium">Actual: {analytics.totalActualHours}h</span>
          </div>
        </div>

        {/* Metric 2: Academic Marks & Score Ratio */}
        <div className="dashboard-card card-glow-teal p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
              Marks & Score Ratio
            </span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-300 tracking-tight">
              {analytics.totalMaxMarks > 0 ? `${analytics.marksPercentage}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Grade A (3.9 GPA)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Score: {analytics.totalMarksEarned} / {analytics.totalMaxMarks}</span>
            <span className="text-teal-400 font-semibold">{analytics.completedCount} Graded</span>
          </div>
        </div>

        {/* Metric 3: Active Workflows */}
        <div className="dashboard-card p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
              Workflows Active
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {analytics.activeCount}
            </span>
            <span className="text-xs text-amber-400 font-mono">
              In Queue / Progress
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Total Tasks: {analytics.totalAssignments}</span>
            <span className="text-emerald-400 font-medium">{analytics.completedCount} Completed</span>
          </div>
        </div>

        {/* Metric 4: Total Tracked Lab / Focus Hours */}
        <div className="dashboard-card p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
              Total Logged Effort
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {analytics.totalActualHours}h
            </span>
            <span className="text-xs text-sky-400 font-mono">
              Total Time Spent
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span className="flex items-center gap-1 text-teal-400">
              <Sparkles className="w-3 h-3" /> Live Stopwatches
            </span>
            <span className="text-slate-300">Continuous Logging</span>
          </div>
        </div>
      </div>
    </div>
  );
};
