'use client';

import React, { useEffect } from 'react';
import { useRecompStore, InAppAlert } from '@/stores/useRecompStore';
import { InAppNotification, type NotificationTone } from './InAppNotification';

function alertIcon(type: InAppAlert['type']) {
  switch (type) {
    case 'sodium':
      return '🧂';
    case 'protein':
      return '🥩';
    case 'creatine':
      return '💊';
    default:
      return '⚡';
  }
}

function alertTone(type: InAppAlert['type']): NotificationTone {
  switch (type) {
    case 'sodium':
      return 'error';
    case 'protein':
      return 'warning';
    case 'creatine':
      return 'info';
    default:
      return 'success';
  }
}

export const AlertToast: React.FC = () => {
  const { alerts, dismissAlert } = useRecompStore();
  const activeAlert = alerts[0];

  useEffect(() => {
    if (activeAlert) {
      const timer = setTimeout(() => {
        dismissAlert(activeAlert.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert, dismissAlert]);

  if (!activeAlert) return null;

  return (
    <InAppNotification
      tone={alertTone(activeAlert.type)}
      icon={alertIcon(activeAlert.type)}
      eyebrow="RecompAI"
      title={activeAlert.title.replace(/^[^\p{L}\p{N}]+/u, '') || activeAlert.title}
      message={activeAlert.message}
      onClose={() => dismissAlert(activeAlert.id)}
      durationMs={5000}
      closeLabel="Cerrar alerta"
    />
  );
};
