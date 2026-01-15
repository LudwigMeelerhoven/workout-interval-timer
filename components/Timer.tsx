"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TimerState, WorkoutConfig } from '../types';
import { playBeep } from '../utils/audio';
import ProgressBar from './ProgressBar';
import { Pause, Play, Square, Volume2 } from 'lucide-react';

interface TimerProps {
  config: WorkoutConfig;
  onExit: () => void;
}

const Timer: React.FC<TimerProps> = ({ config, onExit }) => {
  const [state, setState] = useState<TimerState>({
    status: 'running',
    currentRound: 1,
    currentExercise: 1,
    timeLeft: 45, // Initial start buffer
    phase: 'get-ready', // Start with a prep phase
    totalExercises: config.exercises,
    totalRounds: config.rounds,
  });

  // Use a ref to track if we've played sound for this second to avoid double triggers in React StrictMode
  // or simple re-renders.
  const lastSoundTick = useRef<number | null>(null);
  
  // Wake Lock Ref
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLock.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn(`${err instanceof Error ? err.name : 'Error'}, ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  useEffect(() => {
    requestWakeLock();
    return () => {
      if (wakeLock.current) {
        wakeLock.current.release();
      }
    };
  }, []);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running') return prev;

      const nextTime = prev.timeLeft - 1;
      let nextPhase = prev.phase;
      let nextExercise = prev.currentExercise;
      let nextRound = prev.currentRound;
      let nextStatus = prev.status;

      // --- Sound Logic ---
      // We trigger sound based on the value we just arrived at (nextTime)
      // or the specific transition points required.
      // Requirements:
      // 1. 40, 20, 10 -> 3-beep
      // 2. 0 -> 5-beep (high)
      
      const shouldPlayStandard = (nextTime === 40 || nextTime === 20 || nextTime === 10);
      const shouldPlayHigh = (nextTime === 0);

      // We only play if we haven't played for this second and phase combo yet
      // A simple timestamp check prevents rapid re-firing if tick was faster (though here it's 1s interval)
      const now = Date.now();
      if (!lastSoundTick.current || now - lastSoundTick.current > 800) {
         // Special handling for phase transitions where time might jump
         // If we are about to switch phases, we handle audio below separately if needed?
         // No, the requirement says "Alarm sound ringing AT 20, 10, 0".
         // The start at 40 is implied as a start beep.
         
         if (prev.phase === 'work') {
           if (shouldPlayStandard) playBeep('standard');
           if (shouldPlayHigh) playBeep('high');
         } else if (prev.phase === 'rest' || prev.phase === 'get-ready') {
           // When Rest (60-40) hits 40, it switches to Work.
           // The prompt says: "Next exercise starts at 40".
           // "The alarm sound at 40... is made as a three-beep sound."
           // So if we are at 41 going to 40, we play beep.
           if (nextTime === 40) playBeep('standard');
         }
         
         lastSoundTick.current = now;
      }

      // --- Phase Transition Logic ---
      
      // 1. Work Phase (40 -> 0)
      if (prev.phase === 'work') {
        if (nextTime < 0) {
          // Check if it's the last exercise of the last round
          if (prev.currentExercise === prev.totalExercises && prev.currentRound === prev.totalRounds) {
            return { ...prev, status: 'finished', timeLeft: 0 };
          }

          // Work finished. Switch to Rest.
          // Rest goes from 60 down to 40.
          nextPhase = 'rest';
          return { ...prev, phase: nextPhase, timeLeft: 60 };
        }
      } 
      
      // 2. Rest Phase (60 -> 40) OR Get Ready (45 -> 40)
      else if (prev.phase === 'rest' || prev.phase === 'get-ready') {
        if (nextTime < 40) {
          // Rest finished. Start next exercise or round.
          // Note: Rest ends at 40, so when we hit 39 (or mathematically pass 40), we switch.
          // Since we tick to 40, we play the sound. The NEXT tick would be 39. 
          // But we want to switch immediately when 40 happens to start the work countdown?
          // Actually, if we want the user to see "40" green, we switch *at* 40.
          
          nextPhase = 'work';
          
          // If we came from 'get-ready', we just start Exercise 1.
          // If we came from 'rest', we increment.
          if (prev.phase === 'rest') {
            nextExercise = prev.currentExercise + 1;
            if (nextExercise > prev.totalExercises) {
              nextExercise = 1;
              nextRound = prev.currentRound + 1;
              if (nextRound > prev.totalRounds) {
                 return { ...prev, status: 'finished', timeLeft: 0 };
              }
            }
          }
          
          // Switch to Work at 40
          return { 
            ...prev, 
            phase: 'work', 
            timeLeft: 40, 
            currentExercise: nextExercise,
            currentRound: nextRound 
          };
        }
      }

      return { ...prev, timeLeft: nextTime };
    });
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.status === 'running') {
      interval = setInterval(tick, 1000);
    }
    return () => clearInterval(interval);
  }, [state.status, tick]);

  const togglePause = () => {
    setState(prev => ({ ...prev, status: prev.status === 'running' ? 'paused' : 'running' }));
  };

  // Visual Helpers
  const isWork = state.phase === 'work';
  const isGetReady = state.phase !== 'work' && state.timeLeft <= 45 && state.timeLeft >= 40;
  
  // Background Color
  // Green for Work (40-0)
  // Red for Rest (60-40)
  // Maybe Orange for Get Ready?
  let bgClass = "bg-green-600";
  if (!isWork) bgClass = "bg-red-600";

  // Text status
  let statusText = "WORK";
  if (state.phase === 'rest') statusText = "REST";
  if (isGetReady) statusText = "GET READY!";
  if (state.status === 'finished') {
    statusText = "DONE!";
    bgClass = "bg-blue-600";
  } else if (state.status === 'paused') {
    statusText = "PAUSED";
    bgClass = "bg-neutral-800";
  }

  return (
    <div className={`flex flex-col h-screen transition-colors duration-500 ${bgClass} text-white`}>
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 bg-black/20 backdrop-blur-sm">
        <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Square className="w-6 h-6 fill-white" />
        </button>
        <div className="flex items-center gap-2 font-bold text-sm tracking-widest opacity-80">
          <Volume2 className="w-4 h-4" />
          <span>ON</span>
        </div>
      </div>

      {/* Main Display */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Status Label */}
        <h2 className="text-[12vw] sm:text-6xl font-black italic tracking-tighter uppercase mb-4 opacity-90 animate-pulse">
          {statusText}
        </h2>
        
        {/* Main Timer */}
        {state.status !== 'finished' && (
          <div className="text-[35vw] sm:text-[12rem] leading-none font-mono font-bold tabular-nums tracking-tight drop-shadow-lg">
             {state.timeLeft}
          </div>
        )}

        {/* Finished State */}
        {state.status === 'finished' && (
          <div className="text-4xl font-bold mt-8">
             Great Job!
          </div>
        )}
      </div>

      {/* Bottom Controls & Progress */}
      <div className="bg-black/30 backdrop-blur-md p-6 pb-10 rounded-t-3xl">
        <div className="max-w-md mx-auto space-y-8">
          
          {/* Progress Bars */}
          <div className="space-y-4">
            <ProgressBar 
              label="Exercise" 
              current={state.currentExercise} 
              total={state.totalExercises} 
              colorClass="bg-green-400" 
            />
            <ProgressBar 
              label="Round" 
              current={state.currentRound} 
              total={state.totalRounds} 
              colorClass="bg-blue-400" 
            />
          </div>

          {/* Control Button */}
          {state.status !== 'finished' && (
            <button
              onClick={togglePause}
              className="w-full bg-white text-neutral-900 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all active:scale-95 shadow-xl"
            >
              {state.status === 'running' ? (
                <>
                  <Pause className="w-8 h-8 fill-current" />
                  <span className="text-xl">PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-8 h-8 fill-current" />
                  <span className="text-xl">RESUME</span>
                </>
              )}
            </button>
          )}

          {state.status === 'finished' && (
             <button
             onClick={onExit}
             className="w-full bg-white text-neutral-900 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all active:scale-95 shadow-xl"
           >
             <span className="text-xl">NEW WORKOUT</span>
           </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timer;