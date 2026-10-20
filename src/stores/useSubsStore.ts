import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nativeStorage } from '@/lib/nativeStorage';
import { getTodayKey } from '@/lib/date';

export type SubFrequency = 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
export type SubTab = 'all' | 'timeline';

export interface SubscriptionItem {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  frequency: SubFrequency;
  billingDay: number; // 1-31
  provider?: string;
  category: string;
  cancelUrl?: string;
  cancelSteps?: string;
  notes?: string;
  reminderDays: number; // e.g. 3, 1, 0
  status: 'active' | 'paused' | 'canceled';
  lastPaidDate?: string; // YYYY-MM-DD
  nextBillingDate?: string; // YYYY-MM-DD
  tags: string[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  subscriptionId: string;
  name: string;
  amount: number;
  paidDate: string; // YYYY-MM-DD
}

interface SubsState {
  currentTab: SubTab;
  setCurrentTab: (tab: SubTab) => void;

  monthlyBudget: number | null;
  setMonthlyBudget: (budget: number | null) => void;

  subscriptions: SubscriptionItem[];
  addSubscription: (sub: Omit<SubscriptionItem, 'id' | 'createdAt'>) => void;
  updateSubscription: (id: string, sub: Partial<SubscriptionItem>) => void;
  deleteSubscription: (id: string) => void;
  paySubscription: (id: string) => void;

  paymentHistory: PaymentRecord[];
  categories: string[];
  addCategory: (cat: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Streaming',
  'IA & Software',
  'Fitness & Salud',
  'Cloud & Almacenamiento',
  'Juegos',
  'Productividad',
  'Música',
  'Servicios',
];

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function advanceBillingDate(date: Date, frequency: SubFrequency, billingDay: number): Date {
  const next = new Date(date);
  if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
    return next;
  }

  const months = frequency === 'bimonthly' ? 2 : frequency === 'quarterly' ? 3 : frequency === 'yearly' ? 12 : 1;
  const targetMonth = new Date(next.getFullYear(), next.getMonth() + months, 1, 12);
  const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
  return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), Math.min(billingDay || date.getDate(), lastDay), 12);
}

function getNextBillingDate(sub: SubscriptionItem, todayKey: string): string {
  const today = parseDateKey(todayKey);
  if (sub.nextBillingDate) {
    let next = advanceBillingDate(parseDateKey(sub.nextBillingDate), sub.frequency, sub.billingDay);
    while (next <= today) next = advanceBillingDate(next, sub.frequency, sub.billingDay);
    return toDateKey(next);
  }

  if (sub.frequency === 'weekly') return toDateKey(advanceBillingDate(today, 'weekly', sub.billingDay));

  const anchor = parseDateKey(sub.createdAt.slice(0, 10));
  const monthInterval = sub.frequency === 'bimonthly' ? 2 : sub.frequency === 'quarterly' ? 3 : sub.frequency === 'yearly' ? 12 : 1;
  let due = new Date(today.getFullYear(), anchor.getMonth(), Math.min(sub.billingDay || anchor.getDate(), new Date(today.getFullYear(), anchor.getMonth() + 1, 0).getDate()), 12);
  while (due < today) {
    const next = new Date(due.getFullYear(), due.getMonth() + monthInterval, 1, 12);
    due = new Date(next.getFullYear(), next.getMonth(), Math.min(sub.billingDay || anchor.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()), 12);
  }
  if (due.getTime() === today.getTime()) due = advanceBillingDate(due, sub.frequency, sub.billingDay);
  return toDateKey(due);
}

