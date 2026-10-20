'use client';

import React, { useState } from 'react';
import { MealItem } from '@/stores/useRecompStore';
import { IconPlus } from '../common/Icons';
import { MealDetailModal } from './MealDetailModal';

interface MealLogProps {
  meals: MealItem[];
  onAddMeal: () => void;
  onDeleteMeal: (id: string) => void;
}

export const MealLog: React.FC<MealLogProps> = ({ meals, onAddMeal, onDeleteMeal }) => {
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const totalCalories = meals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0);

  const getCategoryEmoji = (cat?: string) => {
    switch (cat) {
      case 'desayuno':
        return '🥐';
      case 'almuerzo':
        return '🍲';
      case 'cena':
        return '🍽️';
      case 'snack':
      default:
        return '🍎';
    }
  };

  return (
    <div className="mb-8 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="bg-[#1C1C1E] border border-white/[0.08] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span>🍽️</span>
          <span className="text-xs font-black text-white">Comidas de Hoy</span>
        </div>
        <div className="text-xs font-black text-[#8E8E93]">
          Total: <strong className="text-white font-black">{totalCalories} kcal</strong>
        </div>
      </div>

      {/* Empty State or Meal List */}
      {meals.length === 0 ? (
        <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-3xl p-8 text-center space-y-3.5 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2C2C2E] border border-white/5 flex items-center justify-center text-3xl shadow-inner">
            🍽️
          </div>
          <div className="space-y-1">
            <span className="text-sm font-black text-white block">
              No has registrado comidas hoy
            </span>
            <span className="text-xs font-bold text-[#8E8E93] block">
              Toca para tomar foto o describir tu comida con Gemini
            </span>
          </div>
          <button
            className="px-5 py-3 rounded-full bg-[#A1F524] text-black font-black text-xs flex items-center gap-1.5 fitness-press shadow-md shadow-[#A1F524]/20 mt-1"
            onClick={onAddMeal}
          >
            <IconPlus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Comida</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {meals.map((meal) => {
            const emoji = getCategoryEmoji(meal.category);
            const hasPhoto = !!(meal.imageUrl || meal.imageBase64);

            return (
              <div
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className="bg-[#1C1C1E] border border-white/[0.08] rounded-2xl p-3.5 flex items-center justify-between shadow-sm cursor-pointer hover:border-white/20 fitness-press transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-[#2C2C2E] border border-white/5 flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                    {hasPhoto ? (
                      <img
                        src={meal.imageUrl || meal.imageBase64}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{emoji}</span>
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-white truncate transition-colors">
                        {meal.name}
                      </h4>
                      {meal.isAiGenerated && (
                        <span className="text-[9px] text-[#A1F524] font-black animate-pulse">✨</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#FA114F]/15 text-[#FA114F] text-[10px] font-black border border-[#FA114F]/25">
                        {meal.protein}g P
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] text-[10px] font-black border border-[#00F0FF]/25">
                        {meal.carbs}g C
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FFD60A]/15 text-[#FFD60A] text-[10px] font-black border border-[#FFD60A]/25">
                        {meal.fat}g G
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <div className="bg-[#2C2C2E] border border-white/5 px-3 py-1.5 rounded-full text-xs font-black text-white">
                    {meal.calories} kcal
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          isOpen={Boolean(selectedMeal)}
          onClose={() => setSelectedMeal(null)}
          onDelete={(id) => {
            onDeleteMeal(id);
            setSelectedMeal(null);
          }}
        />
      )}
    </div>
  );
};
