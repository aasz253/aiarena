import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Cpu, 
  ShieldCheck, 
  Bug, 
  Terminal, 
  Lightbulb, 
  Play,
  RotateCcw
} from 'lucide-react';
import { Discipline, Challenge } from '../../types';
import { CHALLENGES } from '../../data/challenges';
import { DevSecOpsWorkspace } from '../workspace/DevSecOpsWorkspace';
import { CybersecurityWorkspace } from '../workspace/CybersecurityWorkspace';
import { MalwareWorkspace } from '../workspace/MalwareWorkspace';
import { CodingWorkspace } from '../workspace/CodingWorkspace';
import { sounds } from '../../services/sound';

interface PracticeLabViewProps {
  onBack: () => void;
}

export const PracticeLabView: React.FC<PracticeLabViewProps> = ({ onBack }) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | 'All'>('All');
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const filtered = selectedDiscipline === 'All' 
    ? CHALLENGES 
    : CHALLENGES.filter(c => c.discipline === selectedDiscipline);

  const getDisciplineIcon = (d: Discipline) => {
    switch (d) {
      case 'DevSecOps': return <Cpu className="h-4 w-4 text-sky-400" />;
      case 'Cybersecurity': return <ShieldCheck className="h-4 w-4 text-indigo-400" />;
      case 'Malware': return <Bug className="h-4 w-4 text-violet-400" />;
      case 'Coding': return <Terminal className="h-4 w-4 text-emerald-400" />;
    }
  };

  const handleLaunchPractice = (ch: Challenge) => {
    sounds.click();
    setActiveChallenge(ch);
    setShowExplanation(false);
    setLastFeedback(null);
  };

  const handlePracticeSubmit = (res: { isCorrect: boolean; evidenceFound: boolean }) => {
    if (res.isCorrect) {
      setLastFeedback("Excellent work! Solution validated and all defensive criteria satisfied.");
    } else {
      setLastFeedback("Solution failed one or more security or functional criteria. Inspect the expert explanation to understand the vulnerability vector.");
    }
    setShowExplanation(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={() => {
              sounds.click();
              if (activeChallenge) {
                setActiveChallenge(null);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{activeChallenge ? 'Return to Practice Catalog' : 'Return to Arena'}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
            Practice Simulation Lab
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-risk technical sandbox. Inspect vulnerabilities, retry attempts, and master real-world defensive architectures.
          </p>
        </div>

        {!activeChallenge && (
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
            {(['All', 'DevSecOps', 'Cybersecurity', 'Malware', 'Coding'] as (Discipline | 'All')[]).map(d => (
              <button
                key={d}
                onClick={() => {
                  sounds.click();
                  setSelectedDiscipline(d);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  selectedDiscipline === d ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* If an active challenge is open in practice */}
      {activeChallenge ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              {getDisciplineIcon(activeChallenge.discipline)}
              <span className="text-xs font-mono uppercase text-white font-bold">{activeChallenge.title}</span>
              <span className="text-[11px] font-mono text-slate-400 capitalize">({activeChallenge.difficulty})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.click();
                  setShowExplanation(!showExplanation);
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                <span>{showExplanation ? 'Hide Explanation' : 'Inspect Explanation'}</span>
              </button>

              <button
                onClick={() => {
                  sounds.click();
                  handleLaunchPractice(activeChallenge);
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>

          {lastFeedback && (
            <div className={`p-4 rounded-xl border text-xs ${
              lastFeedback.includes('Excellent') 
                ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300' 
                : 'border-rose-500/50 bg-rose-950/30 text-rose-300'
            }`}>
              {lastFeedback}
            </div>
          )}

          {showExplanation && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-2 text-xs">
              <span className="font-bold font-mono text-sky-400 uppercase block">
                Technical Defense Rationale & Standards
              </span>
              <p className="text-slate-300 leading-relaxed">
                {activeChallenge.expertAnalysis}
              </p>
            </div>
          )}

          {/* Render appropriate workspace */}
          {activeChallenge.discipline === 'DevSecOps' && (
            <DevSecOpsWorkspace challenge={activeChallenge} onSubmit={handlePracticeSubmit} />
          )}
          {activeChallenge.discipline === 'Cybersecurity' && (
            <CybersecurityWorkspace challenge={activeChallenge} onSubmit={handlePracticeSubmit} />
          )}
          {activeChallenge.discipline === 'Malware' && (
            <MalwareWorkspace challenge={activeChallenge} onSubmit={handlePracticeSubmit} />
          )}
          {activeChallenge.discipline === 'Coding' && (
            <CodingWorkspace challenge={activeChallenge} onSubmit={handlePracticeSubmit} />
          )}
        </div>
      ) : (
        /* Challenge Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ch => (
            <div 
              key={ch.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getDisciplineIcon(ch.discipline)}
                    <span className="text-xs font-mono font-bold text-white">{ch.discipline}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                    {ch.difficulty}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{ch.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {ch.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">Target: {ch.targetArtifactName}</span>
                <button
                  onClick={() => handleLaunchPractice(ch)}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Practice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
