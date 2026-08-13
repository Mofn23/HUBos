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
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        className={`relative w-full max-w-lg bg-[#18181A] rounded-t-[36px] border-t border-white/10 shadow-2xl flex flex-col ${maxHeightClass} animate-slide-up z-10 overflow-hidden`}
      >
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        {(title || headerAction) && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
            <div>
              {title && <h2 className="text-lg font-bold text-[#F5F5F7] tracking-tight">{title}</h2>}
              {subtitle && <p className="text-xs text-[#8E8E93] mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {headerAction}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#2A2A2C] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors active:scale-95"
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
