'use client';

import React, { useEffect, useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { IconCheck } from './Icons';

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

  const isPr = toastMessage.includes('Récord') || toastMessage.includes('PR') || toastMessage.includes('🏆');
  const isCancelOrError = toastMessage.includes('cancelado') || toastMessage.includes('eliminad') || toastMessage.includes('denegad');

  return (
    <div
      key={toastKey}
      className="fixed inset-x-0 z-[99999] flex justify-center px-4 pointer-events-none transition-all duration-300 animate-slide-down"
      style={{ top: 'calc(env(safe-area-inset-top, 24px) + 12px)' }}
    >
      <div
        className={`pointer-events-auto relative max-w-sm w-full p-3.5 pb-4.5 rounded-[22px] border shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 overflow-hidden ${
          isPr
            ? 'bg-[#1C1A14]/95 border-[#FFD60A]/40 text-[#FFD60A] shadow-[0_10px_35px_rgba(255,214,10,0.25)]'
            : isCancelOrError
            ? 'bg-[#1C1415]/95 border-[#FF453A]/30 text-[#FF453A] shadow-[0_10px_35px_rgba(255,69,58,0.2)]'
            : 'bg-[#141A16]/95 border-[#34C759]/30 text-[#34C759] shadow-[0_10px_35px_rgba(52,199,89,0.2)]'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black shadow-sm ${
              isPr
                ? 'bg-[#FFD60A] text-black shadow-[0_0_12px_rgba(255,214,10,0.6)]'
                : isCancelOrError
                ? 'bg-[#FF453A] text-white'
                : 'bg-[#34C759] text-black'
            }`}
          >
            {isPr ? '🏆' : isCancelOrError ? '✕' : <IconCheck className="w-3.5 h-3.5 stroke-[3]" />}
          </div>

          <p className="text-xs font-black text-[#F5F5F7] tracking-tight leading-snug break-words flex-1">
            {toastMessage}
          </p>
        </div>

        <button
          onClick={dismissToast}
          className="w-6 h-6 rounded-full glass-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white shrink-0 active:scale-90 transition-all"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>

        {/* Decreasing countdown progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className={`h-full animate-shrink-width ${
              isPr ? 'bg-[#FFD60A]' : isCancelOrError ? 'bg-[#FF453A]' : 'bg-[#34C759]'
            }`}
            style={{ animationDuration: '3500ms' }}
          />
        </div>
      </div>
    </div>
  );
};
