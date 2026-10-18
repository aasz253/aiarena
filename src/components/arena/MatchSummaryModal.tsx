import React from 'react';
import { 
  Trophy, 
  RotateCcw, 
  ArrowLeft, 
  Award, 
  TrendingUp, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import { MatchRecord, PlayerProfile, Achievement } from '../../types';
import { sounds } from '../../services/sound';

interface MatchSummaryModalProps {
  record: MatchRecord;
  profile: PlayerProfile;
  rankUp: boolean;
  newAchievements: Achievement[];
  onPlayAgain: () => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  record,
  profile,
  rankUp,
  newAchievements,
  onPlayAgain,
  onHome,
  onLeaderboard
}) => {
  const isVictory = record.result === 'victory';

  React.useEffect(() => {
    if (isVictory) {
      sounds.victory();
    }
  }, [isVictory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090e]/95 backdrop-blur-xl overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0a0e1a] p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Emblem & Title */}
        <div>
          <div className={`mx-auto h-20 w-20 rounded-2xl flex items-center justify-center border mb-3 ${
            isVictory 
              ? 'bg-sky-500/10 border-sky-500/40 text-sky-400 shadow-xl shadow-sky-950/60' 
              : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
          }`}>
            <Trophy className="h-10 w-10" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-slate-500 block">
            Competitive Match Concluded
          </span>
          <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight font-sans mt-1 ${
            isVictory ? 'text-white' : 'text-slate-300'
          }`}>
            {isVictory ? 'Tournament Victory' : record.result === 'draw' ? 'Match Contested (Draw)' : 'Defeat Against NEXUS'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {record.mode.toUpperCase()} · Sector: {record.discipline} · Difficulty: {record.difficulty}
          </p>
        </div>

        {/* Final Scoreboard */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="block text-[11px] font-mono uppercase text-slate-400 mb-0.5">Operator Score</span>
            <span className="text-3xl font-black font-mono text-sky-400 tabular-nums">
              {record.playerScore}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-mono uppercase text-violet-400 mb-0.5">NEXUS AI Score</span>
            <span className="text-3xl font-black font-mono text-violet-400 tabular-nums">
              {record.nexusScore}
            </span>
          </div>
        </div>

        {/* Progression & Rating Delta Strip */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Arena Rating Delta</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono font-bold">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className={`text-base ${record.ratingDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'} tabular-nums`}>
                {record.ratingDelta >= 0 ? `+${record.ratingDelta}` : record.ratingDelta} Elo
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Total: {profile.arenaRating}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Experience & Credits</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono font-bold text-sky-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-base tabular-nums">+{record.xpGained} XP</span>
            </div>
            <span className="text-[11px] text-slate-400">+{Math.round(record.xpGained / 2)} Credits</span>
          </div>
        </div>

        {/* Rank Promotion Banner if promoted */}
        {rankUp && (
          <div className="p-4 rounded-xl border border-amber-500/50 bg-amber-950/20 text-center animate-bounce">
            <Award className="h-6 w-6 text-amber-400 mx-auto mb-1" />
            <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
              Promotion Achieved!
            </span>
            <span className="text-base font-extrabold text-white">
              Tier {profile.rankTier}: {profile.rankName}
            </span>
          </div>
        )}

        {/* Newly Unlocked Achievements */}
        {newAchievements.length > 0 && (
          <div className="p-4 rounded-xl border border-violet-500/40 bg-violet-950/20 text-left space-y-1">
            <span className="text-[10px] font-mono text-violet-400 uppercase font-bold block">
              Achievements Unlocked
            </span>
            {newAchievements.map(a => (
              <div key={a.id} className="text-xs text-white flex items-center gap-2">
                <span>{a.icon}</span>
                <span className="font-bold">{a.title}:</span>
                <span className="text-slate-300">{a.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              sounds.click();
              onPlayAgain();
            }}
            className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Rematch NEXUS</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sounds.click();
                onLeaderboard();
              }}
              className="py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Leaderboards</span>
            </button>

            <button
              onClick={() => {
                sounds.click();
                onHome();
              }}
              className="py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Hub</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
