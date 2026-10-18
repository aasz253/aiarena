import React, { useState } from 'react';
import { 
  User, 
  Trophy, 
  Award, 
  Flame, 
  Target, 
  ArrowLeft,
  Edit2,
  Check,
  History
} from 'lucide-react';
import { PlayerProfile, MatchRecord } from '../../types';
import { storage } from '../../services/storage';
import { sounds } from '../../services/sound';
import { RANKS } from '../../data/challenges';

interface ProfileViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (p: PlayerProfile) => void;
  onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onBack
}) => {
  const [isEditingCallsign, setIsEditingCallsign] = useState(false);
  const [callsignInput, setCallsignInput] = useState(profile.callsign);
  const matchHistory = storage.getMatchHistory();

  const handleSaveCallsign = () => {
    sounds.click();
    const updated = storage.updateProfileCallsign(callsignInput);
    onUpdateProfile(updated);
    setIsEditingCallsign(false);
  };

  const currentRank = RANKS.find(r => r.tier === profile.rankTier) || RANKS[0];
  const nextRank = RANKS.find(r => r.tier === profile.rankTier + 1);
  const xpNeeded = nextRank ? nextRank.minXp - currentRank.minXp : 1000;
  const currentXpProgress = Math.max(0, profile.xp - currentRank.minXp);
  const xpPercent = nextRank ? Math.min(100, Math.round((currentXpProgress / xpNeeded) * 100)) : 100;

  const winRate = profile.stats.totalMatches > 0 
    ? Math.round((profile.stats.wins / profile.stats.totalMatches) * 100) 
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={() => {
              sounds.click();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Arena</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
            Operator Dossier
          </h1>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="h-20 w-20 rounded-2xl bg-sky-500/10 border border-sky-500/40 flex items-center justify-center text-3xl font-black text-sky-400 shrink-0">
          {profile.callsign.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            
            {/* Callsign with inline editing */}
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isEditingCallsign ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={callsignInput}
                    onChange={(e) => setCallsignInput(e.target.value)}
                    maxLength={16}
                    className="px-2.5 py-1 text-sm bg-slate-950 border border-sky-500 rounded text-white font-mono uppercase"
                  />
                  <button
                    onClick={handleSaveCallsign}
                    className="p-1.5 text-emerald-400 hover:bg-slate-800 rounded"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-sans uppercase">
                    {profile.callsign}
                  </h2>
                  <button
                    onClick={() => {
                      sounds.click();
                      setIsEditingCallsign(true);
                    }}
                    className="text-slate-400 hover:text-white p-1"
                    title="Change Callsign"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>

            <span className="text-xs font-mono text-slate-400">
              Title: <strong className="text-sky-300">{profile.title}</strong>
            </span>
          </div>

          {/* Rank & XP bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">
                Tier {profile.rankTier}: {profile.rankName} {currentRank.emblem}
              </span>
              <span className="text-slate-400 tabular-nums">
                {profile.xp} XP {nextRank ? `/ ${nextRank.minXp} XP` : '(MAX)'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500" 
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Performance KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-mono uppercase text-slate-500 block mb-1">Arena Rating</span>
          <span className="text-2xl font-black font-mono text-sky-400 tabular-nums">{profile.arenaRating}</span>
          <span className="text-xs text-slate-400 block mt-0.5">Global Elo</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-mono uppercase text-slate-500 block mb-1">Win Rate</span>
          <span className="text-2xl font-black font-mono text-emerald-400 tabular-nums">{winRate}%</span>
          <span className="text-xs text-slate-400 block mt-0.5">{profile.stats.wins}W - {profile.stats.losses}L</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-mono uppercase text-slate-500 block mb-1">Winning Streak</span>
          <span className="text-2xl font-black font-mono text-amber-400 tabular-nums">{profile.stats.currentStreak}</span>
          <span className="text-xs text-slate-400 block mt-0.5">Best: {profile.stats.bestStreak}</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-mono uppercase text-slate-500 block mb-1">Average Accuracy</span>
          <span className="text-2xl font-black font-mono text-violet-400 tabular-nums">{profile.stats.averageAccuracy}%</span>
          <span className="text-xs text-slate-400 block mt-0.5">{profile.stats.totalMatches} Matches</span>
        </div>
      </div>

      {/* Sector Skill Ratings */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h3 className="text-sm font-bold font-mono uppercase text-slate-300">
          Sector Competency Ratings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(profile.disciplineRatings).map(([disc, rating]) => (
            <div key={disc} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-xs font-bold text-white block">{disc}</span>
              <span className="text-xl font-black font-mono text-sky-400 tabular-nums mt-1 block">
                {rating} Elo
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Match History Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold font-mono uppercase text-slate-200">
              Recent Competition Records
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{matchHistory.length} Recorded</span>
        </div>

        {matchHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            No match records found. Enter the arena to initiate your tournament career!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {matchHistory.map(m => (
                  <tr key={m.id} className="text-slate-300 hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={m.result === 'victory' ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.result.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize font-mono">{m.mode}</td>
                    <td className="py-3 px-4">{m.discipline}</td>
                    <td className="py-3 px-4 capitalize font-mono text-slate-400">{m.difficulty}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {m.playerScore} - {m.nexusScore}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                      <span className={m.ratingDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.ratingDelta >= 0 ? `+${m.ratingDelta}` : m.ratingDelta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
