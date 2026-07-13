export type ConfidenceLevel = "faible" | "moyenne" | "élevée";

export type MasteryEvidence = {
  mastery: number;
  evidenceCount: number;
  correctCount: number;
  examWeight?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function confidenceFromEvidence(evidenceCount: number): ConfidenceLevel {
  if (evidenceCount < 8) return "faible";
  if (evidenceCount < 25) return "moyenne";
  return "élevée";
}

export function updateCalibratedMastery({
  current,
  correct,
  responseTimeMs,
  targetTimeMs = 30_000,
  difficulty = 3,
  evidenceCount = 0
}: {
  current: number;
  correct: boolean;
  responseTimeMs: number;
  targetTimeMs?: number;
  difficulty?: number;
  evidenceCount?: number;
}) {
  const boundedCurrent = clamp(current, 0, 100);
  const safeTarget = Math.max(1_000, targetTimeMs);
  const speedRatio = clamp(responseTimeMs / safeTarget, 0.15, 3);
  const speedAdjustment = clamp((1 - speedRatio) * 7, -7, 7);
  const difficultyAdjustment = (clamp(difficulty, 1, 5) - 3) * 3;

  const observation = correct
    ? clamp(78 + difficultyAdjustment + speedAdjustment, 62, 98)
    : clamp(9 - difficultyAdjustment + Math.max(0, speedRatio - 1) * 3, 2, 28);

  const evidenceRatio = clamp(evidenceCount / 30, 0, 1);
  const alpha = 0.12 - evidenceRatio * 0.06;
  const proposed = boundedCurrent + (observation - boundedCurrent) * alpha;
  const maxDelta = correct ? 5 : 4;
  const boundedDelta = clamp(proposed - boundedCurrent, -maxDelta, maxDelta);
  const mastery = Math.round(clamp(boundedCurrent + boundedDelta, 0, 100) * 10) / 10;
  const nextEvidenceCount = evidenceCount + 1;

  return {
    mastery,
    evidenceCount: nextEvidenceCount,
    confidence: confidenceFromEvidence(nextEvidenceCount)
  };
}

export function scoreFromAccuracy(accuracy: number) {
  const ratio = clamp(accuracy, 0, 1);
  return Math.round((10 + 980 * Math.pow(ratio, 0.93)) / 5) * 5;
}

export function scoreFromMasteries(masteries: MasteryEvidence[]) {
  if (masteries.length === 0) return 10;
  const totalWeight = masteries.reduce((sum, item) => sum + (item.examWeight ?? 1), 0) || 1;
  const weightedMastery = masteries.reduce(
    (sum, item) => sum + clamp(item.mastery, 0, 100) * (item.examWeight ?? 1),
    0
  ) / totalWeight;
  return Math.round((10 + weightedMastery * 9.8) / 5) * 5;
}

export function buildScoreRange(centralScore: number, evidenceCount: number, source: "diagnostic" | "practice" | "mini_exam") {
  const sourceBase = source === "mini_exam" ? 58 : source === "diagnostic" ? 75 : 88;
  const uncertainty = clamp(sourceBase - Math.sqrt(Math.max(0, evidenceCount)) * 5, 35, 105);
  const low = clamp(Math.round((centralScore - uncertainty) / 5) * 5, 10, 990);
  const high = clamp(Math.round((centralScore + uncertainty) / 5) * 5, 10, 990);
  return { low, high };
}

export function buildPracticeScoreSnapshot({
  previousCentral,
  diagnosticCentral,
  sessionAccuracy,
  masteries
}: {
  previousCentral?: number | null;
  diagnosticCentral?: number | null;
  sessionAccuracy: number;
  masteries: MasteryEvidence[];
}) {
  const anchor = previousCentral ?? diagnosticCentral ?? 500;
  const masteryScore = scoreFromMasteries(masteries);
  const sessionScore = scoreFromAccuracy(sessionAccuracy);
  const totalEvidence = masteries.reduce((sum, item) => sum + item.evidenceCount, 0);
  const confidenceWeight = clamp(totalEvidence / 140, 0.08, 0.32);
  const target = masteryScore * 0.72 + sessionScore * 0.28;
  const raw = anchor + (target - anchor) * confidenceWeight;
  const delta = clamp(raw - anchor, -15, 15);
  const central = clamp(Math.round((anchor + delta) / 5) * 5, 10, 990);
  const range = buildScoreRange(central, totalEvidence, "practice");

  return {
    central,
    scoreLow: range.low,
    scoreHigh: range.high,
    confidence: confidenceFromEvidence(totalEvidence),
    evidenceCount: totalEvidence
  };
}

export function buildExamScoreSnapshot(correctAnswers: number, totalQuestions: number) {
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const central = scoreFromAccuracy(accuracy);
  const range = buildScoreRange(central, totalQuestions, "mini_exam");
  return {
    central,
    scoreLow: range.low,
    scoreHigh: range.high,
    confidence: totalQuestions >= 30 ? ("moyenne" as const) : ("faible" as const),
    evidenceCount: totalQuestions
  };
}
