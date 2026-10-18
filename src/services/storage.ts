import { PlayerProfile, MatchRecord, LeaderboardEntry, Achievement, Discipline } from '../types';
import { RANKS, INITIAL_ACHIEVEMENTS } from '../data/challenges';

const PROFILE_KEY = 'aia_player_profile';
const MATCH_KEY = 'aia_match_history';
const LEADERBOARD_KEY = 'aia_leaderboard';
const ACHIEVEMENTS_KEY = 'aia_achievements';

const DEFAULT_PROFILE: PlayerProfile = {
  callsign: 'CYBER_OPERATOR',
  title: 'Novice Defender',
  avatarId: 'avatar_default',
  rankTier: 1,
  rankName: 'Rookie',
  xp: 0,
  xpToNext: 300,
  credits: 150,
  arenaRating: 1200,
  disciplineRatings: {
    DevSecOps: 1200,
    Cybersecurity: 1200,
    Malware: 1200,
    Coding: 1200
  },
  stats: {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalChallengesCompleted: 0,
    averageAccuracy: 100
  },
  unlockedAvatars: ['avatar_default'],
  unlockedTitles: ['Novice Defender'],
  unlockedThemes: ['default'],
  activeTheme: 'default'
};

const INITIAL_BOTS: LeaderboardEntry[] = [
  { rank: 1, callsign: 'NEXUS_PRIME', title: 'Grandmaster AI', rating: 2450, wins: 382, discipline: 'Overall' },
  { rank: 2, callsign: 'ZERO_DAY_ZERO', title: 'Elite Operator', rating: 2280, wins: 294, discipline: 'Overall' },
  { rank: 3, callsign: 'SPECTRE_V', title: 'Security Architect', rating: 2150, wins: 241, discipline: 'Overall' },
  { rank: 4, callsign: 'KERNEL_PANIC', title: 'Threat Hunter', rating: 1980, wins: 190, discipline: 'Overall' },
  { rank: 5, callsign: 'RUST_GUARDIAN', title: 'DevSecOps Engineer', rating: 1850, wins: 165, discipline: 'Overall' },
  { rank: 6, callsign: 'BYTE_VORTEX', title: 'Cyber Analyst', rating: 1720, wins: 130, discipline: 'Overall' },
  { rank: 7, callsign: 'AEGIS_9', title: 'Security Apprentice', rating: 1580, wins: 95, discipline: 'Overall' },
  { rank: 8, callsign: 'HEX_VALKYRIE', title: 'Script Runner', rating: 1420, wins: 62, discipline: 'Overall' },
  { rank: 9, callsign: 'NULL_POINTER', title: 'Rookie', rating: 1250, wins: 24, discipline: 'Overall' }
];

