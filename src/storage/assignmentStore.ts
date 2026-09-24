import { Assignment } from '../types/assignment';

const STORAGE_KEY = 'assignment_efficiency_tracker_v2';

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  // 1. Active Workflow / In Progress
  {
    id: 'asg-active-1',
    courseName: 'CS301 - Operating Systems',
    title: 'Virtual Memory Paging & Replacement Simulator',
    requirements: `1. Implement LRU, FIFO, and Optimal page replacement algorithms in C.
2. Must handle 10,000 memory traces from real benchmark dumps.
3. Zero memory leaks (valgrind --leak-check=full).
4. Plot page fault rates vs physical frame allocation (16 to 128 frames).
Rubric: Correctness (50%), Memory Safety (20%), Performance (15%), Analysis PDF (15%).`,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(), // 28 hours from now
    estimatedHours: 4.5,
    complexity: 4,
    status: 'in_progress',
    predictedHours: 5.6,
    predictionExplanation: 'Calibrated from past CS301 tasks (1.25x efficiency ratio) + Level 4 complexity multiplier (1.22x).',
    actualHours: 2.2,
    timerSecondsElapsed: 7920, // 2h 12m
    isTimerRunning: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 48
  },
  {
    id: 'asg-active-2',
    courseName: 'MATH240 - Linear Algebra',
    title: 'Singular Value Decomposition (SVD) Image Compression',
    requirements: `Complete textbook exercise 7.4 (problems 8-22).
Derive Moore-Penrose pseudoinverse proofs.
Write Python script to compress sample 4K grayscale portrait at k=5, 20, 50 singular values.
Submit PDF write-up with relative Frobenius norm error graphs.`,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 52).toISOString(), // 52 hours
    estimatedHours: 3.0,
    complexity: 3,
    status: 'in_progress',
    predictedHours: 3.6,
    predictionExplanation: 'Calibrated from past Math problem sets (1.18x ratio) + Level 3 standard complexity.',
    actualHours: 1.0,
    timerSecondsElapsed: 3600, // 1h
    isTimerRunning: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24
  },

  // 2. Upcoming Assignments
  {
    id: 'asg-upcoming-1',
    courseName: 'PHYS201 - Electromagnetism',
    title: 'Maxwell Equations & Waveguide Boundary Value Problems',
    requirements: `Solve cylindrical waveguide propagation modes (TE11 and TM01).
Calculate cutoff frequencies and group velocities.
Plot electric and magnetic field vector topologies using matplotlib.`,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(), // 4 days
    estimatedHours: 4.0,
    complexity: 4,
    status: 'upcoming',
    predictedHours: 5.1,
    predictionExplanation: 'Calibrated using historical physics lab ratio (1.22x) + Level 4 multi-part multiplier.',
    timerSecondsElapsed: 0,
    isTimerRunning: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 12
  },
  {
    id: 'asg-upcoming-2',
    courseName: 'BIO105 - Molecular Genetics',
    title: 'CRISPR-Cas9 Off-Target Analysis & Literature Review',
    requirements: `Review 3 peer-reviewed 2024 Nature papers on high-fidelity Cas9 variants.
Compare guide RNA specificity and cleavage kinetics.
Write structured 1,200 word critical synthesis report according to APA 7th guidelines.`,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 160).toISOString(), // 6.5 days
    estimatedHours: 3.5,
    complexity: 2,
    status: 'upcoming',
    predictedHours: 3.3,
    predictionExplanation: 'Calibrated using fast reading pace (0.95x ratio) + Level 2 moderate complexity.',
    timerSecondsElapsed: 0,
    isTimerRunning: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 8
  },

  // 3. Completed & Graded History
  {
    id: 'asg-completed-1',
    courseName: 'CS301 - Operating Systems',
    title: 'Multi-threaded Producer-Consumer Semaphore Queue',
    requirements: `Implement thread-safe circular buffer with POSIX mutexes and condition variables.
Prevent deadlocks and race conditions.`,
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    estimatedHours: 3.0,
    complexity: 3,
    status: 'completed',
    predictedHours: 3.6,
    predictionExplanation: 'Historical estimate.',
    actualHours: 3.8, // Took slightly longer
    marksReceived: 96,
    maxMarks: 100,
    gradedDate: '2026-09-18',
    createdAt: Date.now() - 1000 * 60 * 60 * 180,
    completedAt: Date.now() - 1000 * 60 * 60 * 120
  },
  {
    id: 'asg-completed-2',
    courseName: 'MATH240 - Linear Algebra',
    title: 'Gram-Schmidt Orthogonalization & QR Factorization',
    requirements: `Complete proof assignments 5.1 through 5.4.
Demonstrate column space decomposition and projection matrices.`,
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
    estimatedHours: 2.5,
    complexity: 3,
    status: 'completed',
    predictedHours: 2.9,
    predictionExplanation: 'Historical estimate.',
    actualHours: 3.2,
    marksReceived: 48,
    maxMarks: 50,
    gradedDate: '2026-09-15',
    createdAt: Date.now() - 1000 * 60 * 60 * 250,
    completedAt: Date.now() - 1000 * 60 * 60 * 200
  },
  {
    id: 'asg-completed-3',
    courseName: 'PHYS201 - Electromagnetism',
    title: 'RLC Circuit Resonance & Fourier Filter Lab Report',
    requirements: `Analyze oscilloscope frequency response traces from experimental bench.
Compute Q-factor and bandwidth damping.`,
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 300).toISOString(),
    estimatedHours: 4.0,
    complexity: 4,
    status: 'completed',
    predictedHours: 5.0,
    predictionExplanation: 'Historical estimate.',
    actualHours: 4.6,
    marksReceived: 92,
    maxMarks: 100,
    gradedDate: '2026-09-11',
    createdAt: Date.now() - 1000 * 60 * 60 * 350,
    completedAt: Date.now() - 1000 * 60 * 60 * 300
  }
];

export class AssignmentStore {
  static getAssignments(): Assignment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ASSIGNMENTS));
        return INITIAL_ASSIGNMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  }

  static saveAssignments(assignments: Assignment[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error('Failed to save assignments:', e);
    }
  }

  static resetToDefault(): Assignment[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ASSIGNMENTS));
    return INITIAL_ASSIGNMENTS;
  }
}
