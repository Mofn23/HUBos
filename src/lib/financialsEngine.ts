import { SubscriptionItem, SubFrequency } from '@/stores/useSubsStore';

export function getMonthlyEquivalent(amount: number, frequency: SubFrequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * 4.3333;
    case 'bimonthly':
      return amount / 2;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / 12;
    case 'monthly':
    default:
      return amount;
  }
}

export function getAnnualEquivalent(amount: number, frequency: SubFrequency): number {
  return getMonthlyEquivalent(amount, frequency) * 12;
}

export interface FinancialSummary {
  monthlyTotal: number;
  annualTotal: number;
  activeCount: number;
  pausedCount: number;
  categoryBreakdown: { category: string; monthlyAmount: number; percentage: number; count: number }[];
  nextUpcomingSub: { sub: SubscriptionItem; daysRemaining: number } | null;
  potentialMonthlySavings: number;
}

export function calculateFinancialSummary(subscriptions: SubscriptionItem[]): FinancialSummary {
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const pausedSubs = subscriptions.filter((s) => s.status === 'paused');

  let monthlyTotal = 0;
  let annualTotal = 0;
  const catMap: Record<string, { amount: number; count: number }> = {};

  const today = new Date();
  const currentDay = today.getDate();

  let nextUpcomingSub: { sub: SubscriptionItem; daysRemaining: number } | null = null;
  let minDays = 999;

  for (const sub of activeSubs) {
    const m = getMonthlyEquivalent(sub.amount, sub.frequency);
    monthlyTotal += m;
    annualTotal += getAnnualEquivalent(sub.amount, sub.frequency);

    const cat = sub.category || 'Otros';
    if (!catMap[cat]) {
      catMap[cat] = { amount: 0, count: 0 };
    }
    catMap[cat].amount += m;
    catMap[cat].count += 1;

    // Calculate days remaining to next billing
    let daysRemaining = sub.billingDay - currentDay;
    if (daysRemaining < 0) {
      // It will bill next month (approx 30 days)
      daysRemaining += 30;
    }

    if (daysRemaining < minDays) {
      minDays = daysRemaining;
      nextUpcomingSub = { sub, daysRemaining };
    }
  }

  // Category breakdown
  const categoryBreakdown = Object.keys(catMap).map((cat) => {
    const info = catMap[cat];
    return {
      category: cat,
      monthlyAmount: info.amount,
      percentage: monthlyTotal > 0 ? (info.amount / monthlyTotal) * 100 : 0,
      count: info.count,
    };
  }).sort((a, b) => b.monthlyAmount - a.monthlyAmount);

  // Potential savings from paused or high cost services
  const potentialMonthlySavings = pausedSubs.reduce(
    (acc, sub) => acc + getMonthlyEquivalent(sub.amount, sub.frequency),
    0
  );

  return {
    monthlyTotal,
    annualTotal,
    activeCount: activeSubs.length,
    pausedCount: pausedSubs.length,
    categoryBreakdown,
    nextUpcomingSub,
    potentialMonthlySavings,
  };
}

export function getAutoEmoji(name: string = '', category: string = ''): string {
  const q = `${name} ${category}`.toLowerCase();

  if (q.includes('netflix') || q.includes('disney') || q.includes('hbo') || q.includes('max') || q.includes('prime') || q.includes('movie')) return '🎬';
  if (q.includes('spotify') || q.includes('apple music') || q.includes('deezer') || q.includes('tidal') || q.includes('music') || q.includes('cancion')) return '🎵';
  if (q.includes('youtube') || q.includes('twitch') || q.includes('video') || q.includes('stream')) return '📺';
  if (q.includes('chatgpt') || q.includes('openai') || q.includes('claude') || q.includes('gemini') || q.includes('midjourney') || q.includes('ai') || q.includes('copilot')) return '🤖';
  if (q.includes('icloud') || q.includes('drive') || q.includes('dropbox') || q.includes('onedrive') || q.includes('storage') || q.includes('nube')) return '☁️';
  if (q.includes('gym') || q.includes('smartfit') || q.includes('fitness') || q.includes('salud') || q.includes('whoop') || q.includes('strava')) return '🏋️';
  if (q.includes('playstation') || q.includes('xbox') || q.includes('game pass') || q.includes('nintendo') || q.includes('steam')) return '🎮';
  if (q.includes('notion') || q.includes('github') || q.includes('figma') || q.includes('cursor') || q.includes('slack')) return '⚡';
  if (q.includes('internet') || q.includes('claro') || q.includes('tigo') || q.includes('movistar') || q.includes('fibra')) return '🌐';
  if (q.includes('uber') || q.includes('didi') || q.includes('rappi') || q.includes('delivery')) return '🛵';

  return '💳';
}
