import React, { useState } from 'react';
import { Settings as SettingsIcon, Volume2, VolumeX, RotateCcw, ArrowLeft, ShieldCheck } from 'lucide-react';
import { storage } from '../../services/storage';
import { sounds } from '../../services/sound';

interface SettingsViewProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onResetData: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isMuted,
  onToggleMute,
  onResetData,
  onBack
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    sounds.click();
    storage.resetAllData();
    onResetData();
    setConfirmReset(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
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
          Arena System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure audio, tournament telemetry, and profile persistence.
        </p>
      </div>

      <div className="space-y-4">
        
        {/* Audio Toggle */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Synthesized Esports Audio (Web Audio API)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enables real-time synthesized countdown beeps, submission chimes, and tournament fanfare.
            </p>
          </div>
          <button
            onClick={() => {
              sounds.click();
              onToggleMute();
            }}
            className={`p-3 rounded-xl border transition-colors ${
              !isMuted ? 'border-sky-500 bg-sky-500/15 text-sky-400' : 'border-slate-800 bg-slate-950 text-slate-500'
            }`}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>

        {/* Server & AI Connectivity Status */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">NEXUS AI Architecture</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by local deterministic algorithmic engines with optional server-side Gemini commentary.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="h-4 w-4" />
            <span>Autonomous Engine Live</span>
          </div>
        </div>

        {/* Local Storage Reset */}
        <div className="p-5 rounded-xl border border-rose-900/30 bg-rose-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-300">Reset Local Match Records & Progress</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clears local match history, earned XP, achievements, and resets rank to Rookie.
            </p>
          </div>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-rose-400 border border-rose-800/50 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Data</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
