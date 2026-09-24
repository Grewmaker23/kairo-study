import React, { useState } from 'react';
import { Assignment } from '../../types/assignment';
import { WarmTaskCard } from './WarmTaskCard';
import { 
  Search, 
  Filter, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Sparkles 
} from 'lucide-react';

interface WarmTasksColumnProps {
  assignments: Assignment[];
  onUpdateAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
}

export const WarmTasksColumn: React.FC<WarmTasksColumnProps> = ({
  assignments,
  onUpdateAssignment,
  onDeleteAssignment,
  onStartTimer,
  onPauseTimer,
  onResetTimer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'upcoming' | 'completed'>('all');

  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseName))).filter(Boolean);

  const filtered = assignments.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.requirements && a.requirements.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = selectedCourse === 'ALL' || a.courseName === selectedCourse;
    const matchesTab = activeTab === 'all' || a.status === activeTab;

    return matchesSearch && matchesCourse && matchesTab;
  });

  const inProgressCount = assignments.filter(a => a.status === 'in_progress').length;
  const upcomingCount = assignments.filter(a => a.status === 'upcoming').length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="warm-card p-4 rounded-3xl bg-white border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, formulas, or rubrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200/90 rounded-xl text-xs text-stone-900 placeholder-stone-400 font-mono outline-none focus:bg-white focus:border-orange-500 transition"
          />
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200/90 rounded-xl text-xs font-mono text-stone-800 outline-none focus:bg-white focus:border-orange-500"
          >
            <option value="ALL">All Subjects</option>
            {uniqueCourses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Filter Bar (All / In Progress / Upcoming / Graded) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-amber-100/60 border border-amber-200/80 text-xs font-mono">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-bold ${
            activeTab === 'all'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>All Tasks</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900">
            {assignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-bold ${
            activeTab === 'in_progress'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>Active</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-900">
            {inProgressCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-bold ${
            activeTab === 'upcoming'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Upcoming</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800">
            {upcomingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-bold ${
            activeTab === 'completed'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Graded</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900">
            {completedCount}
          </span>
        </button>
      </div>

      {/* Vertical Tasks Stream */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="warm-card p-10 rounded-3xl bg-white border border-dashed border-amber-300 text-center space-y-2">
            <Flame className="w-8 h-8 text-orange-400 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-stone-800">No Assignments Found</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchQuery || selectedCourse !== 'ALL'
                ? 'Try clearing your search query or subject filter.'
                : 'Create an assignment using the left-hand form to start tracking your work time!'}
            </p>
          </div>
        ) : (
          filtered.map(asg => (
            <WarmTaskCard
              key={asg.id}
              assignment={asg}
              onUpdate={onUpdateAssignment}
              onDelete={onDeleteAssignment}
              onStartTimer={onStartTimer}
              onPauseTimer={onPauseTimer}
              onResetTimer={onResetTimer}
            />
          ))
        )}
      </div>
    </div>
  );
};
