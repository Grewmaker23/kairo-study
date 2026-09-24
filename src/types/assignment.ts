export type ComplexityLevel = 1 | 2 | 3 | 4 | 5;

export type AssignmentStatus = 'upcoming' | 'in_progress' | 'completed';

export interface Assignment {
  id: string;
  courseName: string; // e.g. "CS301 - Operating Systems"
  title: string; // e.g. "Virtual Memory Paging Simulator"
  requirements: string; // Detailed rubrics / instructions
  deadline: string; // ISO string or YYYY-MM-DDTHH:mm
  estimatedHours: number; // User estimate in decimal hours (e.g. 3.5)
  complexity: ComplexityLevel; // 1 to 5
  status: AssignmentStatus;
  
  // Predictive Engine Outputs
  predictedHours: number; // AI calculated realistic duration
  predictionExplanation: string; // Explanation of how complexity & history influenced the prediction
  
  // Real-time Experiment & Workflow Tracker
  actualHours?: number; // Captured via timer or manual entry
  timerSecondsElapsed?: number; // Live stopwatch seconds
  isTimerRunning?: boolean;
  timerStartedAt?: number; // timestamp
  
  // Grading & Academic Evaluation
  marksReceived?: number; // e.g. 92
  maxMarks?: number; // e.g. 100
  gradedDate?: string;
  
  createdAt: number;
  completedAt?: number;
}

export interface PredictiveEngineResult {
  predictedHours: number;
  efficiencyRatio: number;
  complexityFactor: number;
  differenceHours: number;
  confidenceScore: number;
  explanation: string;
}

export interface GlobalAnalytics {
  totalAssignments: number;
  activeCount: number;
  completedCount: number;
  overallEfficiencyRatio: number; // Average Actual / Estimated
  averageAccuracyPercent: number; // 100 / Ratio
  totalEstimatedHours: number;
  totalActualHours: number;
  totalMarksEarned: number;
  totalMaxMarks: number;
  marksPercentage: number; // Earned / Max * 100
}
