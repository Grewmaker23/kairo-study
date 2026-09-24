import { Assignment, ComplexityLevel, PredictiveEngineResult } from '../types/assignment';

// Complexity multipliers calibrated for academic friction & unexpected debugging/writing overhead
export const COMPLEXITY_MULTIPLIERS: Record<ComplexityLevel, { factor: number; label: string }> = {
  1: { factor: 0.85, label: 'Level 1: Introductory / Review' },
  2: { factor: 0.95, label: 'Level 2: Moderate / Standard' },
  3: { factor: 1.05, label: 'Level 3: Demanding Problem Set' },
  4: { factor: 1.22, label: 'Level 4: Complex Multi-part Lab' },
  5: { factor: 1.40, label: 'Level 5: Exhaustive Research / Capstone' }
};

/**
 * Derives the student's historical Efficiency Index (Actual Hours / Estimated Hours).
 * Values > 1.0 mean the user under-estimates (tasks take longer than expected).
 * Values < 1.0 mean the user over-estimates (finishes faster).
 */
export function calculateHistoricalEfficiencyRatio(
  assignments: Assignment[],
  targetCourse?: string
): { ratio: number; sampleCount: number; isCourseSpecific: boolean } {
  const completed = assignments.filter(
    a => a.status === 'completed' && a.actualHours && a.actualHours > 0 && a.estimatedHours > 0
  );

  if (completed.length === 0) {
    // Cold start default: student baseline typically exhibits a +20% overrun
    return { ratio: 1.20, sampleCount: 0, isCourseSpecific: false };
  }

  // Check if we have history for this specific course
  if (targetCourse) {
    const courseSpecific = completed.filter(
      a => a.courseName.toLowerCase().trim() === targetCourse.toLowerCase().trim()
    );

    if (courseSpecific.length >= 2) {
      const courseActual = courseSpecific.reduce((sum, a) => sum + (a.actualHours || 0), 0);
      const courseEst = courseSpecific.reduce((sum, a) => sum + a.estimatedHours, 0);
      const courseRatio = courseActual / courseEst;

      // Also compute overall global ratio
      const globalActual = completed.reduce((sum, a) => sum + (a.actualHours || 0), 0);
      const globalEst = completed.reduce((sum, a) => sum + a.estimatedHours, 0);
      const globalRatio = globalActual / globalEst;

      // Blend 70% course-specific + 30% global
      const blendedRatio = courseRatio * 0.7 + globalRatio * 0.3;
      return {
        ratio: Number(blendedRatio.toFixed(2)),
        sampleCount: courseSpecific.length,
        isCourseSpecific: true
      };
    }
  }

  // Fallback to overall global ratio
  const totalActual = completed.reduce((sum, a) => sum + (a.actualHours || 0), 0);
  const totalEst = completed.reduce((sum, a) => sum + a.estimatedHours, 0);
  const globalRatio = totalActual / Math.max(0.1, totalEst);

  return {
    ratio: Number(globalRatio.toFixed(2)),
    sampleCount: completed.length,
    isCourseSpecific: false
  };
}

/**
 * Predicts realistic completion hours given estimated hours, complexity, and history
 */
export function predictWorkTime(
  estimatedHours: number,
  complexity: ComplexityLevel,
  courseName: string,
  historicalAssignments: Assignment[]
): PredictiveEngineResult {
  const safeEst = Math.max(0.2, Number(estimatedHours) || 1);
  const { ratio, sampleCount, isCourseSpecific } = calculateHistoricalEfficiencyRatio(
    historicalAssignments,
    courseName
  );

  const complexityInfo = COMPLEXITY_MULTIPLIERS[complexity] || COMPLEXITY_MULTIPLIERS[3];
  const complexityFactor = complexityInfo.factor;

  // Composite calculation: Estimated * Historical Ratio * Complexity Adjustment
  const rawPredicted = safeEst * ratio * complexityFactor;
  const predictedHours = Number(Math.max(0.2, rawPredicted).toFixed(1));
  const differenceHours = Number((predictedHours - safeEst).toFixed(1));

  // Determine confidence score based on sample history
  const confidenceScore = Math.min(0.96, Math.max(0.60, 0.65 + sampleCount * 0.05));

  // Formulate transparent human explanation
  let explanation = '';
  if (sampleCount === 0) {
    explanation = `Baseline cold-start: calibrated using initial ${Math.round(ratio * 100)}% pacing and Level ${complexity} factor (${complexityFactor}x).`;
  } else if (isCourseSpecific) {
    explanation = `Calibrated from ${sampleCount} past ${courseName} assignments (${ratio}x ratio) + Level ${complexity} complexity (${complexityFactor}x).`;
  } else {
    explanation = `Calibrated from ${sampleCount} completed assignments (global ${ratio}x pace) + Level ${complexity} complexity (${complexityFactor}x).`;
  }

  return {
    predictedHours,
    efficiencyRatio: ratio,
    complexityFactor,
    differenceHours,
    confidenceScore,
    explanation
  };
}
