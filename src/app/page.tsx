'use client';

import React, { useEffect } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useSubsStore } from '@/stores/useSubsStore';
import { HubDashboard } from '@/components/hub/HubDashboard';
import { HubSettingsSheet } from '@/components/hub/HubSettingsSheet';
import { HubQuickPromptSheet } from '@/components/hub/HubQuickPromptSheet';
import { RecompView } from '@/components/recomp/RecompView';
import { SubscriptionsView } from '@/components/subscriptions/SubscriptionsView';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { AesthetixView } from '@/components/aesthetix/AesthetixView';
import { useRecompStore } from '@/stores/useRecompStore';
import { useScheduleStore } from '@/stores/useScheduleStore';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { nativeStorage } from '@/lib/nativeStorage';
import { ToastNotification } from '@/components/common/ToastNotification';
import { checkAndNotifyUpcomingSubscriptions } from '@/lib/notifications';

export default function Home() {
  const { currentApp, currency, notificationsEnabled } = useHubStore();
  const { subscriptions } = useSubsStore();

  useEffect(() => {
    if (notificationsEnabled && subscriptions.length > 0) {
      checkAndNotifyUpcomingSubscriptions(subscriptions, currency);
    }
  }, [notificationsEnabled, subscriptions, currency]);

  // Flush all stores to native iOS UserDefaults the moment app is backgrounded or minimized
  useEffect(() => {
    const flushAll = async () => {
      try {
        const recompState = useRecompStore.getState();
        const hubState = useHubStore.getState();
        const subsState = useSubsStore.getState();
        const scheduleState = useScheduleStore.getState();
        const aesthetixState = useAesthetixStore.getState();

        await Promise.allSettled([
          nativeStorage.setItem('hubos_recomp_v1', JSON.stringify({ state: recompState, version: 0 })),
          nativeStorage.setItem('hubos_main_v1', JSON.stringify({ state: hubState, version: 0 })),
          nativeStorage.setItem('hubos_subs_v1', JSON.stringify({ state: subsState, version: 0 })),
          nativeStorage.setItem('hubos_schedule_store_v1', JSON.stringify({ state: scheduleState, version: 0 })),
          nativeStorage.setItem('hubos_aesthetix_v1', JSON.stringify({ state: aesthetixState, version: 0 })),
        ]);
      } catch (err) {
        console.warn('[Lifecycle] Error during emergency flush:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushAll();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', flushAll);

    let removeListener: (() => void) | null = null;
    import('@capacitor/app')
      .then(({ App }) => {
        App.addListener('appStateChange', (state) => {
          if (!state.isActive) {
            flushAll();
          }
        }).then((handle) => {
          removeListener = () => handle.remove();
        });
      })
      .catch(() => {});

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', flushAll);
      if (removeListener) removeListener();
    };
  }, []);

  return (
    <main className="relative w-full h-full flex flex-col bg-[#131313] text-[#F5F5F7] overflow-hidden">
      {/* Toast Notification Container */}
      <ToastNotification />

      {/* Main View Transition Switcher (0ms Latency) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentApp === 'hub' && <HubDashboard />}
        {currentApp === 'recomp' && <RecompView />}
        {currentApp === 'subs' && <SubscriptionsView />}
        {currentApp === 'schedule' && <ScheduleView />}
        {currentApp === 'aesthetix' && <AesthetixView />}
      </div>

      {/* Global Bottom Sheets & Modals */}
      <HubSettingsSheet />
      <HubQuickPromptSheet />
    </main>
  );
}
