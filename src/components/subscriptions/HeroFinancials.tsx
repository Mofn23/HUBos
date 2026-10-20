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
      {/* Fitness-inspired financial summary */}
      <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">

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
          <span className="text-[10px] font-bold bg-[#2C2C2E] border border-white/5 text-[#FF375F] px-2.5 py-0.5 rounded-full">
            {activeCount} activas
          </span>
        </div>

        {/* Budget Progress if defined */}
        {hasBudget && (
          <div className="w-full mt-4 pt-3 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8E8E93]">Presupuesto Mensual</span>
              <span className={isOverBudget ? 'text-[#DC2626] font-bold' : 'text-[#FF375F] font-bold'}>
                {budgetRatio}% ({formatCurrency(monthlyBudget || 0, currency)})
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#2C2C2E] border border-white/5 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isOverBudget
                    ? 'bg-[#DC2626]'
                    : budgetRatio > 80
                    ? 'bg-[#D97706]'
                    : 'bg-[#FF375F]'
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
