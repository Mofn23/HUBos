'use client';

import React, { useEffect } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useSubsStore } from '@/stores/useSubsStore';
import { HubDashboard } from '@/components/hub/HubDashboard';
import { HubSettingsSheet } from '@/components/hub/HubSettingsSheet';
import { HubQuickPromptSheet } from '@/components/hub/HubQuickPromptSheet';
import { RecompView } from '@/components/recomp/RecompView';
import { SubscriptionsView } from '@/components/subscriptions/SubscriptionsView';
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

  return (
    <main className="relative w-full h-full flex flex-col bg-[#131313] text-[#F5F5F7] overflow-hidden">
      {/* Toast Notification Container */}
      <ToastNotification />

      {/* Main View Transition Switcher (0ms Latency) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentApp === 'hub' && <HubDashboard />}
        {currentApp === 'recomp' && <RecompView />}
        {currentApp === 'subs' && <SubscriptionsView />}
      </div>

      {/* Global Bottom Sheets & Modals */}
      <HubSettingsSheet />
      <HubQuickPromptSheet />
    </main>
  );
}
