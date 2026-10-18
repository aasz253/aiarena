import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/common/Header';
import { ArenaHero } from './components/arena/ArenaHero';
import { MatchLobby } from './components/arena/MatchLobby';
import { MatchHUD } from './components/arena/MatchHUD';
import { RoundResultModal } from './components/arena/RoundResultModal';
import { MatchSummaryModal } from './components/arena/MatchSummaryModal';
import { DevSecOpsWorkspace } from './components/workspace/DevSecOpsWorkspace';
import { CybersecurityWorkspace } from './components/workspace/CybersecurityWorkspace';
import { MalwareWorkspace } from './components/workspace/MalwareWorkspace';
import { CodingWorkspace } from './components/workspace/CodingWorkspace';
import { LeaderboardView } from './components/views/LeaderboardView';
import { ProfileView } from './components/views/ProfileView';
import { PracticeLabView } from './components/views/PracticeLabView';
import { DisciplinesView } from './components/views/DisciplinesView';
import { AchievementsView } from './components/views/AchievementsView';
import { ArmoryView } from './components/views/ArmoryView';
import { SettingsView } from './components/views/SettingsView';
import { CyberArenaCanvas } from './components/common/CyberArenaCanvas';

import { 
  Discipline, 
  GameMode, 
  Difficulty, 
  Challenge, 
  PlayerProfile, 
  MatchRecord, 
  RoundScore,
  Achievement
} from './types';
import { CHALLENGES } from './data/challenges';
import { storage } from './services/storage';
import { sounds } from './services/sound';
import { nexus, NexusState } from './services/nexusAi';
import { scoring, ScoreBreakdown } from './services/scoring';

