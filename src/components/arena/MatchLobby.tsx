import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Cpu, 
  ShieldCheck, 
  Bug, 
  Terminal, 
  ArrowLeft,
  Sparkles,
  Trophy,
  Swords,
  Gauge
} from 'lucide-react';
import { Discipline, GameMode, Difficulty, PlayerProfile } from '../../types';
import { sounds } from '../../services/sound';
import { NexusNeuralCore } from './NexusNeuralCore';

interface MatchLobbyProps {
  profile: PlayerProfile;
  initialDiscipline?: Discipline;
  initialMode?: GameMode;
  onStartMatch: (mode: GameMode, discipline: Discipline | 'All', difficulty: Difficulty) => void;
  onCancel: () => void;
}

export const MatchLobby: React.FC<MatchLobbyProps> = ({
  profile,
  initialDiscipline = 'DevSecOps',
  initialMode = 'quick',
  onStartMatch,
  onCancel
}) => {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [discipline, setDiscipline] = useState<Discipline>(initialDiscipline);
  const [difficulty, setDifficulty] = useState<Difficulty>('analyst');
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: number;
    if (countdown !== null && countdown > 0) {
      sounds.countdownBeep(false);
      timer = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      sounds.countdownBeep(true);
      sounds.matchStart();
      onStartMatch(mode, mode === 'gauntlet' ? 'All' : discipline, difficulty);
    }
    return () => clearTimeout(timer);
  }, [countdown, mode, discipline, difficulty, onStartMatch]);

  const handleLaunch = () => {
    sounds.click();
    setCountdown(3);
  };

  const getDisciplineIcon = (d: Discipline) => {
    switch (d) {
      case 'DevSecOps': return <Cpu className="h-4 w-4 text-sky-400" />;
      case 'Cybersecurity': return <ShieldCheck className="h-4 w-4 text-indigo-400" />;
      case 'Malware': return <Bug className="h-4 w-4 text-violet-400" />;
      case 'Coding': return <Terminal className="h-4 w-4 text-emerald-400" />;
    }
  };

  if (countdown !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e]/95 backdrop-blur-xl">
        <div className="text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-4 animate-pulse">
            Establishing Neural Arena Link...
          </div>
          <div className="text-8xl sm:text-9xl font-black font-mono text-white tracking-tighter drop-shadow-[0_0_50px_rgba(14,165,233,0.5)]">
            {countdown === 0 ? 'ENGAGE' : countdown}
          </div>
          <p className="text-sm text-slate-400 font-mono mt-4">
            {mode === 'gauntlet' ? 'Cross-Discipline Gauntlet: Round 1 Initiating' : `${discipline} sector active`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => {
            sounds.click();
            onCancel();
          }}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Arena Hub</span>
        </button>
        <span className="text-xs font-mono text-slate-500 uppercase">Matchmaking Protocol 2026.4</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Competition Setup */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
              Competition Lobby
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure parameters, select discipline, and calibrate NEXUS AI rival telemetry.
            </p>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
              Select Competition Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'quick', title: 'Quick Match', desc: '3 Rounds in chosen sector', icon: Swords },
                { id: 'ranked', title: 'Ranked Battle', desc: 'Rated Elo competition', icon: Trophy },
                { id: 'gauntlet', title: 'Cross Gauntlet', desc: 'All 4 disciplines', icon: Sparkles }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.click();
                      setMode(item.id as GameMode);
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isSelected 
                        ? 'border-sky-500 bg-sky-500/10 text-white shadow-sm' 
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold uppercase tracking-wider">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discipline Selector (hidden if Gauntlet is selected) */}
          {mode !== 'gauntlet' ? (
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
                Technical Sector
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['DevSecOps', 'Cybersecurity', 'Malware', 'Coding'] as Discipline[]).map(d => {
                  const isSelected = discipline === d;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        sounds.click();
                        setDiscipline(d);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'border-sky-500 bg-sky-500/10 text-white shadow-sm' 
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {getDisciplineIcon(d)}
                      <span className="text-xs font-bold">{d}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-950/20">
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider block mb-1">
                4-Stage Gauntlet Sequence Activated
              </span>
              <p className="text-xs text-slate-300">
                Round 1: AI DevSecOps · Round 2: Cybersecurity · Round 3: Malware Analysis · Round 4: Coding Challenges.
              </p>
            </div>
          )}

          {/* Difficulty Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-400 uppercase flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                <span>NEXUS AI Rival Difficulty</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'rookie', title: 'Rookie', mult: '1.0x Score', desc: '65% Acc' },
                { id: 'analyst', title: 'Analyst', mult: '1.15x Score', desc: '82% Acc' },
                { id: 'expert', title: 'Expert', mult: '1.35x Score', desc: '92% Acc' },
                { id: 'elite', title: 'Elite', mult: '1.55x Score', desc: '98% Acc' }
              ].map(item => {
                const isSelected = difficulty === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.click();
                      setDifficulty(item.id as Difficulty);
                    }}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      isSelected 
                        ? 'border-sky-500 bg-sky-500/15 text-white' 
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold uppercase">{item.title}</span>
                    <span className="block text-[10px] font-mono text-sky-400 mt-0.5">{item.mult}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Rules & Scoring Breakdown */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 text-xs text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-300 uppercase font-mono block">Tournament Rules</span>
            <p>· Correct solutions award 100–180 base points + difficulty multiplier.</p>
            <p>· Uncovering hidden evidence or forensic IOCs grants up to 30 bonus points.</p>
            <p>· Capped time bonus (up to 30 pts) rewards quick reasoning without sacrificing security.</p>
            <p>· Unsafe security decisions incur a 25 point penalty.</p>
          </div>
        </div>

        {/* Right Column: Head-to-Head Versus Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="text-center pb-4 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-sky-400 tracking-wider">
                Sanctioned Matchup
              </span>
            </div>

            {/* Head to Head Visual */}
            <div className="py-6 flex items-center justify-between gap-4">
              {/* Human Player */}
              <div className="text-center flex-1">
                <div className="mx-auto h-16 w-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl font-bold text-white mb-2 shadow-inner">
                  {profile.callsign.slice(0, 2).toUpperCase()}
                </div>
                <span className="block text-sm font-bold text-white truncate">{profile.callsign}</span>
                <span className="block text-xs text-slate-400 font-mono">{profile.rankName}</span>
                <span className="block text-xs text-sky-400 font-mono mt-0.5">{profile.arenaRating} Elo</span>
              </div>

              {/* VS Emblem */}
              <div className="flex flex-col items-center shrink-0">
                <span className="text-base font-black font-mono text-slate-600">VS</span>
              </div>

              {/* NEXUS AI */}
              <div className="text-center flex-1 flex flex-col items-center">
                <NexusNeuralCore
                  state={{
                    status: 'evaluating_vectors',
                    progressPercent: 100,
                    solved: false,
                    score: 0,
                    timeTaken: 0,
                    currentCommentary: 'Calibrated.'
                  }}
                  difficulty={difficulty}
                  size="md"
                  showTelemetry={false}
                />
                <span className="block text-sm font-bold text-white mt-1">NEXUS</span>
                <span className="block text-xs text-slate-400 font-mono capitalize">{difficulty}</span>
                <span className="block text-xs text-violet-400 font-mono mt-0.5">Synthetic Rival</span>
              </div>
            </div>

            {/* AI Rival Quote */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 italic mb-6">
              "My algorithmic inference latency is calibrated for {difficulty} tier. Prepare your defensive vectors."
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleLaunch}
            className="w-full py-4 text-sm font-bold uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.99] rounded-xl shadow-lg shadow-sky-950/50 transition-all flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Launch Competition</span>
          </button>
        </div>

      </div>
    </div>
  );
};
