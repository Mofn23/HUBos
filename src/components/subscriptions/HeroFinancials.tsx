'use client';

import React from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { formatCurrency } from '@/lib/utils';
import { AnimatedNumber } from '../common/AnimatedNumber';

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
}) => {
  const currency = useHubStore((s) => s.currency);

  const hasBudget = Boolean(monthlyBudget && monthlyBudget > 0);
  const budgetRatio = hasBudget ? Math.round((monthlyTotal / (monthlyBudget as number)) * 100) : 0;
  const isOverBudget = hasBudget ? monthlyTotal > (monthlyBudget as number) : false;

  return (
    <div className="space-y-3">
      {/* Apple Fitness Hero Card */}
      <div className="fitness-card-elevated rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/[0.08]">
        {/* Subtle accent glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#BF5AF2]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E93] mb-1.5">
          Gasto Mensual en Suscripciones
        </div>

        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          <AnimatedNumber
            value={monthlyTotal}
            formatter={(v) => formatCurrency(v, currency)}
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-[#8E8E93]">
            Proyección anual:{' '}
            <strong className="text-white">
              {formatCurrency(annualTotal, currency)}
            </strong>
          </span>
          <span className="text-[10px] font-bold bg-[#BF5AF2]/15 text-[#BF5AF2] border border-[#BF5AF2]/30 px-2.5 py-0.5 rounded-full">
            {activeCount} activas
          </span>
        </div>

        {/* Budget Progress if defined */}
        {hasBudget && (
          <div className="w-full mt-4 pt-3 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8E8E93]">Presupuesto Mensual</span>
              <span className={isOverBudget ? 'text-[#FA114F] font-bold' : 'text-[#A1F524] font-bold'}>
                {budgetRatio}% ({formatCurrency(monthlyBudget || 0, currency)})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#2C2C2E] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isOverBudget
                    ? 'bg-[#FA114F]'
                    : budgetRatio > 80
                    ? 'bg-[#FFD60A]'
                    : 'bg-[#A1F524]'
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
