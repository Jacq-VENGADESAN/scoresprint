import { supabaseRest } from "@/lib/supabase-server";

export const FREE_LIMITS = {
  practiceSessionsPerDay: 1,
  miniExamsPerMonth: 1,
  historyDays: 7
} as const;

export type AccessPlan = "free" | "premium";
export type UsageMetric = "practice_session" | "mini_exam";

export type AccessSummary = {
  plan: AccessPlan;
  planCode: string;
  isPremium: boolean;
  accessEndsAt: string | null;
  practice: {
    used: number;
    limit: number | null;
    remaining: number | null;
    periodStart: string;
  };
  miniExam: {
    used: number;
    limit: number | null;
    remaining: number | null;
    periodStart: string;
  };
  historyDays: number | null;
};

type SubscriptionRow = {
  plan_code: string;
  status: "inactive" | "active" | "past_due" | "cancelled" | "expired";
  access_starts_at: string | null;
  access_ends_at: string | null;
};

type UsageRow = {
  metric: UsageMetric;
  period_start: string;
  usage_count: number;
};

type ConsumeRow = {
  allowed: boolean;
  usage_count: number;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function currentUsagePeriods(now = new Date()) {
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return {
    practice: dateKey(day),
    miniExam: dateKey(month)
  };
}

function activePremiumSubscription(rows: SubscriptionRow[], now: Date) {
  return rows.find((row) => {
    if (row.status !== "active") return false;
    if (row.access_starts_at && new Date(row.access_starts_at).getTime() > now.getTime()) return false;
    if (row.access_ends_at && new Date(row.access_ends_at).getTime() <= now.getTime()) return false;
    return row.plan_code !== "free";
  }) ?? null;
}

export async function getAccessSummary(userId: string, now = new Date()): Promise<AccessSummary> {
  const periods = currentUsagePeriods(now);
  const [subscriptions, usageRows] = await Promise.all([
    supabaseRest<SubscriptionRow[]>(
      `subscriptions?select=plan_code,status,access_starts_at,access_ends_at&user_id=eq.${userId}&order=access_ends_at.desc.nullslast,created_at.desc&limit=10`
    ),
    supabaseRest<UsageRow[]>(
      `usage_counters?select=metric,period_start,usage_count&user_id=eq.${userId}&or=(and(metric.eq.practice_session,period_start.eq.${periods.practice}),and(metric.eq.mini_exam,period_start.eq.${periods.miniExam}))`
    )
  ]);

  const premium = activePremiumSubscription(subscriptions, now);
  const practiceUsed = usageRows.find((row) => row.metric === "practice_session" && row.period_start === periods.practice)?.usage_count ?? 0;
  const miniExamUsed = usageRows.find((row) => row.metric === "mini_exam" && row.period_start === periods.miniExam)?.usage_count ?? 0;

  if (premium) {
    return {
      plan: "premium",
      planCode: premium.plan_code,
      isPremium: true,
      accessEndsAt: premium.access_ends_at,
      practice: { used: practiceUsed, limit: null, remaining: null, periodStart: periods.practice },
      miniExam: { used: miniExamUsed, limit: null, remaining: null, periodStart: periods.miniExam },
      historyDays: null
    };
  }

  return {
    plan: "free",
    planCode: "free",
    isPremium: false,
    accessEndsAt: null,
    practice: {
      used: practiceUsed,
      limit: FREE_LIMITS.practiceSessionsPerDay,
      remaining: Math.max(0, FREE_LIMITS.practiceSessionsPerDay - practiceUsed),
      periodStart: periods.practice
    },
    miniExam: {
      used: miniExamUsed,
      limit: FREE_LIMITS.miniExamsPerMonth,
      remaining: Math.max(0, FREE_LIMITS.miniExamsPerMonth - miniExamUsed),
      periodStart: periods.miniExam
    },
    historyDays: FREE_LIMITS.historyDays
  };
}

export async function consumeFreeUsage(metric: UsageMetric, periodStart: string, limit: number) {
  const rows = await supabaseRest<ConsumeRow[]>("rpc/consume_usage_counter", {
    method: "POST",
    body: JSON.stringify({
      p_metric: metric,
      p_period_start: periodStart,
      p_limit: limit
    })
  });
  return rows[0] ?? { allowed: false, usage_count: limit };
}

export function historyCutoffIso(access: AccessSummary, now = new Date()) {
  if (access.historyDays === null) return null;
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - access.historyDays);
  return cutoff.toISOString();
}

export function accessLabel(access: AccessSummary) {
  if (!access.isPremium) return "Gratuit";
  if (access.planCode === "sprint_90") return "Sprint 90 jours";
  if (access.planCode === "sprint_30") return "Sprint 30 jours";
  return "Premium";
}