export const storage = {
  getProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) return DEFAULT_PROFILE;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_PROFILE, ...parsed };
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: PlayerProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  updateProfileCallsign(callsign: string): PlayerProfile {
    const profile = this.getProfile();
    profile.callsign = callsign.trim().slice(0, 16) || 'OPERATOR';
    this.saveProfile(profile);
    return profile;
  },

  getMatchHistory(): MatchRecord[] {
    try {
      const data = localStorage.getItem(MATCH_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordMatch(record: MatchRecord): { profile: PlayerProfile; rankUp: boolean; newAchievements: Achievement[] } {
    const profile = this.getProfile();
    const history = this.getMatchHistory();
    history.unshift(record);
    localStorage.setItem(MATCH_KEY, JSON.stringify(history.slice(0, 50)));

    const prevTier = profile.rankTier;

    // Update match counts
    profile.stats.totalMatches += 1;
    if (record.result === 'victory') {
      profile.stats.wins += 1;
      profile.stats.currentStreak += 1;
      if (profile.stats.currentStreak > profile.stats.bestStreak) {
        profile.stats.bestStreak = profile.stats.currentStreak;
      }
    } else if (record.result === 'defeat') {
      profile.stats.losses += 1;
      profile.stats.currentStreak = 0;
    }

    // Accuracy rolling average
    const currentMatches = profile.stats.totalMatches;
    profile.stats.averageAccuracy = Math.round(
      ((profile.stats.averageAccuracy * (currentMatches - 1)) + record.accuracy) / currentMatches
    );

    // Rating adjustments
    profile.arenaRating = Math.max(800, profile.arenaRating + record.ratingDelta);
    if (record.discipline !== 'All') {
      profile.disciplineRatings[record.discipline] = Math.max(
        800,
        profile.disciplineRatings[record.discipline] + record.ratingDelta
      );
    } else {
      // Gauntlet affects all disciplines evenly
      (['DevSecOps', 'Cybersecurity', 'Malware', 'Coding'] as Discipline[]).forEach(d => {
        profile.disciplineRatings[d] = Math.max(800, profile.disciplineRatings[d] + Math.round(record.ratingDelta / 2));
      });
    }

    // Award XP and Credits
    profile.xp += record.xpGained;
    profile.credits += Math.round(record.xpGained / 2);

    // Calculate Rank
    let currentRank = RANKS[0];
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (profile.xp >= RANKS[i].minXp) {
        currentRank = RANKS[i];
        break;
      }
    }

    profile.rankTier = currentRank.tier;
    profile.rankName = currentRank.name;
    const nextRank = RANKS.find(r => r.tier === currentRank.tier + 1);
    profile.xpToNext = nextRank ? nextRank.minXp : currentRank.minXp;

    const rankUp = profile.rankTier > prevTier;

    // Check Achievements
    const newAchievements = this.checkAchievements(profile, record);

    this.saveProfile(profile);
    this.updateLeaderboard(profile);

    return { profile, rankUp, newAchievements };
  },

  getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (!data) return INITIAL_ACHIEVEMENTS;
      const parsed: Achievement[] = JSON.parse(data);
      // Merge with initial to ensure any new achievements appear
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = parsed.find(p => p.id === initial.id);
        return found ? found : initial;
      });
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  },

  checkAchievements(profile: PlayerProfile, match: MatchRecord): Achievement[] {
    const list = this.getAchievements();
    const newlyUnlocked: Achievement[] = [];

    list.forEach(a => {
      if (a.unlocked) return;

      let unlockCondition = false;
      if (a.id === 'first-blood' && match.result === 'victory') unlockCondition = true;
      if (a.id === 'flawless-defense' && match.accuracy >= 100 && (match.discipline === 'DevSecOps' || match.discipline === 'Cybersecurity')) unlockCondition = true;
      if (a.id === 'gauntlet-survivor' && match.mode === 'gauntlet' && match.result === 'victory') unlockCondition = true;
      if (a.id === 'nexus-slayer' && match.difficulty === 'elite' && match.result === 'victory') unlockCondition = true;
      if (a.id === 'code-sentinel' && match.discipline === 'Coding' && match.result === 'victory' && match.accuracy >= 100) unlockCondition = true;

      if (unlockCondition) {
        a.unlocked = true;
        a.unlockedAt = Date.now();
        newlyUnlocked.push(a);
      }
    });

    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list));
    return newlyUnlocked;
  },

  getLeaderboard(discipline: Discipline | 'Overall'): LeaderboardEntry[] {
    const profile = this.getProfile();
    let bots = INITIAL_BOTS;
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      if (raw) bots = JSON.parse(raw);
    } catch {
      // use default
    }

    const playerRating = discipline === 'Overall' ? profile.arenaRating : profile.disciplineRatings[discipline];
    const playerEntry: LeaderboardEntry = {
      rank: 0,
      callsign: `${profile.callsign} (YOU)`,
      title: profile.rankName,
      rating: playerRating,
      wins: profile.stats.wins,
      discipline,
      isPlayer: true
    };

    const combined = [...bots, playerEntry].sort((a, b) => b.rating - a.rating);
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  },

  updateLeaderboard(_profile: PlayerProfile) {
    // Leaderboard updates dynamically on read
  },

  resetAllData() {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(MATCH_KEY);
    localStorage.removeItem(LEADERBOARD_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
    localStorage.removeItem('aia_muted');
  }
};
