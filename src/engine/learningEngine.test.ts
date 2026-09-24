import { describe, it, expect } from 'vitest';
import {
  recalculateLearnedProfile,
  predictTaskDuration,
  classifyTaskSize,
  createInitialProfile
} from './learningEngine';
import { allocateDaySchedule } from './scheduler';
import { CompletionEvent, Task } from '../types/task';

describe('Learning Engine & Scheduling System', () => {
  it('correctly handles cold start with no history', () => {
    const profile = createInitialProfile();
    expect(profile.isColdStart).toBe(true);
    expect(profile.totalCompletedTasks).toBe(0);
    expect(profile.categoryBiases).toEqual({});

    // Prediction should fall back to user estimate on cold start
    const pred = predictTaskDuration(45, 'Mathematics', profile);
    expect(pred.predictedMinutes).toBe(45);
    expect(pred.ratio).toBe(1.0);
  });

  it('learns per-category underestimation bias from synthetic history', () => {
    // Synthetic history of a college student who consistently underestimates Math (takes ~1.5x)
    // and overestimates Reading (finishes in 0.8x)
    const syntheticEvents: CompletionEvent[] = [
      {
        id: 'ev-1',
        taskId: 't-1',
        taskTitle: 'Calculus Problem Set 3',
        category: 'Mathematics',
        estimatedDuration: 40,
        actualDuration: 60, // 1.5x
        durationRatio: 1.5,
        completedAt: Date.now() - 86400000 * 5,
        hourOfDay: 10,
        dayOfWeek: 1,
        sizeBucket: 'medium',
        completedOnSchedule: true
      },
      {
        id: 'ev-2',
        taskId: 't-2',
        taskTitle: 'Linear Algebra Eigenvalues',
        category: 'Mathematics',
        estimatedDuration: 60,
        actualDuration: 90, // 1.5x
        durationRatio: 1.5,
        completedAt: Date.now() - 86400000 * 4,
        hourOfDay: 11,
        dayOfWeek: 2,
        sizeBucket: 'large',
        completedOnSchedule: true
      },
      {
        id: 'ev-3',
        taskId: 't-3',
        taskTitle: 'Discrete Math Proofs',
        category: 'Mathematics',
        estimatedDuration: 50,
        actualDuration: 75, // 1.5x
        durationRatio: 1.5,
        completedAt: Date.now() - 86400000 * 3,
        hourOfDay: 10,
        dayOfWeek: 3,
        sizeBucket: 'medium',
        completedOnSchedule: true
      },
      {
        id: 'ev-4',
        taskId: 't-4',
        taskTitle: 'World History Chapter 12',
        category: 'Reading & Essays',
        estimatedDuration: 60,
        actualDuration: 45, // 0.75x
        durationRatio: 0.75,
        completedAt: Date.now() - 86400000 * 2,
        hourOfDay: 14,
        dayOfWeek: 4,
        sizeBucket: 'medium',
        completedOnSchedule: true
      },
      {
        id: 'ev-5',
        taskId: 't-5',
        taskTitle: 'Philosophy Ethics Essay Reading',
        category: 'Reading & Essays',
        estimatedDuration: 80,
        actualDuration: 65, // ~0.81x
        durationRatio: 0.81,
        completedAt: Date.now() - 86400000 * 1,
        hourOfDay: 15,
        dayOfWeek: 5,
        sizeBucket: 'medium',
        completedOnSchedule: true
      },
      {
        id: 'ev-6',
        taskId: 't-6',
        taskTitle: 'Submit Lab Safety Form',
        category: 'Admin & Quick Tasks',
        estimatedDuration: 10,
        actualDuration: 12,
        durationRatio: 1.2,
        completedAt: Date.now() - 86400000 * 1,
        hourOfDay: 13,
        dayOfWeek: 5,
        sizeBucket: 'small',
        completedOnSchedule: true
      }
    ];

    const profile = recalculateLearnedProfile(syntheticEvents);
    expect(profile.isColdStart).toBe(false);
    expect(profile.totalCompletedTasks).toBe(6);

    // Verify Math bias
    const mathBias = profile.categoryBiases['Mathematics'];
    expect(mathBias).toBeDefined();
    expect(mathBias.trend).toBe('underestimates');
    expect(mathBias.averageRatio).toBeGreaterThan(1.3);

    // Verify Reading bias
    const readingBias = profile.categoryBiases['Reading & Essays'];
    expect(readingBias).toBeDefined();
    expect(readingBias.trend).toBe('overestimates');
    expect(readingBias.averageRatio).toBeLessThan(0.9);

    // Test duration prediction
    const testMathEst = 60; // Student inputs 60 min
    const mathPred = predictTaskDuration(testMathEst, 'Mathematics', profile);
    // Should be automatically buffered to ~90m (nearest 5 min)
    expect(mathPred.predictedMinutes).toBeGreaterThan(testMathEst);
    expect(mathPred.explanation).toContain('Mathematics');

    const testReadingEst = 60;
    const readingPred = predictTaskDuration(testReadingEst, 'Reading & Essays', profile);
    // Should be adjusted downward
    expect(readingPred.predictedMinutes).toBeLessThanOrEqual(testReadingEst);
  });

  it('determines peak productivity hours accurately', () => {
    // 10 completions in morning (9-11 AM)
    const morningEvents: CompletionEvent[] = Array.from({ length: 10 }, (_, i) => ({
      id: `m-${i}`,
      taskId: `t-m-${i}`,
      taskTitle: `Morning Deep Study ${i}`,
      category: 'CS / Coding',
      estimatedDuration: 90,
      actualDuration: 90,
      durationRatio: 1.0,
      completedAt: Date.now() - 3600000 * i,
      hourOfDay: 10, // 10 AM
      dayOfWeek: 2,
      sizeBucket: 'large',
      completedOnSchedule: true
    }));

    const profile = recalculateLearnedProfile(morningEvents);
    const hour10 = profile.hourlyCurve.find(h => h.hour === 10);
    expect(hour10).toBeDefined();
    expect(hour10?.energyTier).toBe('peak');
    expect(hour10?.recommendedTaskType).toBe('deep_work');
  });

  it('allocates large tasks into peak hours and small tasks into buffer gaps', () => {
    const profile = createInitialProfile();

    const tasks: Task[] = [
      {
        id: 't-quick',
        title: 'Submit Quiz online',
        category: 'Admin & Quick Tasks',
        estimatedDuration: 15,
        predictedDuration: 15,
        priority: 'high',
        energyLevel: 'low_energy',
        sizeBucket: 'small',
        dueDate: '2026-09-24',
        subtasks: [],
        status: 'todo',
        createdAt: Date.now()
      },
      {
        id: 't-deep',
        title: 'Compilers Project Phase 2 AST Parser',
        category: 'CS / Coding',
        estimatedDuration: 120,
        predictedDuration: 120,
        priority: 'urgent',
        energyLevel: 'high_focus',
        sizeBucket: 'large',
        dueDate: '2026-09-24',
        subtasks: [{ id: 's1', title: 'Write parser tokens', completed: false }],
        status: 'todo',
        createdAt: Date.now()
      }
    ];

    const schedule = allocateDaySchedule(tasks, profile, {
      workingHoursStart: 480, // 8:00 AM
      workingHoursEnd: 1200 // 8:00 PM
    });

    expect(schedule.blocks.length).toBe(2);
    // Find the deep task block
    const deepBlock = schedule.blocks.find(b => b.task.id === 't-deep');
    expect(deepBlock).toBeDefined();
    expect(deepBlock?.reasoning).toContain('deep');

    // Find the quick task block
    const quickBlock = schedule.blocks.find(b => b.task.id === 't-quick');
    expect(quickBlock).toBeDefined();
    expect(quickBlock?.reasoning).toContain('sprint');
  });

  it('correctly classifies task sizes', () => {
    expect(classifyTaskSize(15)).toBe('small');
    expect(classifyTaskSize(30)).toBe('small');
    expect(classifyTaskSize(45)).toBe('medium');
    expect(classifyTaskSize(80)).toBe('medium');
    expect(classifyTaskSize(90)).toBe('large');
    expect(classifyTaskSize(180)).toBe('large');
  });
});
