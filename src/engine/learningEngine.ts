import {
  CompletionEvent,
  LearnedProfile,
  CategoryBias,
  HourlyProductivity,
  DayProductivity,
  TaskSizeBucket
} from '../types/task';

// Sensible cold-start circadian default curve for students
// Students typically experience peak morning alertness (9-12), post-lunch slump (13-15),
// second evening focus peak (16-19), and wind-down (21-23).
export const COLD_START_HOURLY_DEFAULTS: Record<number, { score: number; type: 'deep_work' | 'quick_sprint' | 'rest_or_admin'; tier: 'peak' | 'optimal' | 'moderate' | 'low' }> = {
  0: { score: 0.1, type: 'rest_or_admin', tier: 'low' },
  1: { score: 0.05, type: 'rest_or_admin', tier: 'low' },
  2: { score: 0.0, type: 'rest_or_admin', tier: 'low' },
  3: { score: 0.0, type: 'rest_or_admin', tier: 'low' },
  4: { score: 0.0, type: 'rest_or_admin', tier: 'low' },
  5: { score: 0.05, type: 'rest_or_admin', tier: 'low' },
  6: { score: 0.2, type: 'quick_sprint', tier: 'low' },
  7: { score: 0.35, type: 'quick_sprint', tier: 'moderate' },
  8: { score: 0.6, type: 'quick_sprint', tier: 'moderate' },
  9: { score: 0.9, type: 'deep_work', tier: 'peak' },
  10: { score: 0.95, type: 'deep_work', tier: 'peak' },
  11: { score: 0.85, type: 'deep_work', tier: 'peak' },
  12: { score: 0.5, type: 'quick_sprint', tier: 'moderate' },
  13: { score: 0.3, type: 'quick_sprint', tier: 'low' }, // post-lunch dip
  14: { score: 0.45, type: 'quick_sprint', tier: 'moderate' },
  15: { score: 0.65, type: 'quick_sprint', tier: 'moderate' },
  16: { score: 0.85, type: 'deep_work', tier: 'optimal' }, // late afternoon surge
  17: { score: 0.8, type: 'deep_work', tier: 'optimal' },
  18: { score: 0.6, type: 'quick_sprint', tier: 'moderate' },
  19: { score: 0.7, type: 'deep_work', tier: 'optimal' }, // evening study
  20: { score: 0.65, type: 'deep_work', tier: 'moderate' },
  21: { score: 0.4, type: 'quick_sprint', tier: 'low' },
  22: { score: 0.25, type: 'rest_or_admin', tier: 'low' },
  23: { score: 0.15, type: 'rest_or_admin', tier: 'low' }
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format hour into 12-hour format string (e.g. 9 -> "9 AM", 13 -> "1 PM")
 */
export function formatHourDisplay(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

/**
 * Classify task size based on duration
 */
export function classifyTaskSize(minutes: number): TaskSizeBucket {
  if (minutes <= 30) return 'small';
  if (minutes <= 85) return 'medium';
  return 'large';
}

/**
 * Predict actual task duration using learned category bias
 */
export function predictTaskDuration(
  estimatedMinutes: number,
  category: string,
  profile: LearnedProfile
): { predictedMinutes: number; ratio: number; explanation: string } {
  if (profile.isColdStart || !profile.categoryBiases[category]) {
    return {
      predictedMinutes: estimatedMinutes,
      ratio: 1.0,
      explanation: 'Using user estimate (Standard initial baseline)'
    };
  }

  const bias = profile.categoryBiases[category];
  // Dampen extreme bias to stay within realistic bounds [0.55x - 2.2x]
  const clampedRatio = Math.max(0.55, Math.min(2.2, bias.averageRatio));
  const rawPredicted = estimatedMinutes * clampedRatio;
  
  // Snap to nearest 5-minute increment
  const predictedMinutes = Math.max(5, Math.round(rawPredicted / 5) * 5);

  let explanation = '';
  if (bias.sampleCount >= 2) {
    const diff = predictedMinutes - estimatedMinutes;
    if (Math.abs(diff) < 5) {
      explanation = `Matches your verified accuracy rate for ${category}`;
    } else if (diff > 0) {
      explanation = `Adjusted +${diff}m (historical ${Math.round((bias.averageRatio - 1) * 100)}% underestimation in ${category})`;
    } else {
      explanation = `Adjusted -${Math.abs(diff)}m (you complete ${category} faster than estimated)`;
    }
  } else {
    explanation = 'Initial profile prediction';
  }

  return { predictedMinutes, ratio: clampedRatio, explanation };
}

/**
 * Recalculate full learned profile from all historical completion events
 */
export function recalculateLearnedProfile(events: CompletionEvent[]): LearnedProfile {
  const isColdStart = events.length < 5;
  const version = Date.now();

  if (events.length === 0) {
    return createInitialProfile();
  }

  // 1. Calculate per-category duration biases (Exponential Moving Average / Weighted Average)
  const categoryGroups: Record<string, CompletionEvent[]> = {};
  for (const event of events) {
    if (!categoryGroups[event.category]) {
      categoryGroups[event.category] = [];
    }
    categoryGroups[event.category].push(event);
  }

  const categoryBiases: Record<string, CategoryBias> = {};
  let totalDeltaRatioSum = 0;

  for (const [category, catEvents] of Object.entries(categoryGroups)) {
    // Sort chronologically
    const sorted = [...catEvents].sort((a, b) => a.completedAt - b.completedAt);
    
    // Calculate exponentially weighted moving average (more recent completions carry higher weight)
    let weightedRatioSum = 0;
    let weightSum = 0;
    let totalMinutesDelta = 0;

    const decayFactor = 0.85; // Recent events weightier
    sorted.forEach((ev, idx) => {
      const weight = Math.pow(decayFactor, sorted.length - 1 - idx);
      const ratio = ev.actualDuration / Math.max(5, ev.estimatedDuration);
      weightedRatioSum += ratio * weight;
      weightSum += weight;
      totalMinutesDelta += (ev.actualDuration - ev.estimatedDuration);
    });

    const averageRatio = weightSum > 0 ? Number((weightedRatioSum / weightSum).toFixed(2)) : 1.0;
    const avgDeltaMinutes = Math.round(totalMinutesDelta / sorted.length);

    let trend: 'underestimates' | 'overestimates' | 'accurate' = 'accurate';
    if (averageRatio > 1.15) trend = 'underestimates';
    else if (averageRatio < 0.88) trend = 'overestimates';

    categoryBiases[category] = {
      category,
      sampleCount: sorted.length,
      averageRatio,
      trend,
      averageDeltaMinutes: avgDeltaMinutes
    };

    totalDeltaRatioSum += averageRatio;
  }

  // 2. Hourly productivity curve histogram
  const hourlyStats: Array<{
    hour: number;
    deepWorkCount: number;
    quickSprintCount: number;
    totalMinutes: number;
  }> = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    deepWorkCount: 0,
    quickSprintCount: 0,
    totalMinutes: 0
  }));

  for (const event of events) {
    const h = event.hourOfDay;
    if (h >= 0 && h < 24) {
      if (event.sizeBucket === 'large' || event.actualDuration >= 60) {
        hourlyStats[h].deepWorkCount += 1;
      } else {
        hourlyStats[h].quickSprintCount += 1;
      }
      hourlyStats[h].totalMinutes += event.actualDuration;
    }
  }

  // Find max completions in an hour to normalize
  const maxVolume = Math.max(1, ...hourlyStats.map(s => s.deepWorkCount * 2 + s.quickSprintCount));

  const hourlyCurve: HourlyProductivity[] = hourlyStats.map(stat => {
    const defaultData = COLD_START_HOURLY_DEFAULTS[stat.hour];
    let score = defaultData.score;
    let deepWorkCount = stat.deepWorkCount;
    let quickSprintCount = stat.quickSprintCount;

    if (!isColdStart && (stat.deepWorkCount + stat.quickSprintCount > 0)) {
      // Blend 70% empirical data + 30% baseline smoothing
      const empiricalScore = Math.min(1.0, (stat.deepWorkCount * 2 + stat.quickSprintCount) / maxVolume);
      score = Number((empiricalScore * 0.75 + defaultData.score * 0.25).toFixed(2));
    }

    let recommendedTaskType: 'deep_work' | 'quick_sprint' | 'rest_or_admin' = defaultData.type;
    if (deepWorkCount > quickSprintCount && score >= 0.6) {
      recommendedTaskType = 'deep_work';
    } else if (quickSprintCount > 0 || (score >= 0.3 && score < 0.6)) {
      recommendedTaskType = 'quick_sprint';
    } else if (score < 0.3) {
      recommendedTaskType = 'rest_or_admin';
    }

    let energyTier: 'peak' | 'optimal' | 'moderate' | 'low' = 'low';
    if (score >= 0.8) energyTier = 'peak';
    else if (score >= 0.6) energyTier = 'optimal';
    else if (score >= 0.35) energyTier = 'moderate';

    return {
      hour: stat.hour,
      displayHour: formatHourDisplay(stat.hour),
      productivityScore: score,
      deepWorkCount,
      quickSprintCount,
      recommendedTaskType,
      energyTier
    };
  });

  // 3. Weekly productivity curve
  const dayStats = Array.from({ length: 7 }, (_, i) => ({
    dayIndex: i,
    count: 0
  }));

  for (const event of events) {
    const d = event.dayOfWeek;
    if (d >= 0 && d < 7) {
      dayStats[d].count += 1;
    }
  }

  const maxDayCount = Math.max(1, ...dayStats.map(d => d.count));
  const weeklyCurve: DayProductivity[] = dayStats.map(stat => ({
    dayIndex: stat.dayIndex,
    dayName: DAY_NAMES[stat.dayIndex],
    completionCount: stat.count,
    focusEfficiency: Number((stat.count / maxDayCount).toFixed(2))
  }));

  // 4. Overall accuracy calculation
  const onTimeCount = events.filter(e => Math.abs(e.actualDuration - e.estimatedDuration) <= 15).length;
  const overallAccuracyRate = Math.round((onTimeCount / events.length) * 100);
  const avgDurationRatio = Number((totalDeltaRatioSum / Math.max(1, Object.keys(categoryBiases).length)).toFixed(2));

  // 5. Synthesize transparent student-specific insights
  const insights: string[] = [];
  if (isColdStart) {
    insights.push('Cold start active: using circadian student baseline (mornings for deep focus, afternoons for quick tasks).');
    insights.push(`Completed ${events.length}/5 tasks to activate your personalized behavioral model.`);
  } else {
    // Check significant underestimations
    const under = Object.values(categoryBiases).find(b => b.trend === 'underestimates' && b.sampleCount >= 2);
    if (under) {
      insights.push(`You tend to underestimate "${under.category}" by ~${Math.round((under.averageRatio - 1) * 100)}%. The scheduler auto-buffers these blocks.`);
    }

    // Find peak hours
    const peakHours = hourlyCurve.filter(h => h.energyTier === 'peak').map(h => h.displayHour);
    if (peakHours.length > 0) {
      insights.push(`Your strongest cognitive focus windows are around ${peakHours.slice(0, 3).join(', ')}.`);
    }

    const quickPreferred = hourlyCurve.filter(h => h.recommendedTaskType === 'quick_sprint' && h.energyTier === 'moderate').map(h => h.displayHour);
    if (quickPreferred.length > 0) {
      insights.push(`Low-fatigue admin and flashcard tasks are slotted around ${quickPreferred.slice(0, 2).join(' and ')}.`);
    }
  }

  return {
    version,
    totalCompletedTasks: events.length,
    lastRecalculated: Date.now(),
    isColdStart,
    categoryBiases,
    hourlyCurve,
    weeklyCurve,
    overallAccuracyRate: Math.max(10, overallAccuracyRate),
    avgDurationRatio,
    insights
  };
}

/**
 * Default empty profile for brand-new users
 */
export function createInitialProfile(): LearnedProfile {
  const hourlyCurve: HourlyProductivity[] = Array.from({ length: 24 }, (_, hour) => {
    const def = COLD_START_HOURLY_DEFAULTS[hour];
    return {
      hour,
      displayHour: formatHourDisplay(hour),
      productivityScore: def.score,
      deepWorkCount: 0,
      quickSprintCount: 0,
      recommendedTaskType: def.type,
      energyTier: def.tier
    };
  });

  const weeklyCurve: DayProductivity[] = DAY_NAMES.map((name, i) => ({
    dayIndex: i,
    dayName: name,
    completionCount: 0,
    focusEfficiency: i === 0 || i === 6 ? 0.4 : 0.8
  }));

  return {
    version: 1,
    totalCompletedTasks: 0,
    lastRecalculated: Date.now(),
    isColdStart: true,
    categoryBiases: {},
    hourlyCurve,
    weeklyCurve,
    overallAccuracyRate: 50,
    avgDurationRatio: 1.0,
    insights: [
      'Cold-start baseline active: deep study blocks targeted for morning & late afternoon peaks.',
      'Complete tasks using the active timer to train your personal estimation curves.'
    ]
  };
}
