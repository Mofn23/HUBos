'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type NotificationTone = 'success' | 'warning' | 'error' | 'info' | 'achievement';

interface ToneStyle {
  accent: string;
  badge: string;
  text: string;
  glow: string;
}

const TONES: Record<NotificationTone, ToneStyle> = {
  success: {
    accent: '#A1F524',
    badge: 'bg-[#A1F524]/15 text-[#A1F524]',
    text: 'text-[#A1F524]',
    glow: 'shadow-[0_18px_45px_-24px_rgba(161,245,36,0.65)]',
  },
  warning: {
    accent: '#FFD60A',
    badge: 'bg-[#FFD60A]/15 text-[#FFD60A]',
    text: 'text-[#FFD60A]',
    glow: 'shadow-[0_18px_45px_-24px_rgba(255,214,10,0.6)]',
  },
  error: {
    accent: '#FF453A',
    badge: 'bg-[#FF453A]/15 text-[#FF453A]',
    text: 'text-[#FF453A]',
    glow: 'shadow-[0_18px_45px_-24px_rgba(255,69,58,0.6)]',
  },
  info: {
    accent: '#0A84FF',
    badge: 'bg-[#0A84FF]/15 text-[#64D2FF]',
    text: 'text-[#64D2FF]',
    glow: 'shadow-[0_18px_45px_-24px_rgba(10,132,255,0.6)]',
  },
  achievement: {
    accent: '#FFD60A',
    badge: 'bg-[#FFD60A]/15 text-[#FFD60A]',
    text: 'text-[#FFD60A]',
    glow: 'shadow-[0_18px_45px_-24px_rgba(255,214,10,0.7)]',
  },
};

interface InAppNotificationProps {
  tone: NotificationTone;
  icon: React.ReactNode;
  title: string;
  message?: string;
  eyebrow?: string;
  onClose: () => void;
  durationMs: number;
  closeLabel?: string;
}

/**
 * Tarjeta única para todas las notificaciones dentro de la app.
 * Sigue el lenguaje de Apple Fitness: superficie #1C1C1E translúcida, borde
 * tenue, acento cromático por tipo y una línea de tiempo que se agota.
 */
export function InAppNotification({
  tone,
  icon,
  title,
  message,
  eyebrow,
  onClose,
  durationMs,
  closeLabel = 'Cerrar notificación',
}: InAppNotificationProps) {
  const style = TONES[tone];

  return (
    <div
      className="fixed inset-x-0 z-[99999] flex justify-center px-4 pointer-events-none animate-notification-in motion-reduce:animate-none"
      style={{ top: 'calc(env(safe-area-inset-top, 20px) + 10px)' }}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[22px] border border-white/10 bg-[#1C1C1E]/95 backdrop-blur-2xl',
          style.glow
        )}
      >
        <div className="flex items-start gap-3 p-3.5">
          <span
            className={cn(
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base',
              style.badge
            )}
            aria-hidden="true"
          >
            {icon}
          </span>

          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className={cn('text-[9px] font-black uppercase tracking-[0.14em]', style.text)}>
                {eyebrow}
              </p>
            )}
            <p className="text-[13px] font-black leading-snug tracking-tight text-[#F5F5F7] break-words">
              {title}
            </p>
            {message && (
              <p className="mt-0.5 text-[11px] font-semibold leading-snug text-[#8E8E93] break-words">
                {message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#2C2C2E] text-[11px] font-bold text-[#8E8E93] transition-colors duration-150 hover:text-white active:scale-90 motion-reduce:active:scale-100 motion-reduce:transition-none"
          >
            ✕
          </button>
        </div>

        <div className="h-[2px] w-full bg-white/[0.06]">
          <div
            className="h-full animate-shrink-width motion-reduce:animate-none"
            style={{ backgroundColor: style.accent, animationDuration: `${durationMs}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
