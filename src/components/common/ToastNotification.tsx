'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { IconCheck } from './Icons';

export const ToastNotification: React.FC = () => {
  const toastMessage = useHubStore((s) => s.toastMessage);

  if (!toastMessage) return null;

  return (
    <div className="fixed top-14 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-[#242426]/95 border border-white/15 text-[#F5F5F7] px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl flex items-center gap-2.5 animate-scale-up">
        <div className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center text-black font-bold">
          <IconCheck className="w-3 h-3 text-black stroke-[3]" />
        </div>
        <span className="text-xs font-semibold tracking-tight">{toastMessage}</span>
      </div>
    </div>
  );
};
