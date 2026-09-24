import React, { useState, useMemo } from 'react';
import { Assignment, ComplexityLevel } from '../../types/assignment';
import { predictWorkTime, COMPLEXITY_MULTIPLIERS } from '../../engine/predictiveEngine';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  BookOpen, 
  Sliders, 
  Plus, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface AssignmentInputHubProps {
  onAddAssignment: (assignment: Assignment) => void;
  historicalAssignments: Assignment[];
}

const COMMON_COURSES = [
  'CS301 - Operating Systems',
  'MATH240 - Linear Algebra',
  'PHYS201 - Electromagnetism',
  'BIO105 - Molecular Genetics',
  'CHEM102 - General Chem'
];

export const AssignmentInputHub: React.FC<AssignmentInputHubProps> = ({
  onAddAssignment,
  historicalAssignments
}) => {
  const [courseName, setCourseName] = useState('');
  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  // Default to 48 hours from now
  const defaultDate = new Date(Date.now() + 1000 * 60 * 60 * 48);
  const defaultIso = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [deadline, setDeadline] = useState(defaultIso);
  const [estimatedHours, setEstimatedHours] = useState<number>(3.5);
  const [complexity, setComplexity] = useState<ComplexityLevel>(3);

  // Live Predictive Calculation Engine
  const prediction = useMemo(() => {
    return predictWorkTime(estimatedHours, complexity, courseName, historicalAssignments);
  }, [estimatedHours, complexity, courseName, historicalAssignments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseName.trim()) return;

    const newAssignment: Assignment = {
      id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      courseName: courseName.trim(),
      title: title.trim(),
      requirements: requirements.trim(),
      deadline: new Date(deadline).toISOString(),
      estimatedHours: Number(estimatedHours) || 1,
      complexity,
      status: 'in_progress', // Ready to start right away
      predictedHours: prediction.predictedHours,
      predictionExplanation: prediction.explanation,
      actualHours: 0,
      timerSecondsElapsed: 0,
      isTimerRunning: false,
      createdAt: Date.now()
    };

    onAddAssignment(newAssignment);

    // Reset fields
    setTitle('');
    setRequirements('');
  };

  return (
    <div className="warm-card p-6 sm:p-7 rounded-3xl border border-amber-200/80 bg-white relative overflow-hidden shadow-sm">
      {/* Decorative Warm Ambient Gradient Pill */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-amber-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100/90 text-orange-600 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Create Assignment & Rubrics
            </h2>
            <p className="text-xs text-stone-600">
              Left column input with real-time predictive work-time calculation
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Dynamic Predictive Work Estimator Banner (Item 3) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-rose-50/90 border border-orange-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-800">
                Predictive Work Estimator
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-orange-100/90 text-orange-800 font-bold border border-orange-200">
              {prediction.differenceHours >= 0 ? `+${prediction.differenceHours}h Buffer` : `${prediction.differenceHours}h Faster`}
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-stone-900 tracking-tight">
              ~{prediction.predictedHours} hrs
            </span>
            <span className="text-xs font-mono text-stone-700">
              (Estimated: <strong className="text-stone-900 font-bold">{estimatedHours}h</strong>)
            </span>
          </div>

          <p className="text-xs text-stone-700 mt-1.5 leading-relaxed font-medium">
            ✨ {prediction.explanation}
          </p>

          {/* Mini Visual Duration Comparison Bar */}
          <div className="mt-3 w-full bg-amber-100 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (estimatedHours / Math.max(0.1, prediction.predictedHours)) * 100)}%`
              }}
              title="Your initial estimate"
            />
            <div
              className="bg-gradient-to-r from-orange-500 to-rose-500 h-full rounded-r-full transition-all duration-300"
              style={{
                width: `${Math.max(0, 100 - (estimatedHours / Math.max(0.1, prediction.predictedHours)) * 100)}%`
              }}
              title="Predictive adjustment buffer"
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-mono text-stone-700">
            <span>Student Est ({estimatedHours}h)</span>
            <span>AI Scaled (~{prediction.predictedHours}h)</span>
          </div>
        </div>

        {/* Course / Subject Name */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1.5">
            Subject / Course Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. CS301 - Operating Systems"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200/90 text-stone-900 placeholder-stone-500 text-xs font-medium focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
          />

          {/* Quick subject pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_COURSES.map(course => (
              <button
                type="button"
                key={course}
                onClick={() => setCourseName(course)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition ${
                  courseName === course
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {course.split(' - ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Assignment Title */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1.5">
            Assignment / Lab Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Virtual Memory Paging Simulator"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200/90 text-stone-900 placeholder-stone-500 text-xs font-medium focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
          />
        </div>

        {/* Target Deadline (Date & Time Picker) */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center justify-between">
            <span>Target Deadline *</span>
            <span className="text-[10px] text-stone-600 font-normal">Date & Time</span>
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200/90 text-stone-900 text-xs font-mono focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
            />
          </div>
        </div>

        {/* Estimated Time to Complete (Hours) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
              Estimated Time: <strong className="text-orange-700 font-bold">{estimatedHours} hrs</strong>
            </label>
            <span className="text-[11px] font-mono text-stone-600">
              Slider or Numeric
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0.5"
              max="30"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
              className="w-20 px-2.5 py-2 rounded-xl bg-stone-50 border border-stone-200/90 text-stone-900 text-xs font-mono font-bold text-center focus:bg-white focus:border-orange-500 outline-none"
            />
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
              className="flex-1 accent-orange-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 1–5 Complexity Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
              Task Complexity Level (1–5)
            </label>
            <span className="text-xs font-mono font-bold text-orange-700">
              ★ {complexity}: {COMPLEXITY_MULTIPLIERS[complexity].label.split(': ')[1]}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {([1, 2, 3, 4, 5] as ComplexityLevel[]).map(lvl => (
              <button
                type="button"
                key={lvl}
                onClick={() => setComplexity(lvl)}
                className={`py-2 px-1 rounded-xl text-xs font-mono transition flex flex-col items-center gap-0.5 border ${
                  complexity === lvl
                    ? 'bg-orange-500 text-white border-orange-600 shadow-sm font-bold scale-[1.02]'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span>★ {lvl}</span>
                <span className="text-[9px] opacity-80">
                  {lvl === 1 ? 'Review' : lvl === 3 ? 'Standard' : lvl === 5 ? 'Thesis' : 'Lab'}
                </span>
              </button>
            ))}
          </div>

          {/* Range slider representation */}
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={complexity}
            onChange={(e) => setComplexity(parseInt(e.target.value) as ComplexityLevel)}
            className="w-full mt-2 accent-orange-500 cursor-pointer"
          />
        </div>

        {/* Detailed Requirements / Rubrics Textarea */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1.5">
            Detailed Requirements & Rubrics Textarea
          </label>
          <textarea
            rows={4}
            placeholder="Type or paste assignment instructions, test cases, grading rubrics, textbook problems..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200/90 text-stone-900 placeholder-stone-500 text-xs font-mono leading-relaxed focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add to Active Tasks & Start Tracker</span>
        </button>
      </form>
    </div>
  );
};
