import { Difficulty, Challenge, Discipline } from '../types';

export interface NexusState {
  status: 'idle' | 'analyzing' | 'evaluating_vectors' | 'verifying_remediation' | 'submitted';
  progressPercent: number;
  solved: boolean;
  score: number;
  timeTaken: number;
  currentCommentary: string;
}

export class NexusOpponent {
  public difficulty: Difficulty = 'analyst';
  private resolveTimer: number | null = null;
  private progressInterval: number | null = null;

  constructor(difficulty: Difficulty = 'analyst') {
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: Difficulty) {
    this.difficulty = diff;
  }

  // Pre-calculated difficulty profiles
  private getProfile() {
    switch (this.difficulty) {
      case 'rookie':
        return {
          minSpeedRatio: 0.55,
          maxSpeedRatio: 0.85,
          accuracyRate: 0.65,
          evidenceDiscoveryRate: 0.30
        };
      case 'analyst':
        return {
          minSpeedRatio: 0.35,
          maxSpeedRatio: 0.65,
          accuracyRate: 0.82,
          evidenceDiscoveryRate: 0.60
        };
      case 'expert':
        return {
          minSpeedRatio: 0.22,
          maxSpeedRatio: 0.45,
          accuracyRate: 0.92,
          evidenceDiscoveryRate: 0.85
        };
      case 'elite':
        return {
          minSpeedRatio: 0.14,
          maxSpeedRatio: 0.32,
          accuracyRate: 0.98,
          evidenceDiscoveryRate: 0.95
        };
    }
  }

  public simulateChallengeSolve(
    challenge: Challenge,
    onProgress: (state: NexusState) => void,
    onComplete: (result: { correct: boolean; score: number; timeTaken: number; evidenceFound: boolean }) => void
  ) {
    this.cleanup();

    const profile = this.getProfile();
    const timeLimit = challenge.timeLimitSeconds;
    
    // Calculate simulated duration
    const speedRatio = profile.minSpeedRatio + Math.random() * (profile.maxSpeedRatio - profile.minSpeedRatio);
    const durationSeconds = Math.max(8, Math.round(timeLimit * speedRatio));
    const durationMs = durationSeconds * 1000;

    const isCorrect = Math.random() <= profile.accuracyRate;
    const evidenceFound = Math.random() <= profile.evidenceDiscoveryRate;

    const startTime = Date.now();
    let currentPercent = 0;

    // Dispatch status commentary based on discipline
    const commentary = this.getIntroCommentary(challenge.discipline);

    onProgress({
      status: 'analyzing',
      progressPercent: 5,
      solved: false,
      score: 0,
      timeTaken: 0,
      currentCommentary: commentary
    });

    this.progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      currentPercent = Math.min(95, Math.round((elapsed / durationMs) * 100));
      
      let status: NexusState['status'] = 'analyzing';
      if (currentPercent > 30) status = 'evaluating_vectors';
      if (currentPercent > 70) status = 'verifying_remediation';

      onProgress({
        status,
        progressPercent: currentPercent,
        solved: false,
        score: 0,
        timeTaken: Math.round(elapsed / 1000),
        currentCommentary: currentPercent > 60 ? this.getMidCommentary(challenge.discipline) : commentary
      });
    }, 400);

    this.resolveTimer = window.setTimeout(() => {
      this.cleanup();

      // Calculate score
      let score = 0;
      if (isCorrect) {
        score += challenge.baseScore;
        if (evidenceFound && challenge.hiddenEvidence) {
          score += challenge.hiddenEvidence.points;
        }
        // Speed bonus
        const remainingTime = timeLimit - durationSeconds;
        const timeBonus = Math.min(30, Math.max(0, Math.round(remainingTime * 0.4)));
        score += timeBonus;
      }

      onProgress({
        status: 'submitted',
        progressPercent: 100,
        solved: true,
        score,
        timeTaken: durationSeconds,
        currentCommentary: isCorrect 
          ? "Execution verified. Remediation sequence completed." 
          : "Heuristic anomaly detected. Recalibrating logic vectors."
      });

      onComplete({
        correct: isCorrect,
        score,
        timeTaken: durationSeconds,
        evidenceFound
      });
    }, durationMs);
  }

  public cleanup() {
    if (this.resolveTimer) {
      clearTimeout(this.resolveTimer);
      this.resolveTimer = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private getIntroCommentary(discipline: Discipline): string {
    switch (discipline) {
      case 'DevSecOps':
        return "Parsing deployment topology and configuration graphs...";
      case 'Cybersecurity':
        return "Cross-referencing network telemetry and authentication logs...";
      case 'Malware':
        return "Initiating binary heuristic disassembly in isolated virtual register...";
      case 'Coding':
        return "Compiling test invariants and evaluating time-complexity bounds...";
    }
  }

  private getMidCommentary(discipline: Discipline): string {
    switch (discipline) {
      case 'DevSecOps':
        return "Synthesizing minimal-privilege container security policies...";
      case 'Cybersecurity':
        return "Tracing lateral movement indicators across active subnet...";
      case 'Malware':
        return "Evaluating Shannon entropy signatures against behavioral baseline...";
      case 'Coding':
        return "Optimizing memory allocations and executing benchmark suite...";
    }
  }

  public async fetchContextualCommentary(
    discipline: Discipline,
    playerScore: number,
    nexusScore: number
  ): Promise<string> {
    const scoreDiff = nexusScore - playerScore;
    const mood = scoreDiff > 30 ? 'winning' : scoreDiff < -30 ? 'losing' : 'neutral';

    try {
      const res = await fetch('/api/nexus/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, discipline, scoreDiff })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dialogue) return data.dialogue;
      }
    } catch {
      // Offline fallback
    }

    if (mood === 'winning') {
      return "My synthetic heuristic models predicted this outcome. Accelerate your calculations, operator.";
    } else if (mood === 'losing') {
      return "An unexpected defense strategy. Recalibrating behavioral weights for the next sector.";
    } else {
      return "Our performance curves are running parallel. The next vector decides the victor.";
    }
  }
}

export const nexus = new NexusOpponent('analyst');
