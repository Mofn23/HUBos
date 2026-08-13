'use client';

import React from 'react';

interface HubLogoProps {
  size?: number;
  className?: string;
}

export const HubLogo: React.FC<HubLogoProps> = ({ size = 48, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-[22%] bg-[#0B0B0D] border border-white/10 shadow-2xl overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-[70%] h-[70%]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle Ambient Radial Glow */}
        <circle cx="50" cy="50" r="38" fill="url(#hub_glow)" opacity="0.15" />

        {/* Central Geometric Interconnected HUB Mark */}
        {/* Left Column */}
        <rect x="22" y="24" width="12" height="52" rx="6" fill="url(#hub_silver)" />
        {/* Right Column */}
        <rect x="66" y="24" width="12" height="52" rx="6" fill="url(#hub_silver)" />
        {/* Horizontal Bridge */}
        <rect x="22" y="44" width="56" height="12" rx="6" fill="url(#hub_silver)" />

        {/* Core Nexus Dot (Emerald / Electric Accent) */}
        <circle cx="50" cy="50" r="5" fill="#34C759" />

        <defs>
          <radialGradient
            id="hub_glow"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(50 50) rotate(90) scale(40)"
          >
            <stop stopColor="#34C759" />
            <stop offset="1" stopColor="#0B0B0D" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="hub_silver" x1="22" y1="24" x2="78" y2="76" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#E2E8F0" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
