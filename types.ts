export interface WorkoutConfig {
  exercises: number;
  rounds: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export type Phase = 'work' | 'rest' | 'get-ready';

export interface TimerState {
  status: TimerStatus;
  currentRound: number;
  currentExercise: number;
  timeLeft: number; // Seconds displayed on the clock
  phase: Phase;
  totalExercises: number;
  totalRounds: number;
}
