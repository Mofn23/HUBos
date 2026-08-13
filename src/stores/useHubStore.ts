import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AppModule = 'hub' | 'recomp' | 'subs';

export interface HubQuickAction {
  id: string;
  title: string;
  app: AppModule;
  icon: string;
  actionPayload?: string;
}

interface HubState {
  currentApp: AppModule;
  setCurrentApp: (app: AppModule) => void;
  
  // Gemini AI Global Config
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  
  // User Profile & System
  userName: string;
  setUserName: (name: string) => void;
  currency: string;
  setCurrency: (curr: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  
  // Fast switcher & UI
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isQuickAiPromptOpen: boolean;
  setIsQuickAiPromptOpen: (open: boolean) => void;

  // Active toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const DEFAULT_GEMINI_KEY =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  (typeof window !== 'undefined' ? localStorage.getItem('hubos_gemini_key') || '' : '');

export const useHubStore = create<HubState>()(
  persist(
    (set) => ({
      currentApp: 'hub',
      setCurrentApp: (app) => set({ currentApp: app }),
      
      geminiApiKey: DEFAULT_GEMINI_KEY,
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      
      userName: 'Samuel',
      setUserName: (name) => set({ userName: name }),
      currency: 'COP',
      setCurrency: (curr) => set({ currency: curr }),
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      
      isSettingsOpen: false,
      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
      isQuickAiPromptOpen: false,
      setIsQuickAiPromptOpen: (open) => set({ isQuickAiPromptOpen: open }),

      toastMessage: null,
      showToast: (msg) => {
        set({ toastMessage: msg });
        setTimeout(() => {
          set((state) => (state.toastMessage === msg ? { toastMessage: null } : {}));
        }, 3000);
      },
    }),
    {
      name: 'hubos_main_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
