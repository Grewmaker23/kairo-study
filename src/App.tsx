import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Assignment } from './types/assignment';
import { AssignmentStore } from './storage/assignmentStore';
import { calculateGlobalAnalytics } from './utils/analytics';
import { WarmNavbar } from './components/studio/WarmNavbar';
import { AssignmentInputHub } from './components/studio/AssignmentInputHub';
import { WarmTasksColumn } from './components/studio/WarmTasksColumn';
import { Sparkles, Flame, Clock, Award, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(() => AssignmentStore.getAssignments());

  // Global stopwatch interval for any assignment with an active stopwatch
  useEffect(() => {
    const hasRunningTimers = assignments.some(a => a.isTimerRunning);
    if (!hasRunningTimers) return;

    const interval = setInterval(() => {
      setAssignments(prev => {
        const updated = prev.map(asg => {
          if (asg.isTimerRunning) {
            const nextSeconds = (asg.timerSecondsElapsed || 0) + 1;
            const nextActualHours = Number((nextSeconds / 3600).toFixed(2));
            return {
              ...asg,
              timerSecondsElapsed: nextSeconds,
              actualHours: nextActualHours
            };
          }
          return asg;
        });
        AssignmentStore.saveAssignments(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [assignments]);

  // Compute live global analytics
  const analytics = useMemo(() => {
    return calculateGlobalAnalytics(assignments);
  }, [assignments]);

  // Add Assignment
  const handleAddAssignment = useCallback((newAsg: Assignment) => {
    setAssignments(prev => {
      const updated = [newAsg, ...prev];
      AssignmentStore.saveAssignments(updated);
      return updated;
    });
  }, []);

  // Update Assignment
  const handleUpdateAssignment = useCallback((updatedAsg: Assignment) => {
    setAssignments(prev => {
      const updated = prev.map(a => (a.id === updatedAsg.id ? updatedAsg : a));
      AssignmentStore.saveAssignments(updated);
      return updated;
    });
  }, []);

  // Delete Assignment
  const handleDeleteAssignment = useCallback((id: string) => {
    setAssignments(prev => {
      const updated = prev.filter(a => a.id !== id);
      AssignmentStore.saveAssignments(updated);
      return updated;
    });
  }, []);

  // Stopwatch actions
  const handleStartTimer = useCallback((id: string) => {
    setAssignments(prev => {
      const updated = prev.map(a => {
        if (a.id === id) {
          return {
            ...a,
            status: 'in_progress' as const,
            isTimerRunning: true,
            timerStartedAt: a.timerStartedAt || Date.now()
          };
        }
        return a;
      });
      AssignmentStore.saveAssignments(updated);
      return updated;
    });
  }, []);

  const handlePauseTimer = useCallback((id: string) => {
    setAssignments(prev => {
      const updated = prev.map(a => (a.id === id ? { ...a, isTimerRunning: false } : a));
      AssignmentStore.saveAssignments(updated);
      return updated;
    });
  }, []);

  const handleResetTimer = useCallback((id: string) => {
    setAssignments(prev => {
      const updated = prev.map(a => {
        if (a.id === id) {
          return {
            ...a,
            isTimerRunning: false,
            timerSecondsElapsed: 0,
            actualHours: 0
          };
        }
        return a;
      });
      AssignmentStore.saveAssignments(updated);
      return updated;
    });
  }, []);

  // Reset Demo Dataset
  const handleResetData = () => {
    const defaultData = AssignmentStore.resetToDefault();
    setAssignments([...defaultData]);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Warm Aesthetic Flocus Header */}
      <WarmNavbar
        analytics={analytics}
        assignments={assignments}
        onResetData={handleResetData}
      />

      {/* Main Studio Body: 2-Column Split Interface */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-7 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 Cols): Assignment Input Form & Requirements Hub */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <AssignmentInputHub
              onAddAssignment={handleAddAssignment}
              historicalAssignments={assignments}
            />
          </div>

          {/* Right Column (7 Cols): Active Tasks & Vertical Workflow Stream */}
          <div className="lg:col-span-7 space-y-4">
            <WarmTasksColumn
              assignments={assignments}
              onUpdateAssignment={handleUpdateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
              onResetTimer={handleResetTimer}
            />
          </div>
        </div>
      </main>

      {/* Warm Footer */}
      <footer className="py-6 border-t border-amber-200/60 text-center text-xs font-mono text-stone-500 bg-amber-50/30">
        Flocus & Amie Studio • Warm Assignment & Predictive Work-Time Tracker with Real-Time Stopwatch Calibration
      </footer>
    </div>
  );
};

export default App;
