import React, { useState } from 'react';
import { GlobalAnalytics, Assignment } from '../../types/assignment';
import { 
  Sparkles, 
  Share2, 
  RotateCcw, 
  Check, 
  Flame, 
  Clock, 
  Award,
  Zap
} from 'lucide-react';

interface WarmNavbarProps {
  analytics: GlobalAnalytics;
  assignments: Assignment[];
  onResetData: () => void;
}

export const WarmNavbar: React.FC<WarmNavbarProps> = ({
  analytics,
  assignments,
  onResetData
}) => {
  const [copied, setCopied] = useState(false);

  const handleShareWorkspace = async () => {
    const summary = `# 📋 Flocus & Amie Studio — Academic Workspace Specification
Generated on: ${new Date().toLocaleString()}

## 📊 Studio Global Analytics:
- Overall Efficiency Index: ${analytics.overallEfficiencyRatio}x (${analytics.averageAccuracyPercent}% time accuracy)
- Total Logged Study/Lab Effort: ${analytics.totalActualHours} hrs (Est: ${analytics.totalEstimatedHours} hrs)
- Academic Score: ${analytics.totalMarksEarned}/${analytics.totalMaxMarks} (${analytics.marksPercentage}%)
- Active Deliverables: ${analytics.activeCount} | Completed: ${analytics.completedCount}

---

## 🚀 Active & Upcoming Assignments:
${assignments.map(a => `
### [${a.status.toUpperCase()}] ${a.courseName} — ${a.title}
- **Deadline:** ${new Date(a.deadline).toLocaleString()}
- **Complexity:** Level ${a.complexity}/5
- **Time Commitment:** Estimated ${a.estimatedHours}h | AI Predicted ~${a.predictedHours}h | Actual Logged ${a.actualHours || 0}h
- **Grade:** ${typeof a.marksReceived === 'number' ? `${a.marksReceived}/${a.maxMarks}` : 'Pending'}
- **Rubrics & Requirements:**
${a.requirements || 'No specific rubrics provided.'}
`).join('\n---\n')}
`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error('Failed to copy workspace summary:', e);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF7]/90 backdrop-blur-md border-b border-amber-200/50 px-4 sm:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-md shadow-orange-500/20 flex items-center justify-center transform hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#FFFDF7] rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500/30" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-900 font-sans">
                  Flocus Studio
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300/60 shadow-sm">
                  Predictive v2.2
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                Warm Assignment Hub, Live Stopwatches & Bayesian Work Estimator
              </p>
            </div>
          </div>

          {/* Mobile Share Action */}
          <div className="md:hidden">
            <button
              onClick={handleShareWorkspace}
              className="p-2 rounded-xl bg-orange-100 text-orange-800 hover:bg-orange-200 transition"
              title="Share Workspace"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center: Live KPI Summary Badges */}
        <div className="hidden lg:flex items-center gap-2.5 bg-stone-100/90 border border-amber-200/80 px-4 py-1.5 rounded-2xl text-xs font-mono text-stone-800 shadow-sm">
          <div className="flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Pace Index: <strong className="text-stone-900 font-bold">{analytics.overallEfficiencyRatio}x</strong></span>
          </div>
          <span className="text-amber-300 font-bold">|</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>Logged: <strong className="text-stone-900 font-bold">{analytics.totalActualHours}h</strong></span>
          </div>
          <span className="text-amber-300 font-bold">|</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Award className="w-3.5 h-3.5 text-rose-500" />
            <span>Score: <strong className="text-stone-900 font-bold">{analytics.marksPercentage}%</strong></span>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onResetData}
            title="Reset sample college assignments"
            className="px-3 py-2 rounded-xl bg-white hover:bg-amber-50/80 text-stone-700 hover:text-stone-900 border border-amber-200/80 transition text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={handleShareWorkspace}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 text-white shadow-orange-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Workspace Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                <span>Share Workspace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
