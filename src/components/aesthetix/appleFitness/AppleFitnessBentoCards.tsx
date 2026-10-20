'use client';

import React from 'react';

interface AppleFitnessBentoCardsProps {
  stepsOrVolume?: string;
  distanceOrStreak?: string;
  flightsOrRank?: string;
}

export const AppleFitnessBentoCards: React.FC<AppleFitnessBentoCardsProps> = ({
  stepsOrVolume = '9,953',
  distanceOrStreak = '7.6 KM',
  flightsOrRank = '6',
}) => {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {/* 1. Steps / Volume Card */}
      <div className="fitness-card p-3 flex flex-col justify-between shadow-md border border-white/[0.07] hover:border-white/15 transition-all">
        <div className="w-8 h-8 rounded-full bg-[#FFD60A]/15 flex items-center justify-center mb-2 shadow-[0_0_12px_rgba(255,214,10,0.15)]">
          {/* Footprints icon */}
          <span className="text-sm">👣</span>
        </div>
        <div>
          <div className="text-base font-black text-white leading-tight tracking-tight">
            {stepsOrVolume}
          </div>
          <div className="text-[10px] font-bold text-[#8E8E93] mt-0.5">
            Steps
          </div>
        </div>
      </div>

      {/* 2. Distance / Streak Card */}
      <div className="fitness-card p-3 flex flex-col justify-between shadow-md border border-white/[0.07] hover:border-white/15 transition-all">
        <div className="w-8 h-8 rounded-full bg-[#00F0FF]/15 flex items-center justify-center mb-2 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
          {/* Map / Route icon */}
          <span className="text-sm">🗺️</span>
        </div>
        <div>
          <div className="text-base font-black text-white leading-tight tracking-tight">
            {distanceOrStreak}
          </div>
          <div className="text-[10px] font-bold text-[#8E8E93] mt-0.5">
            Distance
          </div>
        </div>
      </div>

      {/* 3. Flights / Sessions Card */}
      <div className="fitness-card p-3 flex flex-col justify-between shadow-md border border-white/[0.07] hover:border-white/15 transition-all">
        <div className="w-8 h-8 rounded-full bg-[#A1F524]/15 flex items-center justify-center mb-2 shadow-[0_0_12px_rgba(161,245,36,0.15)]">
          {/* Flights / Runner icon */}
          <span className="text-sm">🏃</span>
        </div>
        <div>
          <div className="text-base font-black text-white leading-tight tracking-tight">
            {flightsOrRank}
          </div>
          <div className="text-[10px] font-bold text-[#8E8E93] mt-0.5">
            Flights
          </div>
        </div>
      </div>
    </div>
  );
};
