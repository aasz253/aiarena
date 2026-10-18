import React from 'react';
import { 
  Clock, 
  HelpCircle, 
  Cpu,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { Discipline, Difficulty, GameMode } from '../../types';
import { NexusState } from '../../services/nexusAi';
import { NexusNeuralCore } from './NexusNeuralCore';
import { sounds } from '../../services/sound';

interface MatchHUDProps {
  discipline: Discipline;
  mode: GameMode;
  difficulty: Difficulty;
  currentRound: number;
  totalRounds: number;
  playerScore: number;
  nexusScore: number;
  timeRemaining: number;
  timeLimit: number;
  nexusState: NexusState;
  onGetHint: () => void;
  hintLoading: boolean;
  activeHint: string | null;
}

export const MatchHUD: React.FC<MatchHUDProps> = ({
  discipline,
  mode,
  difficulty,
  currentRound,
  totalRounds,
  playerScore,
  nexusScore,
  timeRemaining,
  timeLimit,
  nexusState,
  onGetHint,
  hintLoading,
  activeHint
}) => {
  const timePercent = Math.max(0, Math.min(100, (timeRemaining / timeLimit) * 100));
  const isUrgent = timeRemaining <= 15;

  return (
    <div className="w-full bg-[#07090e]/95 border-b border-slate-800/90 backdrop-blur-xl sticky top-16 z-30 px-3 py-2.5 sm:px-6">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Left: Sector & Round info */}
        <div className="flex items-center justify-between md:justify-start gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-sky-400 font-bold uppercase">{discipline}</span>
            <span aria-hidden="true" className="text-slate-600">/</span>
            <span className="capitalize text-slate-400">{mode}</span>
            <span aria-hidden="true" className="text-slate-600">/</span>
            <span className="text-violet-400 font-semibold">{difficulty}</span>
          </div>
          
          <div className="text-xs font-mono text-slate-400">
            Round <span className="font-bold text-white tabular-nums">{currentRound}</span> of <span className="tabular-nums">{totalRounds}</span>
          </div>
        </div>

        {/* Center: Live Timer and Scores with Versus presentation */}
        <div className="flex items-center justify-between md:justify-center gap-4 sm:gap-8 bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-slate-800/80">
          
          {/* Player Score */}
          <div className="text-right">
            <span className="block text-[10px] uppercase font-mono text-slate-400">Operator</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums">
              {playerScore}
            </span>
          </div>

          {/* Central Timer with progress ring bar */}
          <div className="flex flex-col items-center min-w-[100px] sm:min-w-[120px]">
            <div className={`flex items-center gap-1.5 font-mono text-base sm:text-lg font-bold tabular-nums ${
              isUrgent ? 'text-rose-400 animate-pulse' : 'text-sky-400'
            }`}>
              <Clock className="h-4 w-4" />
              <span>{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800">
              <div 
                className={`h-full transition-all duration-1000 ${
                  isUrgent ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-sky-500 shadow-[0_0_6px_#0284c7]'
                }`}
                style={{ width: `${timePercent}%` }}
              />
            </div>
          </div>

          {/* NEXUS Score */}
          <div className="text-left">
            <span className="block text-[10px] uppercase font-mono text-violet-400">NEXUS AI</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-violet-300 tabular-nums">
              {nexusScore}
            </span>
          </div>

        </div>

        {/* Right: AI Rival Telemetry & Hint Trigger */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          
          {/* NEXUS Neural Core Mini Status */}
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <NexusNeuralCore 
              state={nexusState} 
              difficulty={difficulty} 
              size="sm" 
              showTelemetry={false} 
            />
            <div className="w-24 sm:w-28">
              <div className="flex justify-between text-[10px] font-mono mb-0.5">
                <span className="text-violet-300 truncate font-bold">NEXUS</span>
                <span className="text-slate-400 tabular-nums">{nexusState.progressPercent}%</span>
              </div>
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-500 transition-all duration-300 shadow-[0_0_6px_#8b5cf6]" 
                  style={{ width: `${nexusState.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tactical Hint Trigger */}
          <button
            onClick={() => {
              sounds.click();
              onGetHint();
            }}
            disabled={hintLoading}
            title="Request Tactical Intelligence"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors shrink-0 cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Hint</span>
          </button>
        </div>

      </div>

      {/* Active Hint Banner if toggled */}
      {activeHint && (
        <div className="mx-auto max-w-7xl mt-2 px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs flex items-start gap-2 shadow-lg">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold mr-1">Tactical Intel:</span>
            {activeHint}
          </div>
        </div>
      )}
    </div>
  );
};
