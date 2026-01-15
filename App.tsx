"use client";

import React, { useState } from 'react';
import SetupForm from './components/SetupForm';
import Timer from './components/Timer';
import { WorkoutConfig } from './types';
import { initAudio } from './utils/audio';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [config, setConfig] = useState<WorkoutConfig | null>(null);

  const handleStart = (newConfig: WorkoutConfig) => {
    // Initialize Audio Context on user interaction
    initAudio();
    setConfig(newConfig);
    setIsPlaying(true);
  };

  const handleExit = () => {
    setIsPlaying(false);
    setConfig(null);
  };

  return (
    <div className="font-sans antialiased text-neutral-900">
      {!isPlaying || !config ? (
        <SetupForm onStart={handleStart} />
      ) : (
        <Timer config={config} onExit={handleExit} />
      )}
    </div>
  );
};

export default App;