import React, { useState, useEffect, useMemo } from 'react';
import { Assignment, ComplexityLevel } from '../../types/assignment';
import { predictWorkTime, COMPLEXITY_MULTIPLIERS } from '../../engine/predictiveEngine';
import { copyAssignmentRequirements } from '../../utils/analytics';
import { 
  X, 
  Sparkles, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  Sliders 
} from 'lucide-react';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Assignment) => void;
  historicalAssignments: Assignment[];
  initialAssignment?: Assignment | null;
}

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  historicalAssignments,
  initialAssignment
}) => {
  const [courseName, setCourseName] = useState('');
  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(3.0);
  const [complexity, setComplexity] = useState<ComplexityLevel>(3);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (initialAssignment) {
      setCourseName(initialAssignment.courseName);
      setTitle(initialAssignment.title);
      setRequirements(initialAssignment.requirements || '');
      setDeadline(initialAssignment.deadline.slice(0, 16)); // format for datetime-local
      setEstimatedHours(initialAssignment.estimatedHours);
      setComplexity(initialAssignment.complexity);
    } else {
      setCourseName('');
      setTitle('');
      setRequirements('');
      // Default to 48 hours from now
      const defaultDate = new Date(Date.now() + 1000 * 60 * 60 * 48);
      const isoLocal = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDeadline(isoLocal);
      setEstimatedHours(3.0);
      setComplexity(3);
    }
  }, [initialAssignment, isOpen]);

  // Live Predictive Calculation Engine
  const prediction = useMemo(() => {
    return predictWorkTime(estimatedHours, complexity, courseName, historicalAssignments);
  }, [estimatedHours, complexity, courseName, historicalAssignments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseName.trim()) return;

    const assignmentToSave: Assignment = {
      id: initialAssignment ? initialAssignment.id : `asg-${Date.now()}`,
      courseName: courseName.trim(),
      title: title.trim(),
      requirements: requirements.trim(),
      deadline: new Date(deadline).toISOString(),
      estimatedHours: Number(estimatedHours) || 1,
      complexity,
      status: initialAssignment ? initialAssignment.status : 'upcoming',
      predictedHours: prediction.predictedHours,
      predictionExplanation: prediction.explanation,
      actualHours: initialAssignment ? initialAssignment.actualHours : 0,
      timerSecondsElapsed: initialAssignment ? initialAssignment.timerSecondsElapsed : 0,
      isTimerRunning: initialAssignment ? initialAssignment.isTimerRunning : false,
      marksReceived: initialAssignment?.marksReceived,
      maxMarks: initialAssignment?.maxMarks,
      gradedDate: initialAssignment?.gradedDate,
      createdAt: initialAssignment ? initialAssignment.createdAt : Date.now()
    };

    onSave(assignmentToSave);
    onClose();
  };

  const handleShareRequirements = async () => {
    const tempAsg: Assignment = {
      id: 'temp',
      courseName: courseName || 'General Course',
      title: title || 'Untitled Assignment',
      requirements,
      deadline,
      estimatedHours,
      complexity,
      status: 'upcoming',
      predictedHours: prediction.predictedHours,
      predictionExplanation: prediction.explanation,
      createdAt: Date.now()
    };

    const success = await copyAssignmentRequirements(tempAsg);
    if (success) {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="dashboard-card w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {initialAssignment ? 'Edit Assignment & Rubric' : 'Create Assignment & Hub Entry'}
              </h2>
              <p className="text-xs text-slate-400">
                Calibrated by your empirical work-rate and task complexity index
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Dynamic AI Predicted Duration Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 to-teal-950/70 border border-indigo-500/30 flex items-start gap-3 shadow-inner">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 mt-0.5 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                  AI Work-Time Forecast
                </span>
                <span className="text-xs font-mono text-teal-300">
                  {prediction.differenceHours >= 0 ? `+${prediction.differenceHours}h buffer added` : `${prediction.differenceHours}h speed adjustment`}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  ~{prediction.predictedHours} hrs
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (You estimated: <strong className="text-slate-200">{estimatedHours} hrs</strong>)
                </span>
              </div>
              <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">
                💡 {prediction.explanation}
              </p>
            </div>
          </div>

          {/* Row 1: Course/Subject Name & Assignment Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1.5">
                Course / Subject Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS301 - Operating Systems"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1.5">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Paging Replacement Simulation Lab"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none text-xs"
              />
            </div>
          </div>

          {/* Row 2: Target Deadline & Estimated Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-400 mb-1.5">
                Target Deadline (Date & Time) *
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-semibold uppercase text-slate-400">
                  Estimated Work Time
                </label>
                <span className="text-xs font-mono font-bold text-teal-400">
                  {estimatedHours} hours
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.5"
                  max="40"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                  className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-teal-400 font-mono"
                />
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                  className="flex-1 accent-teal-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Task Complexity Level (1 - 5) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold uppercase text-slate-400">
                Task Complexity Level (1 to 5)
              </label>
              <span className="text-xs font-mono text-indigo-300 font-medium">
                {COMPLEXITY_MULTIPLIERS[complexity].label}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as ComplexityLevel[]).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setComplexity(lvl)}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-semibold border transition flex flex-col items-center gap-1 ${
                    complexity === lvl
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-400 shadow-md ring-1 ring-indigo-400/40'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">★ {lvl}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lvl === 1 ? 'Quick' : lvl === 3 ? 'Standard' : lvl === 5 ? 'Exhaustive' : 'Lab'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Detailed Requirements / Rubrics Textarea & Share feature */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-semibold uppercase text-slate-400">
                Detailed Requirements, Prompts & Grading Rubrics
              </label>
              <button
                type="button"
                onClick={handleShareRequirements}
                className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 transition"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Requirements</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Paste submission criteria, required unit tests, rubric breakdown, or lab instructions here..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleShareRequirements}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs font-mono flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-teal-400" />
              <span>Copy Full Specification</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-slate-950 font-bold transition text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{initialAssignment ? 'Save Changes' : 'Add to Tracker'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
