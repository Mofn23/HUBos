'use client';

import React from 'react';
import { useHubStore, AppModule } from '@/stores/useHubStore';
import {
  IconHome,
  IconZap,
  IconActivity,
  IconCreditCard,
  IconCalendar,
  IconSparkles,
} from '../common/Icons';

export const FloatingHubBar: React.FC = () => {
  const { currentApp, setCurrentApp, setIsQuickAiPromptOpen } = useHubStore();

  const navItems: { id: AppModule; label: string; icon: React.FC<{ className?: string }>; accent: string }[] = [
    { id: 'hub', label: 'HUB', icon: IconHome, accent: '#FFFFFF' },
    { id: 'aesthetix', label: 'Gym', icon: IconZap, accent: '#FA114F' },
    { id: 'recomp', label: 'Recomp', icon: IconActivity, accent: '#A1F524' },
    { id: 'subs', label: 'Finanzas', icon: IconCreditCard, accent: '#BF5AF2' },
    { id: 'schedule', label: 'Horarios', icon: IconCalendar, accent: '#00F0FF' },
  ];

  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="fitness-glass-dock px-2.5 py-1.5 rounded-full flex items-center gap-1 pointer-events-auto border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentApp === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentApp(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all duration-150 fitness-press ${
                isActive
                  ? 'bg-[#2C2C2E] text-white shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
              style={{
                color: isActive ? item.accent : undefined,
              }}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'drop-shadow-[0_0_6px_currentColor]' : 'text-[#8E8E93]'
                }`}
              />
              <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
            </button>
          );
        })}

        <div className="w-[1px] h-4 bg-white/15 mx-0.5" />

        {/* Quick AI Trigger */}
        <button
          onClick={() => setIsQuickAiPromptOpen(true)}
          className="w-8 h-8 rounded-full bg-[#A1F524] text-black flex items-center justify-center shadow-[0_0_12px_rgba(161,245,36,0.4)] fitness-press transition-transform hover:scale-105 active:scale-95"
          title="Comando IA Rápido"
        >
          <IconSparkles className="w-4 h-4 text-black fill-black/20" />
        </button>
      </nav>
    </div>
  );
};

