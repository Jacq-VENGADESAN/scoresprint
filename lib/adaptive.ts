import type { SessionBlock, SkillMastery } from "@/lib/types";

export function updateMastery(current: number, correct: boolean, responseTimeMs: number, targetTimeMs = 30000): number {
  const bounded = Math.max(0, Math.min(100, current));
  const speedRatio = Math.min(2, responseTimeMs / targetTimeMs);
  const delta = correct ? Math.max(1.5, 6 - speedRatio * 2) : -Math.min(9, 5 + speedRatio * 2);
  return Math.round(Math.max(0, Math.min(100, bounded + delta)) * 10) / 10;
}

export function priorityScore(skill: SkillMastery, examDaysAway: number): number {
  const weakness = 1 - skill.mastery / 100;
  const urgency = Math.max(1, 45 / Math.max(1, examDaysAway));
  const repetitionPenalty = 1 + Math.min(1.5, skill.repeatedErrors * 0.18);
  return skill.examWeight * weakness * urgency * repetitionPenalty;
}

export function buildDailySession(skills: SkillMastery[], totalMinutes: number, examDaysAway: number): SessionBlock[] {
  if (totalMinutes <= 0 || skills.length === 0) return [];

  const ranked = [...skills]
    .map((skill) => ({ skill, priority: priorityScore(skill, examDaysAway) }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.min(4, skills.length));

  const totalPriority = ranked.reduce((sum, entry) => sum + entry.priority, 0) || 1;
  let allocated = 0;

  return ranked.map((entry, index) => {
    const isLast = index === ranked.length - 1;
    const minutes = isLast
      ? Math.max(1, totalMinutes - allocated)
      : Math.max(3, Math.round((entry.priority / totalPriority) * totalMinutes));
    allocated += minutes;

    return {
      skillId: entry.skill.skillId,
      minutes,
      reason: entry.skill.repeatedErrors > 1 ? "Erreur récurrente" : "Compétence prioritaire",
    };
  });
}

export function estimateScoreRange(correctAnswers: number, totalAnswers: number): { min: number; max: number } {
  if (totalAnswers <= 0) return { min: 10, max: 120 };
  const ratio = Math.max(0, Math.min(1, correctAnswers / totalAnswers));
  const midpoint = 10 + ratio * 980;
  const uncertainty = Math.max(35, 125 - totalAnswers * 2);
  return {
    min: Math.max(10, Math.round((midpoint - uncertainty) / 5) * 5),
    max: Math.min(990, Math.round((midpoint + uncertainty) / 5) * 5),
  };
}
