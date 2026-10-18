import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight, 
  Lightbulb,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Challenge, Discipline } from '../../types';
import { ScoreBreakdown } from '../../services/scoring';
import { sounds } from '../../services/sound';

interface RoundResultModalProps {
  round: number;
  totalRounds: number;
  challenge: Challenge;
  playerBreakdown: ScoreBreakdown;
  nexusScore: number;
  nexusTime: number;
  nexusCorrect: boolean;
  onNextRound: () => void;
}

export const RoundResultModal: React.FC<RoundResultModalProps> = ({
  round,
  totalRounds,
  challenge,
  playerBreakdown,
  nexusScore,
  nexusTime,
  nexusCorrect,
  onNextRound
}) => {
  const playerWon = playerBreakdown.totalScore > nexusScore;
  const isTie = playerBreakdown.totalScore === nexusScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090e]/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0a0e1a] p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="text-center pb-4 border-b border-slate-800">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500 block mb-1">
            Round {round} of {totalRounds} Telemetry Summary
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight font-sans ${
            playerWon ? 'text-emerald-400' : isTie ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {playerWon ? 'Round Secured' : isTie ? 'Round Contested (Draw)' : 'Round Conceded'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Challenge: {challenge.title} ({challenge.discipline})
          </p>
        </div>

        {/* Head-to-Head Comparison */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Player Box */}
          <div className={`p-4 rounded-xl border text-center ${
            playerWon ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/60'
          }`}>
            <span className="block text-xs font-mono uppercase text-slate-400 mb-1">Operator</span>
            <span className="text-3xl font-black font-mono text-white tabular-nums">
              {playerBreakdown.totalScore}
            </span>
            <div className="mt-2 text-xs font-mono">
              {playerBreakdown.accuracyPoints > 0 ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Solution Verified
                </span>
              ) : (
                <span className="text-rose-400 flex items-center justify-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Policy Breach
                </span>
              )}
            </div>
          </div>

          {/* NEXUS Box */}
          <div className={`p-4 rounded-xl border text-center ${
            !playerWon && !isTie ? 'border-violet-500/50 bg-violet-950/20' : 'border-slate-800 bg-slate-900/60'
          }`}>
            <span className="block text-xs font-mono uppercase text-violet-400 mb-1">NEXUS AI</span>
            <span className="text-3xl font-black font-mono text-violet-300 tabular-nums">
              {nexusScore}
            </span>
            <div className="mt-2 text-xs font-mono">
              {nexusCorrect ? (
                <span className="text-violet-300 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Computed ({nexusTime}s)
                </span>
              ) : (
                <span className="text-slate-500 flex items-center justify-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Heuristic Error
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Transparent Score Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs font-mono">
          <span className="text-slate-400 uppercase font-bold block mb-1">Score Matrix Breakdown</span>
          <div className="flex justify-between text-slate-300">
            <span>Base Correctness:</span>
            <span className="tabular-nums">+{playerBreakdown.accuracyPoints} pts</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Difficulty Multiplier ({playerBreakdown.difficultyMultiplier}x):</span>
            <span className="tabular-nums">+{playerBreakdown.difficultyBonus} pts</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Execution Speed Bonus:</span>
            <span className="tabular-nums">+{playerBreakdown.timeBonus} pts</span>
          </div>
          {playerBreakdown.evidenceBonus > 0 && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Deep Forensic Evidence Discovered:</span>
              <span className="tabular-nums">+{playerBreakdown.evidenceBonus} pts</span>
            </div>
          )}
          {playerBreakdown.penalties > 0 && (
            <div className="flex justify-between text-rose-400 font-bold">
              <span>Unsafe Security Penalty:</span>
              <span className="tabular-nums">-{playerBreakdown.penalties} pts</span>
            </div>
          )}
        </div>

        {/* Expert Educational Analysis */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold uppercase font-mono">
            <Lightbulb className="h-4 w-4" />
            <span>Cybersecurity Analysis & Defense Takeaways</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {challenge.expertAnalysis}
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            sounds.click();
            onNextRound();
          }}
          className="w-full py-4 text-xs font-bold uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{round < totalRounds ? `Proceed to Round ${round + 1}` : 'View Match Summary'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
};
