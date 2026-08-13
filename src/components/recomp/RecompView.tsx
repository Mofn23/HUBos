'use client';

import React, { useState, useEffect } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore, RecompTab } from '@/stores/useRecompStore';
import { getTodayKey } from '@/lib/date';
import { calculateDailyNutrition } from '@/lib/nutritionEngine';
import { initNativeNotifications } from '@/lib/notifications';
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
import { MealsSection } from './MealsSection';
import { TrainingSection } from './TrainingSection';
import { ProfilePage } from './ProfilePage';
import { AlertToast } from '../common/AlertToast';
import {
  IconHome,
  IconDumbbell,
} from '../common/Icons';

export const RecompView: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    selectedDate,
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
    addAlert,
    isModalOpen,
  } = useRecompStore();

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  // Initialize notifications on mount
  useEffect(() => {
    initNativeNotifications();
  }, []);

  // Nutritional checks (Sodium, Protein, Creatine)
  useEffect(() => {
    const today = getTodayKey();
    const todayMeals = meals.filter((m) => m.date === today);
    const totalSodium = todayMeals.reduce((s, m) => s + (m.sodium || 0), 0);
    const totalProtein = todayMeals.reduce((s, m) => s + m.protein, 0);

    if (totalSodium > 2300) {
      addAlert({
        type: 'sodium',
        title: '⚠️ Exceso de Sodio Detectado',
        message: `Has acumulado ${totalSodium}mg de sodio hoy. Aumenta tu hidratación.`,
      });
    }

    const hour = new Date().getHours();
    if (hour >= 20 && totalProtein < 120 && todayMeals.length > 0) {
      addAlert({
        type: 'protein',
        title: '🥩 Meta Proteica Incompleta',
        message: `Llevas ${totalProtein}g de proteína. Te sugerimos un batido o cena alta en proteína.`,
      });
    }
  }, [meals, addAlert]);

  const nutrition = calculateDailyNutrition(meals, selectedDate, targetCalories, targetCarbs);
  const selectedDayMeals = meals.filter((m) => m.date === selectedDate);
  const selectedDayWater = waterLogs[selectedDate] || 0;

  return (
    <div className="flex-1 flex flex-col px-4 pt-10 pb-28 overflow-y-auto no-scrollbar animate-fade-in relative">
      {/* Dynamic Island In-App Alert */}
      <AlertToast />

      {/* 1. Header (Hoy dropdown, Streaks, Settings, Greeting) */}
      <RecompHeader onOpenSettings={() => setCurrentTab('profile')} />

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
            glasses={selectedDayWater}
            maxGlasses={12}
            onAddGlass={() => addWaterGlass(selectedDate)}
            onRemoveGlass={() => removeWaterGlass(selectedDate)}
          />

          {/* 7. Suplementos (SettingsRow with iOS Toggle) */}
          <SupplementTracker
            supplements={supplements}
            todayKey={selectedDate}
            onToggle={(id) => toggleSupplement(id, selectedDate)}
          />

          {/* 8. Logros (5x4 Circles Grid with Green Glow) */}
          <AchievementsGrid achievements={achievements} />

          {/* 9. Comidas del Día Seleccionado */}
          <MealLog
            meals={selectedDayMeals}
            onAddMeal={() => setIsMealModalOpen(true)}
            onDeleteMeal={(id) => deleteMeal(id)}
          />
        </div>
      )}

      {currentTab === 'meals' && <MealsSection />}
      {currentTab === 'training' && <TrainingSection />}
      {currentTab === 'profile' && <ProfilePage />}

      {/* Native Floating Bottom Nav Dock (Recomp Only - Automatically hidden when any modal is open) */}
      <div
        className={`monai-bottom-nav-container transition-all duration-300 ${
          isModalOpen || isMealModalOpen ? 'opacity-0 pointer-events-none translate-y-24 scale-90' : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
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
            className={`monai-bottom-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentTab('profile')}
            aria-label="Perfil y Ajustes"
          >
            <span className="text-lg">👤</span>
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
