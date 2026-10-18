export type Discipline = 'DevSecOps' | 'Cybersecurity' | 'Malware' | 'Coding';

export type GameMode = 'quick' | 'ranked' | 'gauntlet' | 'practice' | 'boss' | 'championship';

export type Difficulty = 'rookie' | 'analyst' | 'expert' | 'elite';

export type ChallengeType =
  | 'cicd_defense'
  | 'docker_security'
  | 'k8s_manifest'
  | 'ai_app_security'
  | 'phishing_audit'
  | 'log_analysis'
  | 'network_defense'
  | 'threat_hunting'
  | 'file_triage'
  | 'static_analysis'
  | 'behavioral_analysis'
  | 'malware_classify'
  | 'algo_scan'
  | 'secure_coding'
  | 'devsecops_auto'
  | 'code_review';

export interface ChallengeOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
  isUnsafePenalty?: boolean;
}

export interface TestCase {
  id: string;
  description: string;
  input: string;
  expectedOutput: string;
}

export interface Challenge {
  id: string;
  discipline: Discipline;
  type: ChallengeType;
  title: string;
  difficulty: Difficulty;
  timeLimitSeconds: number;
  baseScore: number;
  description: string;
  learningObjective: string;
  targetArtifactName: string; // e.g., 'workflow.yaml', 'Dockerfile', 'auth_logs.json'
  artifactContent?: string;
  artifactType: 'yaml' | 'dockerfile' | 'json' | 'log' | 'email' | 'code' | 'timeline' | 'binary_meta';
  
  // Specific interactive items
  options?: ChallengeOption[]; // For multiple choice / vulnerability triage
  vulnerabilityLines?: number[]; // Interactive lines for code/config selection
  questions?: {
    id: string;
    prompt: string;
    options: ChallengeOption[];
  }[];
  
  // For coding challenges
  initialCode?: string;
  language?: 'javascript' | 'python';
  testCases?: TestCase[];
  solutionKeywords?: string[]; // Verification tokens
  codeValidator?: (code: string) => { passed: boolean; results: { name: string; passed: boolean; message?: string }[] };
  
  // Forensics / Discovery bonus
  hiddenEvidence?: {
    id: string;
    label: string;
    description: string;
    points: number;
  };
  
  expertAnalysis: string;
}

export interface PlayerProfile {
  callsign: string;
  title: string;
  avatarId: string;
  rankTier: number; // 1-10
  rankName: string;
  xp: number;
  xpToNext: number;
  credits: number;
  arenaRating: number; // Elo-like rating
  disciplineRatings: {
    DevSecOps: number;
    Cybersecurity: number;
    Malware: number;
    Coding: number;
  };
  stats: {
    totalMatches: number;
    wins: number;
    losses: number;
    currentStreak: number;
    bestStreak: number;
    totalChallengesCompleted: number;
    averageAccuracy: number;
  };
  unlockedAvatars: string[];
  unlockedTitles: string[];
  unlockedThemes: string[];
  activeTheme: string;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  mode: GameMode;
  discipline: Discipline | 'All';
  difficulty: Difficulty;
  playerScore: number;
  nexusScore: number;
  result: 'victory' | 'defeat' | 'draw';
  ratingDelta: number;
  xpGained: number;
  accuracy: number;
}

export interface LeaderboardEntry {
  rank: number;
  callsign: string;
  title: string;
  rating: number;
  wins: number;
  discipline: Discipline | 'Overall';
  isPlayer?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  category: Discipline | 'Arena';
}

export interface RoundScore {
  round: number;
  challengeTitle: string;
  discipline: Discipline;
  playerPoints: number;
  playerTimeTaken: number;
  playerCorrect: boolean;
  playerEvidenceFound: boolean;
  nexusPoints: number;
  nexusTimeTaken: number;
  nexusCorrect: boolean;
}
