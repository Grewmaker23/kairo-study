import React from 'react';
import { Assignment } from '../../types/assignment';
import { calculateHistoricalEfficiencyRatio, COMPLEXITY_MULTIPLIERS } from '../../engine/predictiveEngine';
import { X, Sparkles, Brain, TrendingUp, Sliders, CheckCircle } from 'lucide-react';

interface PredictiveModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: Assignment[];
}

export const PredictiveModelModal: React.FC<PredictiveModelModalProps> = ({
  isOpen,
  onClose,
  assignments
}) => {
  if (!isOpen) return null;

  const globalRatioData = calculateHistoricalEfficiencyRatio(assignments);
  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseName))).filter(Boolean);

  const courseBreakdowns = uniqueCourses.map(course => {
    const data = calculateHistoricalEfficiencyRatio(assignments, course);
    return {
      course,
      ratio: data.ratio,
      samples: data.sampleCount
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="dashboard-card w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Predictive Work-Time Engine Architecture</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  Bayesian Calibration
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical formula adjusting your estimated hours into realistic deadlines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
          {/* Formula Explanation Banner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-semibold block mb-1">
              Core Algorithmic Formulation
            </span>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-teal-300 overflow-x-auto">
              Predicted Hours = Estimated Hours × Efficiency Index (Actual/Est) × Complexity Multiplier
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Whenever you enter an assignment, the engine checks whether you have historical completions in that subject. If so, it weights the subject ratio with your overall academic pace.
            </p>
          </div>

          {/* Course By Course Ratios */}
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Course-Specific Efficiency Ratios</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {courseBreakdowns.map((cb) => (
                <div key={cb.course} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white text-xs block truncate max-w-[180px]">
                      {cb.course}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {cb.samples} completed records
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`text-sm font-bold ${cb.ratio > 1.15 ? 'text-amber-400' : 'text-teal-400'}`}>
                      {cb.ratio}x
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {cb.ratio > 1.0 ? `+${Math.round((cb.ratio - 1) * 100)}% buffer` : 'On target'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complexity Multipliers Table */}
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Complexity Level Weight Matrix</span>
            </h3>
            <div className="divide-y divide-slate-800 bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden text-xs font-mono">
              {Object.entries(COMPLEXITY_MULTIPLIERS).map(([level, info]) => (
                <div key={level} className="p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-300">★ Level {level}</span>
                    <span className="text-slate-300 font-normal">{info.label}</span>
                  </div>
                  <span className="font-bold text-teal-400">{info.factor}x scaling</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Global Pace Index: {globalRatioData.ratio}x</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
