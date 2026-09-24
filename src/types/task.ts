export type TaskSizeBucket = 'small' | 'medium' | 'large';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type EnergyRequirement = 'high_focus' | 'medium' | 'low_energy';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'snoozed';

export type StudentCategory = 
  | 'CS / Coding'
  | 'Mathematics'
  | 'Reading & Essays'
  | 'Natural Sciences'
  | 'Exams & Quizzes'
  | 'Admin & Quick Tasks'
  | string;

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  estimatedDuration: number; // in minutes
  predictedDuration: number; // in minutes (adjusted by learning engine)
  actualDuration?: number; // in minutes
  dueDate: string; // YYYY-MM-DD
  category: StudentCategory;
  priority: TaskPriority;
  energyLevel: EnergyRequirement;
  sizeBucket: TaskSizeBucket;
  subtasks: Subtask[];
  status: TaskStatus;
  createdAt: number;
  scheduledStartTime?: string; // e.g. "09:30"
  scheduledEndTime?: string; // e.g. "11:00"
  aiReasoning?: string;
  startedAt?: number;
  completedAt?: number;
  completionEventId?: string;
}

export interface CompletionEvent {
  id: string;
  taskId: string;
  taskTitle: string;
  estimatedDuration: number;
  actualDuration: number;
  durationRatio: number; // actual / estimated (e.g. 1.25 = took 25% longer)
  completedAt: number;
  hourOfDay: number; // 0-23
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  category: string;
  sizeBucket: TaskSizeBucket;
  completedOnSchedule: boolean;
  notes?: string;
}

export interface CategoryBias {
  category: string;
  sampleCount: number;
  averageRatio: number; // weighted moving average of actual/estimate
  trend: 'underestimates' | 'overestimates' | 'accurate';
  averageDeltaMinutes: number;
}

export interface HourlyProductivity {
  hour: number; // 0-23
  displayHour: string; // e.g. "9 AM"
  productivityScore: number; // normalized 0.0 - 1.0
  deepWorkCount: number;
  quickSprintCount: number;
  recommendedTaskType: 'deep_work' | 'quick_sprint' | 'rest_or_admin';
  energyTier: 'peak' | 'optimal' | 'moderate' | 'low';
}

export interface DayProductivity {
  dayIndex: number; // 0-6
  dayName: string;
  completionCount: number;
  focusEfficiency: number; // 0.0 - 1.0
}

export interface LearnedProfile {
  version: number;
  totalCompletedTasks: number;
  lastRecalculated: number;
  isColdStart: boolean;
  categoryBiases: Record<string, CategoryBias>;
  hourlyCurve: HourlyProductivity[];
  weeklyCurve: DayProductivity[];
  overallAccuracyRate: number; // percentage (e.g. 84%)
  avgDurationRatio: number;
  insights: string[];
}

export interface ScheduleBlock {
  id: string;
  task: Task;
  startMinutes: number; // from midnight (e.g., 570 = 9:30 AM)
  endMinutes: number;
  startTime: string; // "09:30"
  endTime: string; // "11:00"
  reasoning: string;
  confidenceScore: number; // 0.0 - 1.0
  isPinned?: boolean;
}

export interface DaySchedule {
  date: string;
  workingHoursStart: number; // minutes from midnight, e.g. 480 (8:00 AM)
  workingHoursEnd: number; // minutes from midnight, e.g. 1320 (10:00 PM)
  blocks: ScheduleBlock[];
  unallocatedTasks: Task[];
  totalScheduledMinutes: number;
  peakHourSlotsUsed: number;
}
