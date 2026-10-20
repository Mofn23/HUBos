'use client';

import React, { useEffect } from 'react';
import { useRecompStore } from '@/stores/useRecompStore';
import { InAppNotification } from '../common/InAppNotification';

export const AchievementUnlockedToast: React.FC = () => {
  const { recentlyUnlockedAchievement, clearRecentlyUnlockedAchievement } = useRecompStore();

  useEffect(() => {
    if (recentlyUnlockedAchievement) {
      const timer = setTimeout(() => {
        clearRecentlyUnlockedAchievement();
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [recentlyUnlockedAchievement, clearRecentlyUnlockedAchievement]);

  if (!recentlyUnlockedAchievement) return null;

  return (
    <InAppNotification
      tone="achievement"
      icon={recentlyUnlockedAchievement.icon}
      eyebrow="Logro desbloqueado"
      title={recentlyUnlockedAchievement.title}
      message={recentlyUnlockedAchievement.description}
      onClose={clearRecentlyUnlockedAchievement}
      durationMs={6500}
      closeLabel="Cerrar notificación de logro"
    />
  );
};
