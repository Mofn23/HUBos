'use client';

import React from 'react';
import { MealItem } from '@/stores/useRecompStore';
import { IconPlus, IconTrash } from '../common/Icons';

interface MealLogProps {
  meals: MealItem[];
  onAddMeal: () => void;
  onDeleteMeal: (id: string) => void;
}

export const MealLog: React.FC<MealLogProps> = ({ meals, onAddMeal, onDeleteMeal }) => {
  const totalCalories = meals.reduce((acc, m) => acc + (Number(m.calories) || 0), 0);

  return (
    <div className="mb-6">
      {/* MonAI List Header */}
      <div className="monai-list-header">
        <div className="monai-list-header-pill">
          <span>🍽️ Comidas de Hoy</span>
        </div>
        <div className="monai-list-header-total">
          Total: <strong className="text-[#F5F5F7]">{totalCalories} kcal</strong>
        </div>
      </div>

      {/* Empty State or Meal List */}
      {meals.length === 0 ? (
        <div className="card empty-state">
          <span className="empty-state-emoji">🍽️</span>
          <span className="empty-state-text">No has registrado comidas hoy.</span>
          <button className="btn-primary mt-2" onClick={onAddMeal}>
            <IconPlus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Comida</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="p-3.5 rounded-[22px] bg-[#1C1C1E] border border-white/5 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-[#242426] flex items-center justify-center text-xl shrink-0">
                  🍽️
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-extrabold text-[#F5F5F7] truncate">{meal.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="tag-pill tag-pill-green">{meal.protein}g P</span>
                    <span className="tag-pill">{meal.carbs}g C</span>
                    <span className="tag-pill">{meal.fat}g G</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3 py-1.5 rounded-full bg-[#1E1E20] text-xs font-black text-[#F5F5F7]">
                  {meal.calories} kcal
                </div>
                <button
                  onClick={() => onDeleteMeal(meal.id)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] hover:text-[#E8505B] transition-colors"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
