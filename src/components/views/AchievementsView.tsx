import React from 'react';
import { Trophy, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { storage } from '../../services/storage';
import { sounds } from '../../services/sound';

interface AchievementsViewProps {
  onBack: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ onBack }) => {
  const achievements = storage.getAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

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
            Tournament Trophies
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Specialized engineering and security badges unlocked through arena victories.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          Unlocked: <strong className="text-sky-400 tabular-nums">{unlockedCount}</strong> / {achievements.length}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(a => (
          <div 
            key={a.id}
            className={`p-5 rounded-xl border transition-all flex items-start gap-4 ${
              a.unlocked 
                ? 'border-sky-500/40 bg-sky-950/15 text-white' 
                : 'border-slate-800 bg-slate-900/40 text-slate-500'
            }`}
          >
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
              a.unlocked ? 'bg-sky-500/20 border-sky-500/40' : 'bg-slate-950 border-slate-800'
            }`}>
              {a.unlocked ? a.icon : <Lock className="h-5 w-5 text-slate-600" />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold ${a.unlocked ? 'text-white' : 'text-slate-400'}`}>
                  {a.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                  {a.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {a.description}
              </p>
              {a.unlocked && a.unlockedAt && (
                <span className="text-[10px] font-mono text-emerald-400 block pt-1">
                  Earned {new Date(a.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
