'use client';

import React, { useEffect, useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { IconCheck } from './Icons';
import { InAppNotification, type NotificationTone } from './InAppNotification';

export const ToastNotification: React.FC = () => {
  const { toastMessage, dismissToast } = useHubStore();
  const [toastKey, setToastKey] = useState<number>(0);

  useEffect(() => {
    if (toastMessage) {
      setToastKey((k) => k + 1);
      const timer = setTimeout(() => {
        dismissToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, dismissToast]);

  if (!toastMessage) return null;

  const isAchievement = /Récord|PR\b|🏆/.test(toastMessage);
  const isError = /cancelado|eliminad|denegad|error|no se pudo|no se ha podido/i.test(toastMessage);

  const tone: NotificationTone = isAchievement ? 'achievement' : isError ? 'error' : 'success';
  const icon = isAchievement ? '🏆' : isError ? '✕' : <IconCheck className="h-4 w-4 stroke-[3]" />;
  const title = toastMessage.replace(/^[^\p{L}\p{N}]+/u, '');

  return (
    <InAppNotification
      key={toastKey}
      tone={tone}
      icon={icon}
      title={title || toastMessage}
      onClose={dismissToast}
      durationMs={3500}
    />
  );
};
