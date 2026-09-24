import { Task, CompletionEvent, LearnedProfile, DaySchedule } from '../types/task';
import { recalculateLearnedProfile, createInitialProfile, classifyTaskSize } from '../engine/learningEngine';
import { allocateDaySchedule } from '../engine/scheduler';

const TASKS_STORAGE_KEY = 'kairos_tasks_v1';
const EVENTS_STORAGE_KEY = 'kairos_completion_events_v1';
const PROFILE_STORAGE_KEY = 'kairos_learned_profile_v1';
const ACTIVE_TIMER_KEY = 'kairos_active_timer_v1';

// Rich, realistic college & school student initial tasks
export const INITIAL_STUDENT_TASKS: Task[] = [
  {
    id: 'task-math-1',
    title: 'Multivariable Calculus: Vector Fields & Green’s Theorem',
    notes: 'Problems 14 through 28 on Stewart Calc Ch 16. Needs pen & paper derivation.',
    estimatedDuration: 60,
    predictedDuration: 85, // Adjusts based on Math underestimation
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Mathematics',
    priority: 'urgent',
    energyLevel: 'high_focus',
    sizeBucket: 'large',
    subtasks: [
      { id: 's1', title: 'Review lecture curl & divergence formulas', completed: true },
      { id: 's2', title: 'Solve problems 14 to 20', completed: false },
      { id: 's3', title: 'Check boundary line integrals on 21-28', completed: false }
    ],
    status: 'todo',
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: 'task-cs-1',
    title: 'Operating Systems: Implement LRU Page Replacement in C',
    notes: 'Pass all 14 unit test assertions in paging_sim.c. Watch out for dirty bit race conditions.',
    estimatedDuration: 90,
    predictedDuration: 110,
    dueDate: new Date().toISOString().split('T')[0],
    category: 'CS / Coding',
    priority: 'high',
    energyLevel: 'high_focus',
    sizeBucket: 'large',
    subtasks: [
      { id: 'cs-s1', title: 'Doubly-linked hash map structure', completed: true },
      { id: 'cs-s2', title: 'Eviction policy on memory frame hit/miss', completed: false },
      { id: 'cs-s3', title: 'Run valgrind memory leak checks', completed: false }
    ],
    status: 'in_progress',
    createdAt: Date.now() - 3600000 * 18
  },
  {
    id: 'task-admin-1',
    title: 'Submit Chem Lab TA Office Hours Form',
    notes: 'Upload pre-lab sheet 4 to Canvas portal.',
    estimatedDuration: 15,
    predictedDuration: 15,
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Admin & Quick Tasks',
    priority: 'medium',
    energyLevel: 'low_energy',
    sizeBucket: 'small',
    subtasks: [],
    status: 'todo',
    createdAt: Date.now() - 3600000 * 5
  },
  {
    id: 'task-read-1',
    title: 'Philosophy of Mind: Dennett’s Intentional Stance Essay',
    notes: 'Draft 750 words on functionalism vs qualia objections.',
    estimatedDuration: 45,
    predictedDuration: 40,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    category: 'Reading & Essays',
    priority: 'medium',
    energyLevel: 'medium',
    sizeBucket: 'medium',
    subtasks: [
      { id: 'r1', title: 'Highlight key arguments in sections 2-3', completed: false },
      { id: 'r2', title: 'Write introductory thesis', completed: false }
    ],
    status: 'todo',
    createdAt: Date.now() - 3600000 * 2
  },
  {
    id: 'task-quiz-1',
    title: 'Organic Chemistry Flashcard Drill (Reaction Mechanisms)',
    notes: 'Quick Anki deck 50 cards before dinner.',
    estimatedDuration: 20,
    predictedDuration: 20,
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Exams & Quizzes',
    priority: 'low',
    energyLevel: 'low_energy',
    sizeBucket: 'small',
    subtasks: [],
    status: 'todo',
    createdAt: Date.now() - 3600000 * 1
  }
];

