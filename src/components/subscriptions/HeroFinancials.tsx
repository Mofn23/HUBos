'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { formatCurrency } from '@/lib/utils';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { IconTrendingDown, IconArrowUpRight, IconShield } from '../common/Icons';

interface HeroFinancialsProps {
  monthlyTotal: number;
  annualTotal: number;
  monthlyBudget: number | null;
  activeCount: number;
  potentialSavings: number;
}

export const HeroFinancials: React.FC<HeroFinancialsProps> = ({
  monthlyTotal,
  annualTotal,
  monthlyBudget,
  activeCount,
  potentialSavings,
}) => {
  const currency = useHubStore((s) => s.currency);

  const hasBudget = Boolean(monthlyBudget && monthlyBudget > 0);
  const budgetRatio = hasBudget ? Math.round((monthlyTotal / (monthlyBudget as number)) * 100) : 0;
  const isOverBudget = hasBudget ? monthlyTotal > (monthlyBudget as number) : false;

  return (
    <div className="space-y-3">
      {/* MonAI Ultra-Minimal Hero Card */}
      <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#0A84FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-1.5">
          Gasto Mensual en Suscripciones
        </div>

        <div className="text-3xl sm:text-4xl font-black text-[#F5F5F7] tracking-tight">
          <AnimatedNumber
            value={monthlyTotal}
            formatter={(v) => formatCurrency(v, currency)}
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-[#8E8E93]">
            Proyección anual:{' '}
            <strong className="text-[#F5F5F7]">
              {formatCurrency(annualTotal, currency)}
            </strong>
          </span>
          <span className="text-[10px] font-bold bg-[#0A84FF]/15 text-[#0A84FF] px-2 py-0.5 rounded-full">
            {activeCount} activas
          </span>
        </div>

        {/* Budget Progress if defined */}
        {hasBudget && (
          <div className="w-full mt-4 pt-3 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8E8E93]">Presupuesto Mensual</span>
              <span className={isOverBudget ? 'text-[#E8505B] font-bold' : 'text-[#34C759] font-bold'}>
                {budgetRatio}% ({formatCurrency(monthlyBudget || 0, currency)})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#2A2A2C] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isOverBudget
                    ? 'bg-[#E8505B]'
                    : budgetRatio > 80
                    ? 'bg-[#FF9500]'
                    : 'bg-[#34C759]'
                }`}
                style={{ width: `${Math.min(budgetRatio, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
