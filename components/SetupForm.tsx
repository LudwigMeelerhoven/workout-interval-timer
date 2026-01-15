import React, { useState } from 'react';
import { WorkoutConfig } from '../types';
import { Play, Dumbbell, Repeat } from 'lucide-react';

interface SetupFormProps {
  onStart: (config: WorkoutConfig) => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ onStart }) => {
  const [exercises, setExercises] = useState(8);
  const [rounds, setRounds] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ exercises, rounds });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-6">
      <div className="w-full max-w-md bg-neutral-800 rounded-3xl p-8 shadow-2xl border border-neutral-700">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Workout Timer
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-neutral-300">
              <Dumbbell className="w-5 h-5 text-green-500" />
              Exercises per Round
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="20"
                value={exercises}
                onChange={(e) => setExercises(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <span className="text-2xl font-bold text-green-400 w-12 text-center">{exercises}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-neutral-300">
              <Repeat className="w-5 h-5 text-blue-500" />
              Total Rounds
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-2xl font-bold text-blue-400 w-12 text-center">{rounds}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-green-900/50"
          >
            <Play className="w-6 h-6 fill-current" />
            Start Workout
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupForm;
