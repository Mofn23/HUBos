'use client';

import React, { useEffect } from 'react';
import { useRecompStore, InAppAlert } from '@/stores/useRecompStore';

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

  const getAlertColor = (type: InAppAlert['type']) => {
    switch (type) {
      case 'sodium':
        return 'border-[#E8505B] bg-[#1C1C1E] text-[#E8505B]';
      case 'protein':
        return 'border-[#FECA57] bg-[#1C1C1E] text-[#FECA57]';
      case 'creatine':
        return 'border-[#54A0FF] bg-[#1C1C1E] text-[#54A0FF]';
      default:
        return 'border-[#34C759] bg-[#1C1C1E] text-[#34C759]';
    }
  };

  return (
    <div
      className="fixed inset-x-0 flex justify-center px-4 pointer-events-none z-[99999] transition-all duration-300"
      style={{ top: 'calc(env(safe-area-inset-top, 20px) + 12px)' }}
    >
      <div
        className={`pointer-events-auto max-w-sm w-full p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-slide-down ${getAlertColor(
          activeAlert.type
        )}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-xl shrink-0">
            {activeAlert.type === 'sodium'
              ? '🧂'
              : activeAlert.type === 'protein'
              ? '🥩'
              : activeAlert.type === 'creatine'
              ? '💊'
              : '⚡'}
          </span>
          <div className="overflow-hidden">
            <h4 className="text-xs font-black text-white truncate">{activeAlert.title}</h4>
            <p className="text-[11px] font-bold opacity-90 truncate">{activeAlert.message}</p>
          </div>
        </div>

        <button
          onClick={() => dismissAlert(activeAlert.id)}
          className="text-xs font-black opacity-70 hover:opacity-100 px-2 py-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
