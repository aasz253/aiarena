import React from 'react';
import { ShoppingBag, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { PlayerProfile } from '../../types';
import { STORE_ITEMS } from '../../data/challenges';
import { storage } from '../../services/storage';
import { sounds } from '../../services/sound';

interface ArmoryViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (p: PlayerProfile) => void;
  onBack: () => void;
}

export const ArmoryView: React.FC<ArmoryViewProps> = ({
  profile,
  onUpdateProfile,
  onBack
}) => {
  const handleBuy = (item: typeof STORE_ITEMS[0]) => {
    if (profile.credits < item.cost) {
      sounds.wrong();
      return;
    }

    sounds.correct();
    const updated = { ...profile };
    updated.credits -= item.cost;

    if (item.type === 'title') {
      if (!updated.unlockedTitles.includes(item.name)) {
        updated.unlockedTitles.push(item.name);
      }
      updated.title = item.name;
    } else if (item.type === 'avatar') {
      if (!updated.unlockedAvatars.includes(item.id)) {
        updated.unlockedAvatars.push(item.id);
      }
      updated.avatarId = item.id;
    } else if (item.type === 'theme') {
      if (!updated.unlockedThemes.includes(item.id)) {
        updated.unlockedThemes.push(item.id);
      }
      updated.activeTheme = item.id;
    }

    storage.saveProfile(updated);
    onUpdateProfile(updated);
  };

  const isUnlocked = (item: typeof STORE_ITEMS[0]) => {
    if (item.type === 'title') return profile.unlockedTitles.includes(item.name);
    if (item.type === 'avatar') return profile.unlockedAvatars.includes(item.id);
    if (item.type === 'theme') return profile.unlockedThemes.includes(item.id);
    return false;
  };

  const isEquipped = (item: typeof STORE_ITEMS[0]) => {
    if (item.type === 'title') return profile.title === item.name;
    if (item.type === 'avatar') return profile.avatarId === item.id;
    if (item.type === 'theme') return profile.activeTheme === item.id;
    return false;
  };

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
            Customization Armory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Equip custom callsign titles, digital insignias, and tournament terminal themes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <Sparkles className="h-4 w-4 text-sky-400" />
          <span className="text-slate-400">Available Credits:</span>
          <strong className="text-sky-300 font-bold tabular-nums">{profile.credits}</strong>
        </div>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STORE_ITEMS.map(item => {
          const unlocked = isUnlocked(item);
          const equipped = isEquipped(item);
          const canAfford = profile.credits >= item.cost;

          return (
            <div 
              key={item.id}
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                equipped 
                  ? 'border-sky-500/60 bg-sky-950/20' 
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    {item.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-400 tabular-nums">
                    {item.cost} Credits
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>

              <div>
                {equipped ? (
                  <div className="w-full py-2 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    <span>Equipped</span>
                  </div>
                ) : unlocked ? (
                  <button
                    onClick={() => handleBuy(item)}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      canAfford 
                        ? 'bg-sky-600 hover:bg-sky-500 text-white' 
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    Unlock ({item.cost} CR)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
