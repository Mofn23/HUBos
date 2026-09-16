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
import { AchievementUnlockedToast } from './AchievementUnlockedToast';
import {
  IconHome,
  IconDumbbell,
} from '../common/Icons';

export const RecompView: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    selectedDate,
    setSelectedDate,
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
    checkAchievements,
  } = useRecompStore();

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  // Auto-check achievements on load so already completed actions unlock safely without loop
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Auto-select current date on launch or when returning to foreground
  useEffect(() => {
    const today = getTodayKey();
    setSelectedDate(today);

    const handleFocus = () => {
      const currentToday = getTodayKey();
      setSelectedDate(currentToday);
    };

    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [setSelectedDate]);

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
    <div className="flex-1 flex flex-col px-4 pt-16 pb-28 overflow-y-auto no-scrollbar animate-fade-in relative">
      {/* Ambient Radial Glowing Orbs for Glass Refraction */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#34C759]/10 blur-[100px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#BF5AF2]/10 blur-[110px]" />
        <div className="absolute -bottom-16 left-1/4 w-80 h-80 rounded-full bg-[#0A84FF]/10 blur-[100px]" />
      </div>

      {/* Achievement Unlocked Toast Notification */}
      <AchievementUnlockedToast />

      {/* Dynamic Island In-App Alert */}
      <AlertToast />

      {/* 1. Header (Hoy dropdown, Streaks, Settings, Greeting) */}
      <RecompHeader onOpenSettings={() => setCurrentTab('profile')} />

      {/* Sub-tab Views */}
      {currentTab === 'dashboard' && (
        <div className="space-y-4 relative z-10">
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

          {/* 8. Logros (Grid with Glassmorphism) */}
          <AchievementsGrid achievements={achievements} />

          {/* 9. Comidas del Día Seleccionado */}
          <MealLog
            meals={selectedDayMeals}
            onAddMeal={() => setIsMealModalOpen(true)}
            onDeleteMeal={(id) => deleteMeal(id)}
          />
        </div>
      )}

      {currentTab === 'meals' && (
        <div className="relative z-10">
          <MealsSection />
        </div>
      )}

      {currentTab === 'training' && (
        <div className="relative z-10">
          <TrainingSection />
        </div>
      )}

      {currentTab === 'profile' && (
        <div className="relative z-10">
          <ProfilePage />
        </div>
      )}

      {/* Native Floating Bottom Nav Dock (Glassmorphism Elevated Capsule) */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isModalOpen || isMealModalOpen
            ? 'opacity-0 pointer-events-none translate-y-24 scale-90'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <nav className="glass-surface-elevated rounded-full p-1.5 flex items-center gap-1 shadow-2xl backdrop-blur-3xl border border-white/20">
          <button
            className={`px-4 py-2.5 rounded-full flex items-center justify-center transition-all ${
              currentTab === 'dashboard'
                ? 'glass-pill-active text-[#34C759] shadow-md scale-105'
                : 'text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95'
            }`}
            onClick={() => setCurrentTab('dashboard')}
            aria-label="Inicio"
          >
            <IconHome className="w-5 h-5" />
          </button>
          <button
            className={`px-4 py-2.5 rounded-full flex items-center justify-center transition-all ${
              currentTab === 'meals'
                ? 'glass-pill-active text-[#34C759] shadow-md scale-105'
                : 'text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95'
            }`}
            onClick={() => setCurrentTab('meals')}
            aria-label="Comidas"
          >
            <span className="text-lg leading-none">🍴</span>
          </button>
          <button
            className={`px-4 py-2.5 rounded-full flex items-center justify-center transition-all ${
              currentTab === 'training'
                ? 'glass-pill-active text-[#34C759] shadow-md scale-105'
                : 'text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95'
            }`}
            onClick={() => setCurrentTab('training')}
            aria-label="Entrenamiento"
          >
            <IconDumbbell className="w-5 h-5" />
          </button>
          <button
            className={`px-4 py-2.5 rounded-full flex items-center justify-center transition-all ${
              currentTab === 'profile'
                ? 'glass-pill-active text-[#34C759] shadow-md scale-105'
                : 'text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95'
            }`}
            onClick={() => setCurrentTab('profile')}
            aria-label="Perfil y Ajustes"
          >
            <span className="text-lg leading-none">👤</span>
          </button>
        </nav>
      </div>

      {/* Meal Capture Modal with Gemini */}
      <MealCaptureModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
      />
    </div>
  );
};
