'use client';

import React from 'react';

interface AppleFitnessBentoCardsProps {
  sessions: number;
  totalVolumeKg: number;
  streak: number;
}

export const AppleFitnessBentoCards: React.FC<AppleFitnessBentoCardsProps> = ({
  sessions,
  totalVolumeKg,
  streak,
}) => {
  const cards = [
    { icon: '🏋️', value: sessions.toLocaleString('es-CO'), label: 'Entrenos registrados', color: '#FFD60A' },
    { icon: '⚖️', value: `${Math.round(totalVolumeKg).toLocaleString('es-CO')} kg`, label: 'Volumen registrado', color: '#00F0FF' },
    { icon: '🔥', value: `${streak} días`, label: 'Racha actual', color: '#A1F524' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cards.map((card) => (
        <div key={card.label} className="fitness-card min-w-0 p-3 flex flex-col justify-between shadow-md border border-white/[0.07]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${card.color}22` }}>
            <span className="text-sm">{card.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="text-base font-black text-white leading-tight tracking-tight truncate">{card.value}</div>
            <div className="text-[10px] font-bold text-[#8E8E93] mt-0.5 leading-tight">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
