import React from 'react';
import { 
  Play, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Bug, 
  Trophy, 
  Sparkles,
  ArrowRight,
  Zap,
  Activity
} from 'lucide-react';
import { PlayerProfile, Discipline } from '../../types';
import { sounds } from '../../services/sound';
import { NexusNeuralCore } from './NexusNeuralCore';

interface ArenaHeroProps {
  profile: PlayerProfile;
  onEnterArena: () => void;
  onSelectDiscipline: (discipline: Discipline) => void;
  onOpenPractice: () => void;
  onOpenGauntlet: () => void;
}

export const ArenaHero: React.FC<ArenaHeroProps> = ({
  profile,
  onEnterArena,
  onSelectDiscipline,
  onOpenPractice,
  onOpenGauntlet
}) => {
  return (
    <div className="relative w-full overflow-hidden">
      
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 z-10">
        
        {/* Hero Section Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Left Column: Wordmark, Status & Primary CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2 space-y-6">
            <div>
              {/* Unboxed category metadata with separator */}
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-3">
                <span className="flex items-center gap-1.5 font-bold">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Sanctioned Esports League</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>Season 2026</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">Competitive Cyber Defense</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-sans text-balance leading-none">
                AI ARENA
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-violet-400 mt-2">
                  Human vs Machine
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed mt-4">
                "Outthink the Machine. Secure the Future." Engage synthetic rival NEXUS across high-stakes DevSecOps delivery pipelines, live SOC investigations, forensic malware triage labs, and algorithmic coding challenges.
              </p>
            </div>

            {/* Primary Action Button Cluster */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sounds.click();
                  onEnterArena();
                }}
                className="px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.99] rounded-xl shadow-lg shadow-sky-950/60 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 group cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current group-hover:translate-x-0.5 transition-transform" />
                <span>Enter the Arena</span>
              </button>

              <button
                onClick={() => {
                  sounds.click();
                  onOpenGauntlet();
                }}
                className="px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span>Cross-Discipline Gauntlet</span>
              </button>

              <button
                onClick={() => {
                  sounds.click();
                  onOpenPractice();
                }}
                className="px-4 py-3.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Practice Lab
              </button>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <span className="block text-xs uppercase text-slate-500 font-mono">Rank Tier</span>
                <span className="text-lg font-bold text-white font-mono">{profile.rankName}</span>
                <span className="text-xs text-slate-400">Tier {profile.rankTier}/10</span>
              </div>
              <div>
                <span className="block text-xs uppercase text-slate-500 font-mono">Arena Rating</span>
                <span className="text-lg font-bold text-sky-400 font-mono tabular-nums">{profile.arenaRating}</span>
                <span className="text-xs text-slate-400">Elo benchmark</span>
              </div>
              <div>
                <span className="block text-xs uppercase text-slate-500 font-mono">Win Streak</span>
                <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">{profile.stats.currentStreak}</span>
                <span className="text-xs text-slate-400">Best: {profile.stats.bestStreak}</span>
              </div>
              <div>
                <span className="block text-xs uppercase text-slate-500 font-mono">Accuracy</span>
                <span className="text-lg font-bold text-indigo-300 font-mono tabular-nums">{profile.stats.averageAccuracy}%</span>
                <span className="text-xs text-slate-400">{profile.stats.totalMatches} matches</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Stadium & AI Rival Box */}
          <div className="lg:col-span-5 relative flex flex-col justify-end min-h-[360px] rounded-2xl overflow-hidden border border-slate-800 bg-[#080d1a] shadow-2xl">
            {/* The generated high-fidelity arena visual */}
            <img
              src="/src/assets/images/arena_hero_cyberpunk_1792299930301.jpg"
              alt="AI Arena Stadium"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover opacity-75"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Measured gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent" />

            {/* Overlay card for AI Rival with Interactive Neural Core */}
            <div className="relative p-6 z-10">
              <div className="flex items-center gap-4 bg-[#0a0e1a]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800/90 shadow-xl">
                <NexusNeuralCore 
                  state={{
                    status: 'idle',
                    progressPercent: 100,
                    solved: false,
                    score: 0,
                    timeTaken: 0,
                    currentCommentary: 'Telemetry online.'
                  }} 
                  difficulty="Elite" 
                  size="md" 
                  showTelemetry={false} 
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white tracking-wide font-sans">NEXUS</span>
                    <span className="text-xs font-mono text-violet-400 uppercase font-bold">Autonomous AI Rival</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    "Adaptive heuristic models primed. Are your biological reflexes prepared for round one?"
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* The Four Technical Disciplines Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                Competition Disciplines
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose a technical sector to launch a targeted 3-round Quick Match against NEXUS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Discipline 1: AI DevSecOps */}
            <div 
              onClick={() => {
                sounds.click();
                onSelectDiscipline('DevSecOps');
              }}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:border-sky-400/50 transition-colors">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">4 Challenges</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  AI DevSecOps
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  CI/CD pipeline lockdown, unpinned action hashes, root container breakouts, Kubernetes admission policies, and LLM agent tool security.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-sky-400">
                <span>Play Discipline</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Discipline 2: Cybersecurity */}
            <div 
              onClick={() => {
                sounds.click();
                onSelectDiscipline('Cybersecurity');
              }}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:border-indigo-400/50 transition-colors">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">4 Challenges</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Cybersecurity & SOC
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Executive spear-phishing forensics, SIEM event logs (PsExec / Pass-the-Hash), DMZ firewall segmentation, and Cloud IAM privilege escalation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-400">
                <span>Play Discipline</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Discipline 3: Malware Analysis */}
            <div 
              onClick={() => {
                sounds.click();
                onSelectDiscipline('Malware');
              }}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-violet-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:border-violet-400/50 transition-colors">
                    <Bug className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">4 Challenges</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                  Malware Analysis
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Shannon entropy spectra, PE header UPX packers, Win32 process injection decompilation, EDR process trees, and ransomware heuristics.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-violet-400">
                <span>Play Discipline</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Discipline 4: Coding Challenges */}
            <div 
              onClick={() => {
                sounds.click();
                onSelectDiscipline('Coding');
              }}
              className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:border-emerald-400/50 transition-colors">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">4 Challenges</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Coding Challenges
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  High-speed algorithmic port scan detectors, input sanitizers, policy-as-code Kubernetes admission validators, and JWT code reviews.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-emerald-400">
                <span>Play Discipline</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

        {/* Feature Banner: Cross-Discipline Gauntlet */}
        <div className="mt-8 p-6 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-slate-900/80 to-sky-950/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">The Signature Cross-Discipline Gauntlet</h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                4 consecutive rounds spanning AI DevSecOps, Cybersecurity, Malware, and Live Coding back-to-back. The ultimate test of human engineering vs synthetic AI.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.click();
              onOpenGauntlet();
            }}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Launch Gauntlet
          </button>
        </div>

      </div>
    </div>
  );
};
