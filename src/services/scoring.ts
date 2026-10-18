import { Difficulty } from '../types';

export interface ScoreBreakdown {
  baseScore: number;
  accuracyPoints: number;
  difficultyMultiplier: number;
  difficultyBonus: number;
  timeBonus: number;
  evidenceBonus: number;
  penalties: number;
  totalScore: number;
}

export const scoring = {
  getDifficultyMultiplier(difficulty: Difficulty): number {
    switch (difficulty) {
      case 'rookie': return 1.0;
      case 'analyst': return 1.15;
      case 'expert': return 1.35;
      case 'elite': return 1.55;
    }
  },

  calculateRoundScore(params: {
    baseScore: number;
    difficulty: Difficulty;
    isCorrect: boolean;
    evidenceFound: boolean;
    evidencePoints?: number;
    timeRemainingSeconds: number;
    timeLimitSeconds: number;
    hadUnsafePenalty?: boolean;
  }): ScoreBreakdown {
    const {
      baseScore,
      difficulty,
      isCorrect,
      evidenceFound,
      evidencePoints = 20,
      timeRemainingSeconds,
      timeLimitSeconds,
      hadUnsafePenalty = false
    } = params;

    const multiplier = this.getDifficultyMultiplier(difficulty);
    const accuracyPoints = isCorrect ? baseScore : 0;
    const difficultyBonus = isCorrect ? Math.round(baseScore * (multiplier - 1.0)) : 0;

    // Time bonus: capped at 30 points max, never outstrips correctness
    let timeBonus = 0;
    if (isCorrect && timeRemainingSeconds > 0) {
      const timeRatio = Math.max(0, Math.min(1, timeRemainingSeconds / timeLimitSeconds));
      timeBonus = Math.min(30, Math.round(timeRatio * 30));
    }

    const evidenceBonus = (isCorrect && evidenceFound) ? evidencePoints : 0;
    const penalties = hadUnsafePenalty ? 25 : 0;

    const totalScore = Math.max(0, accuracyPoints + difficultyBonus + timeBonus + evidenceBonus - penalties);

    return {
      baseScore,
      accuracyPoints,
      difficultyMultiplier: multiplier,
      difficultyBonus,
      timeBonus,
      evidenceBonus,
      penalties,
      totalScore
    };
  },

  calculateRatingDelta(playerScore: number, nexusScore: number, difficulty: Difficulty): { delta: number; xp: number } {
    const diff = playerScore - nexusScore;
    const diffMultiplier = this.getDifficultyMultiplier(difficulty);

    let baseDelta = 0;
    let baseXP = 50;

    if (diff > 0) {
      // Victory: +20 to +40 based on score difference & difficulty
      baseDelta = Math.min(45, Math.round(20 + (diff / 25) * diffMultiplier));
      baseXP = Math.round(150 * diffMultiplier + Math.min(100, playerScore / 5));
    } else if (diff < 0) {
      // Defeat: -10 to -25
      baseDelta = Math.max(-28, Math.round(-15 - (Math.abs(diff) / 35)));
      baseXP = Math.round(60 * diffMultiplier);
    } else {
      // Draw
      baseDelta = 5;
      baseXP = Math.round(90 * diffMultiplier);
    }

    return { delta: baseDelta, xp: baseXP };
  }
};
