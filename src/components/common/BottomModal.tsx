'use client';

import React, { useEffect } from 'react';
import { IconX } from './Icons';

interface BottomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  maxHeightClass?: string;
}

export const BottomModal: React.FC<BottomModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  headerAction,
  maxHeightClass = 'h-[calc(100vh-68px)] max-h-[92vh]',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/72 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Ventana'}
        className={`relative w-full max-w-lg bg-[#1C1C1E] rounded-t-[28px] border border-white/[0.08] shadow-[0_-12px_48px_rgba(0,0,0,.4)] flex flex-col ${maxHeightClass} animate-slide-up z-10 overflow-hidden`}
      >
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-9 h-1 bg-white/25 rounded-full" />
        </div>

        {/* Header */}
        {(title || headerAction) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
            <div>
              {title && <h2 className="text-lg font-bold text-[#F5F5F7] tracking-tight">{title}</h2>}
              {subtitle && <p className="text-xs text-[#8E8E93] mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {headerAction}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors active:scale-95"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
