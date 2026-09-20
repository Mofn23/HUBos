'use client';

import React from 'react';
import { useHubStore, AppModule } from '@/stores/useHubStore';
import { IconHome, IconDumbbell, IconCreditCard, IconSparkles } from '../common/Icons';

export const FloatingHubBar: React.FC = () => {
  const { currentApp, setCurrentApp, setIsQuickAiPromptOpen } = useHubStore();

  const navItems: { id: AppModule; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'hub', label: 'HUB', icon: IconHome },
    { id: 'recomp', label: 'RecompAI', icon: IconDumbbell },
    { id: 'subs', label: 'Suscripciones', icon: IconCreditCard },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="clay-surface-elevated px-3 py-2 rounded-full shadow-2xl flex items-center gap-1.5 pointer-events-auto border border-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentApp === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentApp(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-black transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'clay-btn-primary text-white'
                  : 'text-[#8E8E93] hover:text-[#F5F5F7]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8E8E93]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="w-[1px] h-5 bg-white/15 mx-1" />

        {/* Quick AI Trigger */}
        <button
          onClick={() => setIsQuickAiPromptOpen(true)}
          className="w-8 h-8 rounded-full clay-btn-emerald flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
          title="Comando IA Rápido"
        >
          <IconSparkles className="w-4 h-4 text-white fill-white/20" />
        </button>
      </div>
    </div>
  );
};
