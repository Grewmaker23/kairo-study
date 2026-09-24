import React, { useState } from 'react';
import { Assignment } from '../../types/assignment';
import { AssignmentCard } from './AssignmentCard';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Search,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface WorkflowColumnsProps {
  assignments: Assignment[];
  onUpdateAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
  onStopTimer: (id: string) => void;
  onEditAssignment: (assignment: Assignment) => void;
}

export const WorkflowColumns: React.FC<WorkflowColumnsProps> = ({
  assignments,
  onUpdateAssignment,
  onDeleteAssignment,
  onStartTimer,
  onPauseTimer,
  onStopTimer,
  onEditAssignment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');

  // Extract unique courses for filter dropdown
  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseName))).filter(Boolean);

  // Filtered list
  const filtered = assignments.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.requirements && a.requirements.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = selectedCourseFilter === 'ALL' || a.courseName === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  // Group into vertical workflow columns
  const activeAssignments = filtered.filter(a => a.status === 'in_progress');
  const upcomingAssignments = filtered.filter(a => a.status === 'upcoming');
  const completedAssignments = filtered.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assignments, algorithms, problem sets or rubrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-teal-400 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono outline-none focus:border-teal-400"
          >
            <option value="ALL">All Subjects & Courses</option>
            {uniqueCourses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Vertical Workflow Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Active Workflows & Live Stopwatches */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                <span>Active Workflows</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-normal">
                  {activeAssignments.length}
                </span>
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Live Experiments</span>
          </div>

          <div className="space-y-3.5">
            {activeAssignments.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs font-mono text-slate-500 space-y-1">
                <Flame className="w-6 h-6 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>No active experiments in progress.</p>
                <p className="text-[11px] text-slate-600">Start a timer on an upcoming task to track work time.</p>
              </div>
            ) : (
              activeAssignments.map(asg => (
                <AssignmentCard
                  key={asg.id}
                  assignment={asg}
                  onUpdate={onUpdateAssignment}
                  onDelete={onDeleteAssignment}
                  onStartTimer={onStartTimer}
                  onPauseTimer={onPauseTimer}
                  onStopTimer={onStopTimer}
                  onEdit={onEditAssignment}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Upcoming Deadlines Queue */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                <span>Upcoming Deadlines</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-normal">
                  {upcomingAssignments.length}
                </span>
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Prioritized Queue</span>
          </div>

          <div className="space-y-3.5">
            {upcomingAssignments.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs font-mono text-slate-500 space-y-1">
                <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>Queue is empty.</p>
                <p className="text-[11px] text-slate-600">Click '+ New Assignment' to schedule deliverables.</p>
              </div>
            ) : (
              upcomingAssignments.map(asg => (
                <AssignmentCard
                  key={asg.id}
                  assignment={asg}
                  onUpdate={onUpdateAssignment}
                  onDelete={onDeleteAssignment}
                  onStartTimer={onStartTimer}
                  onPauseTimer={onPauseTimer}
                  onStopTimer={onStopTimer}
                  onEdit={onEditAssignment}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Completed & Evaluated History */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                <span>Graded History</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-normal">
                  {completedAssignments.length}
                </span>
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Efficiency Archive</span>
          </div>

          <div className="space-y-3.5">
            {completedAssignments.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs font-mono text-slate-500 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>No completed assignments yet.</p>
                <p className="text-[11px] text-slate-600">Ticking tasks done calibrates your predictive model.</p>
              </div>
            ) : (
              completedAssignments.map(asg => (
                <AssignmentCard
                  key={asg.id}
                  assignment={asg}
                  onUpdate={onUpdateAssignment}
                  onDelete={onDeleteAssignment}
                  onStartTimer={onStartTimer}
                  onPauseTimer={onPauseTimer}
                  onStopTimer={onStopTimer}
                  onEdit={onEditAssignment}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
