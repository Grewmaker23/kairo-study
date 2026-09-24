import { Assignment, GlobalAnalytics } from '../types/assignment';

export function calculateGlobalAnalytics(assignments: Assignment[]): GlobalAnalytics {
  const totalAssignments = assignments.length;
  const activeCount = assignments.filter(a => a.status === 'in_progress' || a.status === 'upcoming').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed');
  const completedCount = completedAssignments.length;

  let totalEstimatedHours = 0;
  let totalActualHours = 0;
  let totalMarksEarned = 0;
  let totalMaxMarks = 0;

  for (const asg of completedAssignments) {
    if (asg.estimatedHours > 0 && asg.actualHours && asg.actualHours > 0) {
      totalEstimatedHours += asg.estimatedHours;
      totalActualHours += asg.actualHours;
    }
    if (typeof asg.marksReceived === 'number' && typeof asg.maxMarks === 'number' && asg.maxMarks > 0) {
      totalMarksEarned += asg.marksReceived;
      totalMaxMarks += asg.maxMarks;
    }
  }

  // Also count active assignments' logged actual hours
  for (const asg of assignments) {
    if (asg.status !== 'completed' && asg.actualHours && asg.actualHours > 0) {
      totalActualHours += asg.actualHours;
    }
  }

  // Efficiency ratio: Actual / Estimated. If actual = 4 and est = 3, ratio = 1.33
  // Accuracy %: if user estimated 4h and took 4h, accuracy is 100%. If took 5h, 4/5 = 80%.
  const overallEfficiencyRatio = totalEstimatedHours > 0 && totalActualHours > 0
    ? Number((totalActualHours / totalEstimatedHours).toFixed(2))
    : 1.15;

  const averageAccuracyPercent = totalActualHours > 0 && totalEstimatedHours > 0
    ? Math.min(100, Math.round((totalEstimatedHours / totalActualHours) * 100))
    : 85;

  const marksPercentage = totalMaxMarks > 0
    ? Number(((totalMarksEarned / totalMaxMarks) * 100).toFixed(1))
    : 0;

  return {
    totalAssignments,
    activeCount,
    completedCount,
    overallEfficiencyRatio,
    averageAccuracyPercent,
    totalEstimatedHours: Number(totalEstimatedHours.toFixed(1)),
    totalActualHours: Number(totalActualHours.toFixed(1)),
    totalMarksEarned,
    totalMaxMarks,
    marksPercentage
  };
}

export function formatDeadlineCountdown(deadlineStr: string): {
  text: string;
  status: 'overdue' | 'urgent' | 'warning' | 'normal';
  hoursRemaining: number;
} {
  const deadline = new Date(deadlineStr).getTime();
  const now = Date.now();
  const diffMs = deadline - now;
  const hours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    const overdueHours = Math.abs(hours);
    if (overdueHours < 24) {
      return { text: `Overdue by ${overdueHours}h`, status: 'overdue', hoursRemaining: hours };
    }
    const overdueDays = Math.floor(overdueHours / 24);
    return { text: `Overdue by ${overdueDays}d`, status: 'overdue', hoursRemaining: hours };
  }

  if (hours < 12) {
    const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return { text: `Due in ${mins}m`, status: 'urgent', hoursRemaining: hours };
  }

  if (hours < 24) {
    return { text: `Due in ${hours}h`, status: 'urgent', hoursRemaining: hours };
  }

  if (hours < 48) {
    return { text: `Due in 1 day`, status: 'warning', hoursRemaining: hours };
  }

  const days = Math.floor(hours / 24);
  return { text: `Due in ${days} days`, status: 'normal', hoursRemaining: hours };
}

export function formatStopwatchTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export async function copyAssignmentRequirements(asg: Assignment): Promise<boolean> {
  const formattedText = `### ${asg.courseName} — ${asg.title}
**Target Deadline:** ${new Date(asg.deadline).toLocaleString()}
**Complexity Level:** ${asg.complexity}/5
**Estimated Effort:** ${asg.estimatedHours} hrs | **AI Predicted:** ${asg.predictedHours} hrs

#### Detailed Requirements & Rubric:
${asg.requirements || 'No specific rubrics provided.'}
`;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(formattedText);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to copy requirements:', err);
    return false;
  }
}
