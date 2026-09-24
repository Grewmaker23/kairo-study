import { Task, LearnedProfile, ScheduleBlock, DaySchedule } from '../types/task';
import { predictTaskDuration, formatHourDisplay } from './learningEngine';

export interface SchedulerOptions {
  date?: string; // YYYY-MM-DD
  workingHoursStart?: number; // minutes from midnight (e.g. 480 = 8:00 AM)
  workingHoursEnd?: number; // minutes from midnight (e.g. 1320 = 10:00 PM)
  bufferBetweenTasks?: number; // minutes of rest/transition between tasks (e.g. 10m)
}

/**
 * Helper to convert minutes from midnight to "HH:MM" 24h string
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(1439, totalMinutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Helper to convert "HH:MM" to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Format minutes into readable 12h time (e.g. 570 -> "9:30 AM")
 */
export function formatMinutesTo12Hour(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(1439, totalMinutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Pure scheduling function: (tasks, learnedProfile, options) => DaySchedule
 * Deterministic, easily unit tested, completely decoupled from UI.
 */
export function allocateDaySchedule(
  tasks: Task[],
  profile: LearnedProfile,
  options: SchedulerOptions = {}
): DaySchedule {
  const date = options.date || new Date().toISOString().split('T')[0];
  const startMinutes = options.workingHoursStart ?? 480; // 8:00 AM
  const endMinutes = options.workingHoursEnd ?? 1320; // 10:00 PM
  const buffer = options.bufferBetweenTasks ?? 10;

  // 1. Filter tasks that are actionable today
  const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress');

  // 2. Compute predicted durations and update tasks
  const tasksWithPredictions = pendingTasks.map(task => {
    const { predictedMinutes, explanation } = predictTaskDuration(
      task.estimatedDuration,
      task.category,
      profile
    );
    return {
      ...task,
      predictedDuration: predictedMinutes,
      aiReasoning: explanation
    };
  });

  // 3. Priority & Size Sorting:
  // - High priority & Urgent tasks come first
  // - Large deep tasks seek peak circadian slots
  // - Small tasks fit into gaps
  const priorityWeight: Record<string, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  // 4. Map the hours into ranked capacity slots
  const hourMap = new Map<number, { score: number; type: string }>();
  for (const h of profile.hourlyCurve) {
    hourMap.set(h.hour, { score: h.productivityScore, type: h.recommendedTaskType });
  }

  // Find peak hours (score >= 0.75) and moderate hours (0.4 <= score < 0.75)
  const peakHours = profile.hourlyCurve
    .filter(h => h.hour >= startMinutes / 60 && h.hour < endMinutes / 60 && h.energyTier === 'peak')
    .map(h => h.hour);

  // Group tasks into Large / Medium / Quick
  const deepTasks = tasksWithPredictions
    .filter(t => t.predictedDuration >= 60 || t.sizeBucket === 'large' || t.energyLevel === 'high_focus')
    .sort((a, b) => (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1));

  const quickTasks = tasksWithPredictions
    .filter(t => t.predictedDuration <= 30 || t.sizeBucket === 'small' || t.energyLevel === 'low_energy')
    .sort((a, b) => (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1));

  const mediumTasks = tasksWithPredictions
    .filter(t => !deepTasks.includes(t) && !quickTasks.includes(t))
    .sort((a, b) => (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1));

  // Time tracker for scheduling
  const blocks: ScheduleBlock[] = [];
  const unallocatedTasks: Task[] = [];
  let currentCursor = startMinutes;

  // Let's create smart timeline blocks based on circadian rhythm
  // Morning slots (9:00 - 12:30): Prime Deep Work
  // Post-lunch slots (13:00 - 14:30): Quick sprints & low energy
  // Afternoon slots (14:30 - 18:00): Medium & Deep work
  // Evening slots (19:00 - 21:30): Medium/Review/Quick
  
  // We'll queue tasks intelligently:
  const plannedOrder: Array<{ task: Task; preferredType: 'deep' | 'quick' | 'any' }> = [];

  // Interleave: Deep tasks in peak windows, Quick tasks as warm-ups or post-lunch buffers
  if (quickTasks.length > 0 && startMinutes <= 510) {
    // 8:00 - 9:00 AM quick warm-up task
    plannedOrder.push({ task: quickTasks.shift()!, preferredType: 'quick' });
  }

  // Deep work tasks get prime morning slots
  while (deepTasks.length > 0) {
    plannedOrder.push({ task: deepTasks.shift()!, preferredType: 'deep' });
    // Add a quick sprint in between deep work sessions if available to prevent student burnout
    if (quickTasks.length > 0 && Math.random() > 0.5) {
      plannedOrder.push({ task: quickTasks.shift()!, preferredType: 'quick' });
    }
  }

  // Remaining medium tasks
  while (mediumTasks.length > 0) {
    plannedOrder.push({ task: mediumTasks.shift()!, preferredType: 'any' });
  }

  // Remaining quick tasks
  while (quickTasks.length > 0) {
    plannedOrder.push({ task: quickTasks.shift()!, preferredType: 'quick' });
  }

  // Now allocate into timeline
  for (const { task } of plannedOrder) {
    const duration = task.predictedDuration;
    
    // Check if task fits within working hours
    if (currentCursor + duration > endMinutes) {
      unallocatedTasks.push(task);
      continue;
    }

    const blockStart = currentCursor;
    const blockEnd = currentCursor + duration;
    const startHour = Math.floor(blockStart / 60);
    const hourData = hourMap.get(startHour);
    const productivityScore = hourData?.score ?? 0.5;

    // Generate clear, transparent explanation for student
    let reasoning = '';
    const formattedStartTime = formatMinutesTo12Hour(blockStart);
    const formattedEndTime = formatMinutesTo12Hour(blockEnd);

    if (task.sizeBucket === 'large' || duration >= 60) {
      if (peakHours.includes(startHour)) {
        reasoning = `Slotted at ${formattedStartTime}: Peak focus window (${formatHourDisplay(startHour)} efficiency ${Math.round(productivityScore * 100)}%). Ideal for deep ${task.category}.`;
      } else {
        reasoning = `Slotted at ${formattedStartTime}: Continuous ${duration}m deep focus block to avoid context-switching in ${task.category}.`;
      }
    } else if (task.sizeBucket === 'small' || duration <= 30) {
      if (startHour >= 12 && startHour <= 14) {
        reasoning = `Slotted at ${formattedStartTime}: Low-fatigue quick sprint slotted into midday buffer window.`;
      } else {
        reasoning = `Slotted at ${formattedStartTime}: Quick ${duration}m sprint slotted before deeper cognitive work.`;
      }
    } else {
      reasoning = `Slotted at ${formattedStartTime}: Standard ${duration}m study block matched to your energy level.`;
    }

    // Attach scheduling timestamps to task copy
    const scheduledTask: Task = {
      ...task,
      scheduledStartTime: minutesToTimeString(blockStart),
      scheduledEndTime: minutesToTimeString(blockEnd),
      aiReasoning: reasoning
    };

    blocks.push({
      id: `block-${task.id}-${blockStart}`,
      task: scheduledTask,
      startMinutes: blockStart,
      endMinutes: blockEnd,
      startTime: minutesToTimeString(blockStart),
      endTime: minutesToTimeString(blockEnd),
      reasoning,
      confidenceScore: Math.min(0.98, Math.max(0.65, productivityScore + (profile.isColdStart ? 0 : 0.15)))
    });

    // Advance cursor with brief transition buffer
    currentCursor = blockEnd + buffer;

    // Add student meal/rest gap if crossing lunchtime (12:30 - 13:15)
    if (blockEnd <= 750 && currentCursor > 750 && currentCursor < 795) {
      currentCursor = 795; // resume at 1:15 PM
    }
  }

  const totalScheduledMinutes = blocks.reduce((sum, b) => sum + (b.endMinutes - b.startMinutes), 0);
  const peakHourSlotsUsed = blocks.filter(b => peakHours.includes(Math.floor(b.startMinutes / 60))).length;

  return {
    date,
    workingHoursStart: startMinutes,
    workingHoursEnd: endMinutes,
    blocks,
    unallocatedTasks,
    totalScheduledMinutes,
    peakHourSlotsUsed
  };
}