type AppView = 
  | 'home' 
  | 'lobby' 
  | 'disciplines' 
  | 'practice' 
  | 'leaderboard' 
  | 'profile' 
  | 'achievements' 
  | 'armory' 
  | 'settings' 
  | 'in_match';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [profile, setProfile] = useState<PlayerProfile>(storage.getProfile());
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  // Match State
  const [currentMode, setCurrentMode] = useState<GameMode>('quick');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline>('DevSecOps');
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('analyst');
  
  const [matchChallenges, setMatchChallenges] = useState<Challenge[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  
  const [playerTotalScore, setPlayerTotalScore] = useState(0);
  const [nexusTotalScore, setNexusTotalScore] = useState(0);
  
  const [timeRemaining, setTimeRemaining] = useState(90);
  const timerRef = useRef<number | null>(null);

  const [nexusState, setNexusState] = useState<NexusState>({
    status: 'idle',
    progressPercent: 0,
    solved: false,
    score: 0,
    timeTaken: 0,
    currentCommentary: 'Initializing arena link...'
  });

  const nexusResultRef = useRef<{ correct: boolean; score: number; timeTaken: number; evidenceFound: boolean } | null>(null);

  // Modals
  const [activeRoundBreakdown, setActiveRoundBreakdown] = useState<ScoreBreakdown | null>(null);
  const [completedMatchRecord, setCompletedMatchRecord] = useState<MatchRecord | null>(null);
  const [rankUpAchieved, setRankUpAchieved] = useState(false);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);

  // Hints
  const [hintLoading, setHintLoading] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const activeChallenge = matchChallenges[currentRoundIndex] || null;

  // Toggle Mute
  const handleToggleMute = () => {
    const newState = sounds.toggleMute();
    setIsMuted(newState);
  };

  // Start Competition Match
  const handleStartMatch = (mode: GameMode, discipline: Discipline | 'All', difficulty: Difficulty) => {
    setCurrentMode(mode);
    setCurrentDifficulty(difficulty);
    nexus.setDifficulty(difficulty);

    let challengesToPlay: Challenge[] = [];

    if (mode === 'gauntlet') {
      // Pick 1 challenge per discipline: DevSecOps -> Cybersecurity -> Malware -> Coding
      const disciplines: Discipline[] = ['DevSecOps', 'Cybersecurity', 'Malware', 'Coding'];
      disciplines.forEach(d => {
        const pool = CHALLENGES.filter(c => c.discipline === d);
        const randomPick = pool[Math.floor(Math.random() * pool.length)];
        if (randomPick) challengesToPlay.push(randomPick);
      });
    } else {
      // Pick 3 challenges in the chosen discipline
      const pool = CHALLENGES.filter(c => c.discipline === discipline);
      // Shuffle and take 3
      challengesToPlay = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    setMatchChallenges(challengesToPlay);
    setCurrentRoundIndex(0);
    setRoundScores([]);
    setPlayerTotalScore(0);
    setNexusTotalScore(0);
    setActiveRoundBreakdown(null);
    setCompletedMatchRecord(null);

    initRound(challengesToPlay[0], 0);
    setActiveView('in_match');
  };

  // End Round logic (memoized to prevent stale closures in timer callback)
  const endRound = useCallback((playerResult: { isCorrect: boolean; evidenceFound: boolean; hadUnsafePenalty: boolean }) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    nexus.cleanup();

    const currentCh = matchChallenges[currentRoundIndex];
    if (!currentCh) return;

    // Calculate player score breakdown
    const breakdown = scoring.calculateRoundScore({
      baseScore: currentCh.baseScore,
      difficulty: currentDifficulty,
      isCorrect: playerResult.isCorrect,
      evidenceFound: playerResult.evidenceFound,
      evidencePoints: currentCh.hiddenEvidence?.points,
      timeRemainingSeconds: timeRemaining,
      timeLimitSeconds: currentCh.timeLimitSeconds,
      hadUnsafePenalty: playerResult.hadUnsafePenalty
    });

    // NEXUS score
    const nResult = nexusResultRef.current || {
      correct: false,
      score: 0,
      timeTaken: currentCh.timeLimitSeconds,
      evidenceFound: false
    };

    const newPlayerTotal = playerTotalScore + breakdown.totalScore;
    const newNexusTotal = nexusTotalScore + nResult.score;

    setPlayerTotalScore(newPlayerTotal);
    setNexusTotalScore(newNexusTotal);

    const roundScoreItem: RoundScore = {
      round: currentRoundIndex + 1,
      challengeTitle: currentCh.title,
      discipline: currentCh.discipline,
      playerPoints: breakdown.totalScore,
      playerTimeTaken: currentCh.timeLimitSeconds - timeRemaining,
      playerCorrect: playerResult.isCorrect,
      playerEvidenceFound: playerResult.evidenceFound,
      nexusPoints: nResult.score,
      nexusTimeTaken: nResult.timeTaken,
      nexusCorrect: nResult.correct
    };

    setRoundScores(prev => [...prev, roundScoreItem]);
    setActiveRoundBreakdown(breakdown);
  }, [matchChallenges, currentRoundIndex, currentDifficulty, timeRemaining, playerTotalScore, nexusTotalScore]);

  // Round initialization
  const initRound = (challenge: Challenge, _roundIdx: number) => {
    setTimeRemaining(challenge.timeLimitSeconds);
    setActiveHint(null);
    nexusResultRef.current = null;

    // Start Timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Time expired
          sounds.wrong();
          endRound({ isCorrect: false, evidenceFound: false, hadUnsafePenalty: false });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Launch NEXUS simulation
    nexus.simulateChallengeSolve(
      challenge,
      (state) => setNexusState(state),
      (result) => {
        nexusResultRef.current = result;
      }
    );
  };

  // Next round or complete match
  const handleProceedNextRound = () => {
    setActiveRoundBreakdown(null);

    const nextIndex = currentRoundIndex + 1;
    if (nextIndex < matchChallenges.length) {
      setCurrentRoundIndex(nextIndex);
      initRound(matchChallenges[nextIndex], nextIndex);
    } else {
      // All rounds completed! Finalize Match Record
      finalizeMatch();
    }
  };

  // Finalize Match
  const finalizeMatch = () => {
    const isVictory = playerTotalScore > nexusTotalScore;
    const isDraw = playerTotalScore === nexusTotalScore;
    const resultStr = isVictory ? 'victory' : isDraw ? 'draw' : 'defeat';

    const { delta, xp } = scoring.calculateRatingDelta(playerTotalScore, nexusTotalScore, currentDifficulty);

    // Calculate accuracy percentage across rounds
    const correctCount = roundScores.filter(r => r.playerCorrect).length;
    const accuracy = Math.round((correctCount / Math.max(1, roundScores.length)) * 100);

    const record: MatchRecord = {
      id: `match_${Date.now()}`,
      timestamp: Date.now(),
      mode: currentMode,
      discipline: currentMode === 'gauntlet' ? 'All' : selectedDiscipline,
      difficulty: currentDifficulty,
      playerScore: playerTotalScore,
      nexusScore: nexusTotalScore,
      result: resultStr,
      ratingDelta: delta,
      xpGained: xp,
      accuracy
    };

    const outcome = storage.recordMatch(record);
    setProfile(outcome.profile);
    setRankUpAchieved(outcome.rankUp);
    setNewlyUnlockedAchievements(outcome.newAchievements);
    setCompletedMatchRecord(record);
  };

  // Request Hint
  const handleGetHint = async () => {
    if (!activeChallenge) return;
    setHintLoading(true);

    try {
      const res = await fetch('/api/nexus/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeChallenge.title,
          discipline: activeChallenge.discipline,
          problem: activeChallenge.description
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.hint) {
          setActiveHint(data.hint);
          setHintLoading(false);
          return;
        }
      }
    } catch {
      // Local fallback
    }

    setActiveHint("Analyze least-privilege principles, unpinned dependencies, or unvalidated inputs in the target manifest.");
    setHintLoading(false);
  };

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      nexus.cleanup();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 font-sans selection:bg-sky-500/30 selection:text-sky-200 relative">
      {/* Background Cyber Arena Particle & Perspective Canvas */}
      <CyberArenaCanvas intensity="standard" />
      
      {/* Top Bar Header strictly following 3-Zone Contract */}
      <Header
        activeView={activeView}
        onNavigate={(view) => {
          if (activeView === 'in_match') {
            // Confirm quit match
            nexus.cleanup();
            if (timerRef.current) clearInterval(timerRef.current);
          }
          setActiveView(view as AppView);
        }}
        profile={profile}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        
        {/* VIEW: HOME ARENA */}
        {activeView === 'home' && (
          <ArenaHero
            profile={profile}
            onEnterArena={() => {
              setSelectedDiscipline('DevSecOps');
              setActiveView('lobby');
            }}
            onSelectDiscipline={(d) => {
              setSelectedDiscipline(d);
              setActiveView('lobby');
            }}
            onOpenPractice={() => setActiveView('practice')}
            onOpenGauntlet={() => {
              setCurrentMode('gauntlet');
              setActiveView('lobby');
            }}
          />
        )}

        {/* VIEW: MATCH LOBBY */}
        {activeView === 'lobby' && (
          <MatchLobby
            profile={profile}
            initialDiscipline={selectedDiscipline}
            initialMode={currentMode}
            onStartMatch={handleStartMatch}
            onCancel={() => setActiveView('home')}
          />
        )}

        {/* VIEW: ACTIVE IN-MATCH COMPETITION */}
        {activeView === 'in_match' && activeChallenge && (
          <div>
            <MatchHUD
              discipline={activeChallenge.discipline}
              mode={currentMode}
              difficulty={currentDifficulty}
              currentRound={currentRoundIndex + 1}
              totalRounds={matchChallenges.length}
              playerScore={playerTotalScore}
              nexusScore={nexusTotalScore}
              timeRemaining={timeRemaining}
              timeLimit={activeChallenge.timeLimitSeconds}
              nexusState={nexusState}
              onGetHint={handleGetHint}
              hintLoading={hintLoading}
              activeHint={activeHint}
            />

            {/* Active Challenge Workspace */}
            {activeChallenge.discipline === 'DevSecOps' && (
              <DevSecOpsWorkspace 
                challenge={activeChallenge} 
                onSubmit={endRound} 
              />
            )}
            {activeChallenge.discipline === 'Cybersecurity' && (
              <CybersecurityWorkspace 
                challenge={activeChallenge} 
                onSubmit={endRound} 
              />
            )}
            {activeChallenge.discipline === 'Malware' && (
              <MalwareWorkspace 
                challenge={activeChallenge} 
                onSubmit={endRound} 
              />
            )}
            {activeChallenge.discipline === 'Coding' && (
              <CodingWorkspace 
                challenge={activeChallenge} 
                onSubmit={endRound} 
              />
            )}

            {/* Round Summary Modal */}
            {activeRoundBreakdown && (
              <RoundResultModal
                round={currentRoundIndex + 1}
                totalRounds={matchChallenges.length}
                challenge={activeChallenge}
                playerBreakdown={activeRoundBreakdown}
                nexusScore={roundScores[roundScores.length - 1]?.nexusPoints || 0}
                nexusTime={roundScores[roundScores.length - 1]?.nexusTimeTaken || 0}
                nexusCorrect={roundScores[roundScores.length - 1]?.nexusCorrect || false}
                onNextRound={handleProceedNextRound}
              />
            )}

            {/* Tournament Match Final Summary Modal */}
            {completedMatchRecord && (
              <MatchSummaryModal
                record={completedMatchRecord}
                profile={profile}
                rankUp={rankUpAchieved}
                newAchievements={newlyUnlockedAchievements}
                onPlayAgain={() => {
                  handleStartMatch(currentMode, currentMode === 'gauntlet' ? 'All' : selectedDiscipline, currentDifficulty);
                }}
                onHome={() => setActiveView('home')}
                onLeaderboard={() => setActiveView('leaderboard')}
              />
            )}
          </div>
        )}

        {/* VIEW: DISCIPLINES CURRICULUM */}
        {activeView === 'disciplines' && (
          <DisciplinesView
            onSelectDiscipline={(d) => {
              setSelectedDiscipline(d);
              setCurrentMode('quick');
              setActiveView('lobby');
            }}
            onBack={() => setActiveView('home')}
          />
        )}

        {/* VIEW: PRACTICE LAB */}
        {activeView === 'practice' && (
          <PracticeLabView onBack={() => setActiveView('home')} />
        )}

        {/* VIEW: LEADERBOARDS */}
        {activeView === 'leaderboard' && (
          <LeaderboardView onBack={() => setActiveView('home')} />
        )}

        {/* VIEW: PLAYER PROFILE */}
        {activeView === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={(p) => setProfile(p)}
            onBack={() => setActiveView('home')}
          />
        )}

        {/* VIEW: ACHIEVEMENTS */}
        {activeView === 'achievements' && (
          <AchievementsView onBack={() => setActiveView('home')} />
        )}

        {/* VIEW: ARMORY */}
        {activeView === 'armory' && (
          <ArmoryView
            profile={profile}
            onUpdateProfile={(p) => setProfile(p)}
            onBack={() => setActiveView('home')}
          />
        )}

        {/* VIEW: SETTINGS */}
        {activeView === 'settings' && (
          <SettingsView
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onResetData={() => setProfile(storage.getProfile())}
            onBack={() => setActiveView('home')}
          />
        )}

      </main>

      {/* Esports Footer */}
      <footer className="border-t border-slate-900 bg-[#05070a] py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">AI ARENA: HUMAN VS MACHINE</span>
            <span aria-hidden="true">·</span>
            <span>Educational Cyber Competition Platform</span>
          </div>
          <div>
            <span>Outthink the Machine. Secure the Future.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
