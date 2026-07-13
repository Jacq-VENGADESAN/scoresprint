export type CompletedSession = {
  completed_at: string | null;
  total_questions: number;
  correct_answers: number;
  duration_ms: number;
};

export type DailyActivity = {
  dateKey: string;
  label: string;
  sessions: number;
  questions: number;
  correct: number;
  durationMs: number;
  accuracy: number;
};

const PARIS_TIME_ZONE = "Europe/Paris";

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day)
  };
}

export function parisDateKey(date: Date) {
  const { year, month, day } = dateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function shiftCalendarDay(date: Date, days: number) {
  const { year, month, day } = dateParts(date);
  return new Date(Date.UTC(year, month - 1, day + days, 12));
}

export function calculateStreak(completedDates: string[], now = new Date()) {
  const activeDays = new Set(
    completedDates
      .filter(Boolean)
      .map((value) => parisDateKey(new Date(value)))
  );

  const today = shiftCalendarDay(now, 0);
  const yesterday = shiftCalendarDay(now, -1);
  let cursor = activeDays.has(parisDateKey(today)) ? today : yesterday;

  if (!activeDays.has(parisDateKey(cursor))) return 0;

  let streak = 0;
  while (activeDays.has(parisDateKey(cursor))) {
    streak += 1;
    cursor = shiftCalendarDay(cursor, -1);
  }
  return streak;
}

export function buildWeeklyActivity(sessions: CompletedSession[], now = new Date()): DailyActivity[] {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TIME_ZONE,
    weekday: "short"
  });

  const days = Array.from({ length: 7 }, (_, index) => shiftCalendarDay(now, index - 6));
  const activity = days.map((date) => ({
    dateKey: parisDateKey(date),
    label: formatter.format(date).replace(".", ""),
    sessions: 0,
    questions: 0,
    correct: 0,
    durationMs: 0,
    accuracy: 0
  }));
  const activityByDay = new Map(activity.map((day) => [day.dateKey, day]));

  for (const session of sessions) {
    if (!session.completed_at) continue;
    const day = activityByDay.get(parisDateKey(new Date(session.completed_at)));
    if (!day) continue;
    day.sessions += 1;
    day.questions += Number(session.total_questions) || 0;
    day.correct += Number(session.correct_answers) || 0;
    day.durationMs += Number(session.duration_ms) || 0;
  }

  return activity.map((day) => ({
    ...day,
    accuracy: day.questions > 0 ? Math.round((day.correct / day.questions) * 100) : 0
  }));
}