// 16 realistic past completions representing a real student's two-week study cadence
export const SEED_COMPLETION_EVENTS: CompletionEvent[] = [
  // Math: User regularly underestimates by 30-40%
  {
    id: 'ev-seed-1',
    taskId: 'past-m1',
    taskTitle: 'Differential Equations Homework 2',
    category: 'Mathematics',
    estimatedDuration: 45,
    actualDuration: 65,
    durationRatio: 1.44,
    completedAt: Date.now() - 86400000 * 8,
    hourOfDay: 10,
    dayOfWeek: 2,
    sizeBucket: 'medium',
    completedOnSchedule: true
  },
  {
    id: 'ev-seed-2',
    taskId: 'past-m2',
    taskTitle: 'Linear Algebra Matrix Transformations',
    category: 'Mathematics',
    estimatedDuration: 60,
    actualDuration: 85,
    durationRatio: 1.41,
    completedAt: Date.now() - 86400000 * 7,
    hourOfDay: 11,
    dayOfWeek: 3,
    sizeBucket: 'large',
    completedOnSchedule: true
  },
  {
    id: 'ev-seed-3',
    taskId: 'past-m3',
    taskTitle: 'Discrete Math Induction Proofs',
    category: 'Mathematics',
    estimatedDuration: 50,
    actualDuration: 70,
    durationRatio: 1.4,
    completedAt: Date.now() - 86400000 * 6,
    hourOfDay: 10,
    dayOfWeek: 4,
    sizeBucket: 'medium',
    completedOnSchedule: true
  },
  {
    id: 'ev-seed-4',
    taskId: 'past-m4',
    taskTitle: 'Calculus Series & Sequences Drill',
    category: 'Mathematics',
    estimatedDuration: 40,
    actualDuration: 55,
    durationRatio: 1.38,
    completedAt: Date.now() - 86400000 * 3,
    hourOfDay: 9,
    dayOfWeek: 1,
    sizeBucket: 'medium',
    completedOnSchedule: true
  },
  // CS: Deep blocks take slightly longer (+15%)
  {
    id: 'ev-seed-5',
    taskId: 'past-cs1',
    taskTitle: 'Algorithms: Red-Black Tree Balancing',
    category: 'CS / Coding',
    estimatedDuration: 90,
    actualDuration: 105,
    durationRatio: 1.16,
    completedAt: Date.now() - 86400000 * 8,
    hourOfDay: 10,
    dayOfWeek: 2,
    sizeBucket: 'large',
    completedOnSchedule: true
  },
  {
    id: 'ev-seed-6',
    taskId: 'past-cs2',
    taskTitle: 'Web Dev: React State Architecture Refactor',
    category: 'CS / Coding',
    estimatedDuration: 80,
    actualDuration: 95,
    durationRatio: 1.18,
    completedAt: Date.now() - 86400000 * 5,
    hourOfDay: 16,
    dayOfWeek: 4,
    sizeBucket: 'large',
    completedOnSchedule: true
  },
  {
    id: 'ev-seed-7',
    taskId: 'past-cs3',
    taskTitle: 'Database Systems: SQL B-Tree Index Query Optimizer',
    category: 'CS / Coding',
    estimatedDuration: 60,
    actualDuration: 70,
    durationRatio: 1.16,
    completedAt: Date.now() - 86400000 * 2,
    hourOfDay: 17,
    dayOfWeek: 2,
    sizeBucket: 'medium',
    completedOnSchedule: true
  },
  // Reading: Overestimates (finishes 15-20% faster!)
  {
    id: 'ev-seed-8',
    taskId: 'past-r1',
    taskTitle: 'Literature Review: Modernist Poetry Notes',
    category: 'Reading & Essays',
    estimatedDuration: 60,
    actualDuration: 45,
    durationRatio: 0.75,
    completedAt: Date.now() - 86400000 * 7,
    hourOfDay: 14,
    dayOfWeek: 3,
    sizeBucket: 'medium',
    completedOnSchedule: true
  },
  {
    id: 'ev-seed-9',
    taskId: 'past-r2',
    taskTitle: 'Sociology Urban Dynamics Chapter 4',
    category: 'Reading & Essays',
    estimatedDuration: 45,
    actualDuration: 35,
    durationRatio: 0.77,
    completedAt: Date.now() - 86400000 * 4,
    hourOfDay: 15,
    dayOfWeek: 5,
    sizeBucket: 'medium',
    completedOnSchedule: true
  },
  // Admin & Quick Tasks: highly accurate quick sprints
  {
    id: 'ev-seed-10',
    taskId: 'past-ad1',
    taskTitle: 'Email Academic Advisor re: Add/Drop Deadline',
    category: 'Admin & Quick Tasks',
    estimatedDuration: 10,
    actualDuration: 8,
    durationRatio: 0.8,
    completedAt: Date.now() - 86400000 * 7,
    hourOfDay: 13,
    dayOfWeek: 3,
    sizeBucket: 'small',
    completedOnSchedule: true
  },
  {
    id: 'ev-seed-11',
    taskId: 'past-ad2',
    taskTitle: 'Print Physics Lab Manual',
    category: 'Admin & Quick Tasks',
    estimatedDuration: 15,
    actualDuration: 14,
    durationRatio: 0.93,
    completedAt: Date.now() - 86400000 * 6,
    hourOfDay: 12,
    dayOfWeek: 4,
    sizeBucket: 'small',
    completedOnSchedule: true
  },
  {
    id: 'ev-seed-12',
    taskId: 'past-ad3',
    taskTitle: 'Register for ACM Student Chapter Hackathon',
    category: 'Admin & Quick Tasks',
    estimatedDuration: 15,
    actualDuration: 15,
    durationRatio: 1.0,
    completedAt: Date.now() - 86400000 * 4,
    hourOfDay: 13,
    dayOfWeek: 5,
    sizeBucket: 'small',
    completedOnSchedule: true
  },
  // Evening reviews & quiz preps
  {
    id: 'ev-seed-13',
    taskId: 'past-q1',
    taskTitle: 'Biology Cell Respiration Quiz Prep',
    category: 'Exams & Quizzes',
    estimatedDuration: 30,
    actualDuration: 32,
    durationRatio: 1.06,
    completedAt: Date.now() - 86400000 * 5,
    hourOfDay: 19,
    dayOfWeek: 4,
    sizeBucket: 'small',
    completedOnSchedule: true
  },
  {
    id: 'ev-seed-14',
    taskId: 'past-q2',
    taskTitle: 'Physics Electrostatics Practice Exam 1',
    category: 'Exams & Quizzes',
    estimatedDuration: 60,
    actualDuration: 65,
    durationRatio: 1.08,
    completedAt: Date.now() - 86400000 * 3,
    hourOfDay: 20,
    dayOfWeek: 1,
    sizeBucket: 'medium',
    completedOnSchedule: true
  }
];

