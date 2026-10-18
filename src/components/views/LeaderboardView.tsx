import React, { useState } from 'react';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import { Discipline } from '../../types';
import { storage } from '../../services/storage';
import { sounds } from '../../services/sound';

interface LeaderboardViewProps {
  onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [discipline, setDiscipline] = useState<Discipline | 'Overall'>('Overall');
  const entries = storage.getLeaderboard(discipline);

  const categories: (Discipline | 'Overall')[] = ['Overall', 'DevSecOps', 'Cybersecurity', 'Malware', 'Coding'];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
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
            Competitive Leaderboards
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified local tournament standings calibrated via transparent Elo rating.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                sounds.click();
                setDiscipline(cat);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                discipline === cat ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Operator Callsign</th>
                <th className="py-3 px-4">Rank Title</th>
                <th className="py-3 px-4 text-right">Victories</th>
                <th className="py-3 px-4 text-right">Arena Rating (Elo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map(entry => {
                const isTop3 = entry.rank <= 3;
                return (
                  <tr 
                    key={entry.callsign} 
                    className={`transition-colors ${
                      entry.isPlayer 
                        ? 'bg-sky-500/15 font-bold text-sky-200' 
                        : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold">
                      <div className="flex items-center gap-1.5">
                        {entry.rank === 1 && <Trophy className="h-4 w-4 text-amber-400" />}
                        {entry.rank === 2 && <Medal className="h-4 w-4 text-slate-300" />}
                        {entry.rank === 3 && <Medal className="h-4 w-4 text-amber-600" />}
                        <span className="tabular-nums">#{entry.rank}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <span>{entry.callsign}</span>
                      {entry.callsign.includes('NEXUS') && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-950 text-violet-400 border border-violet-800/50">
                          AI RIVAL
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{entry.title}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{entry.wins}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sky-400 tabular-nums">
                      {entry.rating}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
