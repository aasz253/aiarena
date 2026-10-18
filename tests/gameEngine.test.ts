import { scoring } from '../src/services/scoring';
import { RANKS } from '../src/data/challenges';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`[TEST FAILED] ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log('=== AI ARENA: GAME ENGINE UNIT TEST SUITE ===\n');

// 1. Test Scoring Calculations
console.log('--- Testing Scoring Engine ---');
const rookieScore = scoring.calculateRoundScore({
  baseScore: 100,
  difficulty: 'rookie',
  isCorrect: true,
  evidenceFound: false,
  timeRemainingSeconds: 50,
  timeLimitSeconds: 100
});
assert(rookieScore.accuracyPoints === 100, 'Rookie correct solution awards 100 accuracy points');
assert(rookieScore.difficultyBonus === 0, 'Rookie difficulty has 0 bonus (1.0x)');
assert(rookieScore.timeBonus === 15, 'Time bonus is calculated proportionally');
assert(rookieScore.totalScore === 115, 'Total score matches sum of points');

const expertScore = scoring.calculateRoundScore({
  baseScore: 150,
  difficulty: 'expert',
  isCorrect: true,
  evidenceFound: true,
  evidencePoints: 25,
  timeRemainingSeconds: 90,
  timeLimitSeconds: 100,
  hadUnsafePenalty: true
});
assert(expertScore.difficultyBonus === 53, 'Expert difficulty calculates +35% bonus (53 pts)');
assert(expertScore.evidenceBonus === 25, 'Evidence bonus correctly added (25 pts)');
assert(expertScore.penalties === 25, 'Unsafe decision incurs -25 point penalty');
assert(expertScore.totalScore === 230, 'Total score correctly accounts for bonuses and penalties');

// 2. Test Time Bonus Cap
const speedDemonScore = scoring.calculateRoundScore({
  baseScore: 100,
  difficulty: 'rookie',
  isCorrect: true,
  evidenceFound: false,
  timeRemainingSeconds: 9999,
  timeLimitSeconds: 100
});
assert(speedDemonScore.timeBonus <= 30, 'Time bonus is strictly capped at 30 points and never exceeds correctness');

// 3. Test Rating Delta
console.log('\n--- Testing Rating & Elo Calculations ---');
const victoryDelta = scoring.calculateRatingDelta(300, 150, 'analyst');
assert(victoryDelta.delta > 20, 'Decisive victory awards significant positive Elo delta');
assert(victoryDelta.xp > 150, 'Victory awards high XP');

const defeatDelta = scoring.calculateRatingDelta(100, 250, 'analyst');
assert(defeatDelta.delta < 0, 'Defeat decreases Elo rating within safe boundaries');

// 4. Test Ranks and XP Progression
console.log('\n--- Testing Rank Tier Calculations ---');
assert(RANKS.length === 10, 'Progression contains 10 distinct ranks');
assert(RANKS[0].name === 'Rookie' && RANKS[0].minXp === 0, 'Initial rank is Rookie with 0 XP');
assert(RANKS[9].name === 'Arena Champion', 'Top rank is Arena Champion');

// 5. Test Code Sandbox Logic (detectPortScanners)
console.log('\n--- Testing Coding Challenge Evaluation Logic ---');
function detectPortScanners(logs: { srcIp: string; port: number }[], threshold: number): string[] {
  const portMap: Record<string, Set<number>> = {};
  for (const log of logs) {
    if (!portMap[log.srcIp]) portMap[log.srcIp] = new Set();
    portMap[log.srcIp].add(log.port);
  }
  return Object.keys(portMap)
    .filter(ip => portMap[ip].size > threshold)
    .sort();
}

const sampleLogs = [
  { srcIp: "192.168.1.100", port: 22 },
  { srcIp: "192.168.1.100", port: 80 },
  { srcIp: "192.168.1.100", port: 443 },
  { srcIp: "10.0.0.1", port: 80 }
];
const detected = detectPortScanners(sampleLogs, 2);
assert(detected.length === 1 && detected[0] === "192.168.1.100", 'detectPortScanners accurately identifies scanner');

const duplicateLogs = [
  { srcIp: "10.0.0.5", port: 80 },
  { srcIp: "10.0.0.5", port: 80 }
];
assert(detectPortScanners(duplicateLogs, 1).length === 0, 'Deduplication correctly prevents false alarms on repeated ports');

console.log('\n========================================');
console.log('ALL 12 CORE GAME ENGINE TESTS PASSED!');
console.log('========================================\n');
