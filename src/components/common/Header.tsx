import React from 'react';
import { Volume2, VolumeX, Menu, X, ShieldAlert } from 'lucide-react';
import { sounds } from '../../services/sound';
import { PlayerProfile } from '../../types';

interface HeaderProps {
  activeView: string;
  onNavigate: (view: string) => void;
  profile: PlayerProfile;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  profile,
  isMuted,
  onToggleMute
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (view: string) => {
    sounds.click();
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative z-40 w-full border-b border-slate-800/80 bg-[#07090e]/90 backdrop-blur-md">
      {/* Strict 3-Zone Contract: Brand — 4-5 Links — 1 Primary Action */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 group-hover:border-sky-400/60 transition-colors">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-sans uppercase">
            AI Arena
          </span>
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'home' ? 'text-sky-400 underline underline-offset-8 decoration-sky-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Arena
          </button>
          <button
            onClick={() => handleNavClick('disciplines')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'disciplines' ? 'text-sky-400 underline underline-offset-8 decoration-sky-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Disciplines
          </button>
          <button
            onClick={() => handleNavClick('practice')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'practice' ? 'text-sky-400 underline underline-offset-8 decoration-sky-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Practice Lab
          </button>
          <button
            onClick={() => handleNavClick('leaderboard')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'leaderboard' ? 'text-sky-400 underline underline-offset-8 decoration-sky-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => handleNavClick('profile')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'profile' ? 'text-sky-400 underline underline-offset-8 decoration-sky-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Profile ({profile.callsign})
          </button>
        </nav>

        {/* Zone 3: 1 primary action + sound toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              sounds.click();
              onToggleMute();
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            onClick={() => handleNavClick('lobby')}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            Enter Arena
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#090d16] px-4 py-4 space-y-2">
          {[
            { id: 'home', label: 'Home Arena' },
            { id: 'disciplines', label: 'Disciplines' },
            { id: 'lobby', label: 'Start Competition' },
            { id: 'practice', label: 'Practice Lab' },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'profile', label: `Profile (${profile.callsign})` },
            { id: 'achievements', label: 'Achievements' },
            { id: 'armory', label: 'Customization Armory' },
            { id: 'settings', label: 'Settings' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                activeView === item.id ? 'bg-sky-500/15 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
