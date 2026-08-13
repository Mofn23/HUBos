'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore, RecompTab } from '@/stores/useRecompStore';
import { getTodayKey, formatDateSpanish } from '@/lib/date';
import { calculateDailyNutrition } from '@/lib/nutritionEngine';
import { CalorieRing } from './CalorieRing';
import { MacroBars } from './MacroBars';
import { GlycogenPumpMeter } from './GlycogenPumpMeter';
import { WaterTracker } from './WaterTracker';
import { SupplementTracker } from './SupplementTracker';
import { MealCaptureModal } from './MealCaptureModal';
import { TrainingSection } from './TrainingSection';
import { ProgressSection } from './ProgressSection';
import { AICoachModal } from './AICoachModal';
import {
  IconHome,
  IconPlus,
  IconTrash,
  IconFlame,
  IconSparkles,
  IconDumbbell,
  IconActivity,
  IconMessage,
  IconPieChart,
} from '../common/Icons';

export const RecompView: React.FC = () => {
  const { setCurrentApp } = useHubStore();
  const {
    currentTab,
    setCurrentTab,
    meals,
    deleteMeal,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    targetWaterGlasses,
    waterLogs,
    addWaterGlass,
    removeWaterGlass,
    supplements,
    toggleSupplement,
    streak,
  } = useRecompStore();

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  const todayKey = getTodayKey();
  const formattedDate = formatDateSpanish(todayKey);
  const nutrition = calculateDailyNutrition(meals, todayKey, targetCalories, targetCarbs);
  const todayMeals = meals.filter((m) => m.date === todayKey);
  const todayWater = waterLogs[todayKey] || 0;

  const tabs: { id: RecompTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Diario', icon: IconPieChart },
    { id: 'meals', label: 'Comidas', icon: IconSparkles },
    { id: 'training', label: 'Entreno & Symmetry', icon: IconDumbbell },
    { id: 'progress', label: 'Progreso', icon: IconActivity },
    { id: 'coach', label: 'Coach IA', icon: IconMessage },
  ];

  return (
    <div className="flex-1 flex flex-col px-5 pt-12 pb-24 overflow-y-auto no-scrollbar animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentApp('hub')}
            className="w-9 h-9 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95 transition-all"
            title="Volver al HUB"
          >
            <IconHome className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-[#F5F5F7] tracking-tight">RecompAI</h1>
              <span className="text-[10px] font-bold bg-[#34C759]/15 text-[#34C759] px-2 py-0.5 rounded-full">
                🔥 {streak?.currentStreak || 3} días
              </span>
            </div>
            <p className="text-[11px] text-[#8E8E93] capitalize">{formattedDate}</p>
          </div>
        </div>

        <button
          onClick={() => setIsMealModalOpen(true)}
          className="px-3.5 py-2 rounded-full bg-[#34C759] text-black font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
        >
          <IconPlus className="w-4 h-4 stroke-[3]" />
          <span>Comida IA</span>
        </button>
      </div>

      {/* Sub-navigation Scrollable Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-3 mb-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setCurrentTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isActive
                  ? 'bg-white text-black shadow'
                  : 'bg-[#1C1C1E] text-[#8E8E93] hover:text-[#F5F5F7] border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Views */}
      {currentTab === 'dashboard' && (
        <div className="space-y-4 pb-12">
          {/* Calorie Progress Ring */}
          <CalorieRing
            consumed={nutrition.consumedCalories}
            target={targetCalories}
            difference={nutrition.calorieDifference}
            status={nutrition.status}
          />

          {/* Macro Bars */}
          <MacroBars
            protein={{ consumed: nutrition.consumedProtein, target: targetProtein }}
            carbs={{ consumed: nutrition.consumedCarbs, target: targetCarbs }}
            fat={{ consumed: nutrition.consumedFat, target: targetFat }}
          />

          {/* Glycogen & Water */}
          <GlycogenPumpMeter percent={nutrition.glycogenPumpPercent} />

          <WaterTracker
            glasses={todayWater}
            targetGlasses={targetWaterGlasses}
            onAddGlass={() => addWaterGlass(todayKey)}
            onRemoveGlass={() => removeWaterGlass(todayKey)}
          />

          {/* Supplement Checklist */}
          <SupplementTracker
            supplements={supplements}
            todayKey={todayKey}
            onToggle={(id) => toggleSupplement(id, todayKey)}
          />

          {/* Today's Meals List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
                Comidas de Hoy ({todayMeals.length})
              </h3>
            </div>

            {todayMeals.length === 0 ? (
              <div className="p-6 rounded-[24px] bg-[#1C1C1E] border border-white/5 text-center text-xs text-[#8E8E93]">
                No has registrado comidas hoy. Toca el botón <strong>+ Comida IA</strong> arriba para escanear tu plato.
              </div>
            ) : (
              todayMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 flex items-center justify-between shadow-sm"
                >
                  <div className="overflow-hidden pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F5F5F7] truncate">{meal.name}</span>
                      {meal.mealType && (
                        <span className="text-[9px] font-bold uppercase bg-[#242426] text-[#8E8E93] px-1.5 py-0.5 rounded">
                          {meal.mealType}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8E8E93] mt-0.5">
                      <span className="text-[#F5F5F7] font-bold">{meal.calories} kcal</span> •{' '}
                      <span className="text-[#34C759]">{meal.protein}g P</span> •{' '}
                      <span className="text-[#FF9500]">{meal.carbs}g C</span> •{' '}
                      <span className="text-[#0A84FF]">{meal.fat}g G</span>
                    </p>
                  </div>

                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] hover:text-[#E8505B] transition-colors shrink-0"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {currentTab === 'meals' && (
        <div className="space-y-3 pb-12">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
              Historial Completo de Comidas ({meals.length})
            </h3>
          </div>

          {meals.map((meal) => (
            <div
              key={meal.id}
              className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#F5F5F7]">{meal.name}</p>
                  <span className="text-[10px] text-[#8E8E93]">{meal.date}</span>
                </div>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  <span className="text-[#F5F5F7] font-bold">{meal.calories} kcal</span> • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g G
                </p>
                {meal.notes && <p className="text-[10px] text-[#8E8E93] italic mt-1">{meal.notes}</p>}
              </div>

              <button
                onClick={() => deleteMeal(meal.id)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] hover:text-[#E8505B] transition-colors"
              >
                <IconTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {currentTab === 'training' && <TrainingSection />}
      {currentTab === 'progress' && <ProgressSection />}
      {currentTab === 'coach' && <AICoachModal />}

      {/* Meal Capture Modal */}
      <MealCaptureModal isOpen={isMealModalOpen} onClose={() => setIsMealModalOpen(false)} />
    </div>
  );
};
