'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore, RecompTab } from '@/stores/useRecompStore';
import { getTodayKey } from '@/lib/date';
import { calculateDailyNutrition } from '@/lib/nutritionEngine';
import { RecompHeader } from './RecompHeader';
import { CalorieRing } from './CalorieRing';
import { MacroBars } from './MacroBars';
import { GlycogenPumpMeter } from './GlycogenPumpMeter';
import { QuickStatsRow } from './QuickStatsRow';
import { WaterTracker } from './WaterTracker';
import { SupplementTracker } from './SupplementTracker';
import { AchievementsGrid } from './AchievementsGrid';
import { MealLog } from './MealLog';
import { MealCaptureModal } from './MealCaptureModal';
import { TrainingSection } from './TrainingSection';
import { ProgressSection } from './ProgressSection';
import { AICoachModal } from './AICoachModal';
import {
  IconHome,
  IconDumbbell,
  IconActivity,
  IconMessage,
  IconSparkles,
} from '../common/Icons';

export const RecompView: React.FC = () => {
  const { setIsSettingsOpen } = useHubStore();
  const {
    currentTab,
    setCurrentTab,
    meals,
    deleteMeal,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    waterLogs,
    addWaterGlass,
    removeWaterGlass,
    supplements,
    toggleSupplement,
    achievements,
  } = useRecompStore();

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  const todayKey = getTodayKey();
  const nutrition = calculateDailyNutrition(meals, todayKey, targetCalories, targetCarbs);
  const todayMeals = meals.filter((m) => m.date === todayKey);
  const todayWater = waterLogs[todayKey] || 0;

  return (
    <div className="flex-1 flex flex-col px-4 pt-10 pb-28 overflow-y-auto no-scrollbar animate-fade-in">
      {/* 1. Header (Hoy dropdown, Streaks, Settings, Greeting) */}
      <RecompHeader onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Sub-tab Views */}
      {currentTab === 'dashboard' && (
        <div className="space-y-4">
          {/* 2. TotalBlock Calorie Summary */}
          <CalorieRing
            consumed={nutrition.consumedCalories}
            target={targetCalories}
            difference={nutrition.calorieDifference}
            status={nutrition.status}
          />

          {/* 3. MacroBars */}
          <MacroBars
            protein={{ consumed: nutrition.consumedProtein, target: targetProtein }}
            carbs={{ consumed: nutrition.consumedCarbs, target: targetCarbs }}
            fat={{ consumed: nutrition.consumedFat, target: targetFat }}
          />

          {/* 4. Glycogen Pump Meter */}
          <GlycogenPumpMeter percent={nutrition.glycogenPumpPercent || 50} />

          {/* 5. 3 Quick Stat Cards */}
          <QuickStatsRow />

          {/* 6. Hidratación (12 Glass Circles Grid) */}
          <WaterTracker
            glasses={todayWater}
            maxGlasses={12}
            onAddGlass={() => addWaterGlass(todayKey)}
            onRemoveGlass={() => removeWaterGlass(todayKey)}
          />

          {/* 7. Suplementos (SettingsRow with iOS Toggle) */}
          <SupplementTracker
            supplements={supplements}
            todayKey={todayKey}
            onToggle={(id) => toggleSupplement(id, todayKey)}
          />

          {/* 8. Logros (5x4 Circles Grid with Green Glow) */}
          <AchievementsGrid achievements={achievements} />

          {/* 9. Comidas de Hoy (Empty State with Green Button) */}
          <MealLog
            meals={todayMeals}
            onAddMeal={() => setIsMealModalOpen(true)}
            onDeleteMeal={(id) => deleteMeal(id)}
          />
        </div>
      )}

      {currentTab === 'meals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#F5F5F7]">Comidas</h2>
            <button
              onClick={() => setIsMealModalOpen(true)}
              className="btn-primary btn-sm"
            >
              + Escanear IA
            </button>
          </div>
          <MealLog
            meals={meals}
            onAddMeal={() => setIsMealModalOpen(true)}
            onDeleteMeal={(id) => deleteMeal(id)}
          />
        </div>
      )}

      {currentTab === 'training' && <TrainingSection />}
      {currentTab === 'progress' && <ProgressSection />}
      {currentTab === 'coach' && <AICoachModal />}

      {/* Floating Bottom Nav Icons for Recomp */}
      <div className="monai-bottom-nav-container">
        <nav className="monai-bottom-nav">
          <button
            className={`monai-bottom-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
            aria-label="Inicio"
          >
            <IconHome className="w-5 h-5" />
          </button>
          <button
            className={`monai-bottom-nav-item ${currentTab === 'meals' ? 'active' : ''}`}
            onClick={() => setCurrentTab('meals')}
            aria-label="Comidas"
          >
            <span className="text-lg">🍴</span>
          </button>
          <button
            className={`monai-bottom-nav-item ${currentTab === 'training' ? 'active' : ''}`}
            onClick={() => setCurrentTab('training')}
            aria-label="Entrenamiento"
          >
            <IconDumbbell className="w-5 h-5" />
          </button>
          <button
            className={`monai-bottom-nav-item ${currentTab === 'progress' ? 'active' : ''}`}
            onClick={() => setCurrentTab('progress')}
            aria-label="Progreso"
          >
            <IconActivity className="w-5 h-5" />
          </button>
          <button
            className={`monai-bottom-nav-item ${currentTab === 'coach' ? 'active' : ''}`}
            onClick={() => setCurrentTab('coach')}
            aria-label="Coach IA"
          >
            <IconSparkles className="w-5 h-5 text-[#34C759]" />
          </button>
        </nav>
      </div>

      {/* Meal Capture Modal with Gemini 2.0 */}
      <MealCaptureModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
      />
    </div>
  );
};