export class TaskStore {
  private static load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  static getTasks(): Task[] {
    const tasks = this.load<Task[]>(TASKS_STORAGE_KEY, []);
    if (tasks.length === 0) {
      this.save(TASKS_STORAGE_KEY, INITIAL_STUDENT_TASKS);
      return INITIAL_STUDENT_TASKS;
    }
    return tasks;
  }

  static setTasks(tasks: Task[]): void {
    this.save(TASKS_STORAGE_KEY, tasks);
  }

  static getCompletionEvents(): CompletionEvent[] {
    const events = this.load<CompletionEvent[]>(EVENTS_STORAGE_KEY, []);
    if (events.length === 0) {
      this.save(EVENTS_STORAGE_KEY, SEED_COMPLETION_EVENTS);
      return SEED_COMPLETION_EVENTS;
    }
    return events;
  }

  static setCompletionEvents(events: CompletionEvent[]): void {
    this.save(EVENTS_STORAGE_KEY, events);
  }

  static getLearnedProfile(): LearnedProfile {
    const events = this.getCompletionEvents();
    return recalculateLearnedProfile(events);
  }

  static logCompletion(
    task: Task,
    actualMinutes: number,
    notes?: string
  ): { updatedTask: Task; newEvent: CompletionEvent; profile: LearnedProfile } {
    const now = new Date();
    const est = task.estimatedDuration || 30;
    const actual = Math.max(1, actualMinutes);
    const ratio = Number((actual / est).toFixed(2));

    const newEvent: CompletionEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      taskId: task.id,
      taskTitle: task.title,
      estimatedDuration: est,
      actualDuration: actual,
      durationRatio: ratio,
      completedAt: now.getTime(),
      hourOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      category: task.category,
      sizeBucket: classifyTaskSize(actual),
      completedOnSchedule: true,
      notes
    };

    const allEvents = [...this.getCompletionEvents(), newEvent];
    this.setCompletionEvents(allEvents);

    const updatedTask: Task = {
      ...task,
      status: 'completed',
      actualDuration: actual,
      completedAt: now.getTime(),
      completionEventId: newEvent.id
    };

    const tasks = this.getTasks().map(t => (t.id === task.id ? updatedTask : t));
    this.setTasks(tasks);

    const profile = recalculateLearnedProfile(allEvents);
    this.save(PROFILE_STORAGE_KEY, profile);

    return { updatedTask, newEvent, profile };
  }

  static resetToColdStart(): void {
    this.save(TASKS_STORAGE_KEY, INITIAL_STUDENT_TASKS);
    this.save(EVENTS_STORAGE_KEY, []);
    this.save(PROFILE_STORAGE_KEY, createInitialProfile());
  }

  static seedLearnedStudentHabits(): void {
    this.save(TASKS_STORAGE_KEY, INITIAL_STUDENT_TASKS);
    this.save(EVENTS_STORAGE_KEY, SEED_COMPLETION_EVENTS);
    const profile = recalculateLearnedProfile(SEED_COMPLETION_EVENTS);
    this.save(PROFILE_STORAGE_KEY, profile);
  }
}
