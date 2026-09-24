import React from 'react';
import { LearnedProfile } from '../../types/task';
import { X, Sparkles, Brain, Clock, Zap, TrendingUp, Info } from 'lucide-react';

interface LearningProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: LearnedProfile;
}

export const LearningProfileModal: React.FC<LearningProfileModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="studio-panel w-full max-w-3xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <span>Cognitive Effort Profile & Adaptive Engine</span>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                  profile.isColdStart
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {profile.isColdStart ? 'Cold Start (Student Baseline)' : 'Trained Behavioral Model'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transparent view of how Kairos calculates your estimation bias and circadian focus windows.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Logged Tasks</span>
              <p className="text-xl font-heading font-bold text-white mt-1">
                {profile.totalCompletedTasks}
              </p>
              <span className="text-[10px] text-slate-500 font-mono">Real completion events</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Schedule Accuracy</span>
              <p className="text-xl font-heading font-bold text-emerald-400 mt-1">
                {profile.overallAccuracyRate}%
              </p>
              <span className="text-[10px] text-slate-500 font-mono">Within ±15m window</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Avg Duration Bias</span>
              <p className={`text-xl font-heading font-bold mt-1 ${
                profile.avgDurationRatio > 1.15 ? 'text-amber-400' : 'text-sky-400'
              }`}>
                {profile.avgDurationRatio}x
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                {profile.avgDurationRatio > 1.0 ? 'Underestimation bias' : 'On-target pacing'}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Peak Focus Slot</span>
              <p className="text-xl font-heading font-bold text-sky-400 mt-1">
                9 AM – 12 PM
              </p>
              <span className="text-[10px] text-slate-500 font-mono">Circadian prime zone</span>
            </div>
          </div>

          {/* AI Insights & Observations */}
          <div className="bg-sky-950/20 border border-sky-500/20 rounded-xl p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Learned Observations & Student Insights</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {profile.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 1: Circadian Productivity-by-Time-of-Day Curve */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Circadian Hourly Energy & Productivity Curve</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Calculated from completion timestamps and focus density.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400" /> Peak</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-sky-400" /> Optimal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-600" /> Slump/Rest</span>
              </div>
            </div>

            {/* Hourly Bars (8 AM to 10 PM) */}
            <div className="h-32 flex items-end gap-1.5 pt-4 px-1 border-b border-slate-800">
              {profile.hourlyCurve.filter(h => h.hour >= 8 && h.hour <= 22).map((h) => {
                const heightPercent = Math.max(12, Math.round(h.productivityScore * 100));
                const barColor =
                  h.energyTier === 'peak'
                    ? 'bg-amber-400'
                    : h.energyTier === 'optimal'
                    ? 'bg-sky-400'
                    : h.energyTier === 'moderate'
                    ? 'bg-slate-500'
                    : 'bg-slate-700/60';

                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-800 px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap z-20 shadow-lg border border-slate-700">
                      {h.displayHour}: {Math.round(h.productivityScore * 100)}% ({h.recommendedTaskType})
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${barColor}`}
                    />
                    <span className="text-[9px] font-mono text-slate-500 mt-1 truncate">
                      {h.hour % 12 === 0 ? 12 : h.hour % 12}{h.hour >= 12 ? 'p' : 'a'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Per-Category Duration Biases */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Subject Duration Bias (Actual vs Estimated Ratio)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              How the AI automatically scales your estimated time to prevent cramming and late-night panic.
            </p>

            {Object.keys(profile.categoryBiases).length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                No category logs yet. Complete tasks to establish historical bias factors.
              </div>
            ) : (
              <div className="space-y-2.5">
                {Object.values(profile.categoryBiases).map((bias) => {
                  const percentDelta = Math.round((bias.averageRatio - 1) * 100);
                  const isUnder = bias.trend === 'underestimates';
                  const isOver = bias.trend === 'overestimates';

                  return (
                    <div key={bias.category} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-200 block truncate">
                          {bias.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Based on {bias.sampleCount} recorded completions
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-right">
                        <div>
                          <span className={`font-bold ${
                            isUnder ? 'text-amber-400' : isOver ? 'text-emerald-400' : 'text-slate-300'
                          }`}>
                            {isUnder ? `+${percentDelta}% longer` : isOver ? `${percentDelta}% faster` : 'Accurate (1.0x)'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Scale multiplier: {bias.averageRatio}x
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Engine Model Version: {new Date(profile.lastRecalculated).toLocaleTimeString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition font-medium"
          >
            Close Insight Panel
          </button>
        </div>
      </div>
    </div>
  );
};
