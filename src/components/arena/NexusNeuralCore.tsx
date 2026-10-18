import React from 'react';
import { Cpu, Activity, ShieldAlert, Sparkles } from 'lucide-react';
import { NexusState } from '../../services/nexusAi';

interface NexusNeuralCoreProps {
  state: NexusState;
  difficulty: string;
  size?: 'sm' | 'md' | 'lg';
  showTelemetry?: boolean;
}

export const NexusNeuralCore: React.FC<NexusNeuralCoreProps> = ({
  state,
  difficulty,
  size = 'md',
  showTelemetry = true
}) => {
  const isBusy = state.status !== 'idle' && state.status !== 'submitted';
  const isSubmitted = state.status === 'submitted';

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-28 w-28'
  }[size];

  return (
    <div className="flex flex-col items-center">
      
      {/* Central Holographic Nexus Emblem with Animated Cyber Orbitals */}
      <div className={`relative ${sizeClasses} flex items-center justify-center`}>
        
        {/* Outer Rotating Synthetic Orbital */}
        <div 
          className={`absolute inset-0 rounded-full border border-sky-400/30 border-dashed ${
            isBusy ? 'animate-spin' : ''
          }`} 
          style={{ animationDuration: isBusy ? '4s' : '18s' }} 
        />

        {/* Middle Violet Resonator Ring */}
        <div 
          className={`absolute inset-1 rounded-full border border-violet-500/40 ${
            isBusy ? 'animate-pulse' : ''
          }`} 
        />

        {/* Inner Core Glowing Orb & Face Shield */}
        <div className="relative h-[82%] w-[82%] rounded-xl overflow-hidden border border-sky-500/50 bg-[#080d1a] shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center">
          <img
            src="/src/assets/images/nexus_ai_avatar_1792299930019.jpg"
            alt="NEXUS AI Face Core"
            referrerPolicy="no-referrer"
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isBusy ? 'scale-105 filter brightness-110' : 'filter brightness-90'
            }`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Holographic Scanline Overlay on face */}
          <div className="absolute inset-0 scanline-overlay opacity-50 pointer-events-none" />

          {/* Status Indicator Icon */}
          <div className="absolute bottom-1 right-1">
            {isSubmitted ? (
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            ) : isBusy ? (
              <div className="h-2.5 w-2.5 rounded-full bg-violet-400 animate-ping shadow-[0_0_8px_#a78bfa]" />
            ) : (
              <div className="h-2.5 w-2.5 rounded-full bg-sky-400/80" />
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Readout */}
      {showTelemetry && (
        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-bold text-white font-mono tracking-wider">NEXUS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-950/60 border border-violet-800/40 text-violet-300 uppercase">
              {difficulty}
            </span>
          </div>

          {/* Micro Telemetry Bar */}
          <div className="mt-1 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="h-2.5 w-2.5 text-sky-400" />
              <span>{isBusy ? '400FLOPS' : 'IDLE'}</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-violet-300 font-bold tabular-nums">
              {state.progressPercent}% Vector
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