const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub-chatgpt',
    name: 'ChatGPT Plus',
    emoji: '🤖',
    amount: 85000,
    frequency: 'monthly',
    billingDay: 18,
    provider: 'OpenAI',
    category: 'IA & Software',
    cancelUrl: 'https://chat.openai.com/#settings/subscription',
    cancelSteps: 'Ve a Configuración > Suscripción > Cancelar Plan',
    notes: 'Modelo GPT-4o y voz avanzada',
    reminderDays: 3,
    status: 'active',
    tags: ['#ia', '#productividad'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-spotify',
    name: 'Spotify Premium',
    emoji: '🎵',
    amount: 18900,
    frequency: 'monthly',
    billingDay: 25,
    provider: 'Spotify AB',
    category: 'Música',
    cancelUrl: 'https://www.spotify.com/account/overview/',
    cancelSteps: 'Entra a tu Cuenta en la web > Planes disponibles > Cancelar Premium',
    notes: 'Plan individual sin anuncios',
    reminderDays: 1,
    status: 'active',
    tags: ['#musica', '#streaming'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-icloud',
    name: 'iCloud+ 200GB',
    emoji: '☁️',
    amount: 12900,
    frequency: 'monthly',
    billingDay: 5,
    provider: 'Apple',
    category: 'Cloud & Almacenamiento',
    cancelUrl: 'https://appleid.apple.com',
    cancelSteps: 'Ajustes de iPhone > ID de Apple > Suscripciones > iCloud+ > Cancelar plan',
    notes: 'Respaldo de fotos y HUBos IPA storage',
    reminderDays: 3,
    status: 'active',
    tags: ['#apple', '#backup'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-gym',
    name: 'SmartFit Black',
    emoji: '🏋️',
    amount: 99900,
    frequency: 'monthly',
    billingDay: 10,
    provider: 'Smart Fit',
    category: 'Fitness & Salud',
    cancelUrl: 'https://www.smartfit.com.co/area-cliente',
    cancelSteps: 'Portal de cliente > Mi Plan > Solicitud de cancelación con 30 días de antelación',
    notes: 'Acceso a todas las sedes para RecompAI',
    reminderDays: 3,
    status: 'active',
    tags: ['#gimnasio', '#salud'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-youtube',
    name: 'YouTube Premium',
    emoji: '📺',
    amount: 20900,
    frequency: 'monthly',
    billingDay: 28,
    provider: 'Google',
    category: 'Streaming',
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    cancelSteps: 'Menú Perfil > Compras y membresías > Administrar > Desactivar',
    notes: 'Sin anuncios y reproducción en segundo plano',
    reminderDays: 3,
    status: 'active',
    tags: ['#video', '#streaming'],
    createdAt: new Date().toISOString(),
  },
];

export const useSubsStore = create<SubsState>()(
  persist(
    (set) => ({
      currentTab: 'all',
      setCurrentTab: (tab) => set({ currentTab: tab }),

      monthlyBudget: 300000,
      setMonthlyBudget: (budget) => set({ monthlyBudget: budget }),

      subscriptions: INITIAL_SUBSCRIPTIONS,

      addSubscription: (sub) =>
        set((state) => ({
          subscriptions: [
            ...state.subscriptions,
            {
              ...sub,
              id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateSubscription: (id, updated) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) => (s.id === id ? { ...s, ...updated } : s)),
        })),

      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),

      paySubscription: (id) => {
        const todayStr = getTodayKey();
        set((state) => {
          const sub = state.subscriptions.find((s) => s.id === id);
          if (!sub || sub.lastPaidDate === todayStr) return state;

          const paymentRecord: PaymentRecord = {
            id: `pay-${Date.now()}`,
            subscriptionId: id,
            name: sub.name,
            amount: sub.amount,
            paidDate: todayStr,
          };

          return {
            subscriptions: state.subscriptions.map((s) =>
              s.id === id ? { ...s, lastPaidDate: todayStr, nextBillingDate: getNextBillingDate(s, todayStr) } : s
            ),
            paymentHistory: [paymentRecord, ...state.paymentHistory],
          };
        });
      },

      paymentHistory: [],
      categories: DEFAULT_CATEGORIES,
      addCategory: (cat) =>
        set((state) =>
          state.categories.includes(cat) ? state : { categories: [...state.categories, cat] }
        ),
    }),
    {
      name: 'hubos_subs_v1',
      storage: createJSONStorage(() => nativeStorage),
      partialize: (state) => ({
        monthlyBudget: state.monthlyBudget,
        subscriptions: state.subscriptions,
        paymentHistory: state.paymentHistory,
        categories: state.categories,
      }),
    }
  )
);
