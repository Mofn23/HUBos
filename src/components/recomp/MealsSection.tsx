'use client';

import React, { useState } from 'react';
import { useRecompStore, MealItem, FavoriteMealItem } from '@/stores/useRecompStore';
import { IconCamera, IconPlus, IconTrash } from '../common/Icons';
import { MealCaptureModal } from './MealCaptureModal';
import { DateSelectionModal } from './DateSelectionModal';
import { MealDetailModal } from './MealDetailModal';

export function getMealCategory(meal: MealItem): 'desayuno' | 'almuerzo' | 'cena' | 'snack' {
  if (meal.category && ['desayuno', 'almuerzo', 'cena', 'snack'].includes(meal.category)) {
    return meal.category;
  }
  const desc = (meal.name || '').toLowerCase();
  if (desc.startsWith('desayuno') || desc.includes('desayuno:')) return 'desayuno';
  if (desc.startsWith('almuerzo') || desc.includes('almuerzo:')) return 'almuerzo';
  if (desc.startsWith('cena') || desc.includes('cena:')) return 'cena';
  if (desc.startsWith('snack') || desc.includes('snack:')) return 'snack';

  if (meal.timestamp) {
    try {
      const hour = new Date(meal.timestamp).getHours();
      if (hour >= 5 && hour < 12) return 'desayuno';
      if (hour >= 12 && hour < 18) return 'almuerzo';
      if (hour >= 18 && hour <= 23) return 'cena';
      return 'snack';
    } catch {
      return 'almuerzo';
    }
  }
  return 'almuerzo';
}

export const MealsSection: React.FC = () => {
  const {
    meals,
    selectedDate,
    targetCalories,
    getMealsByDate,
    addMeal,
    deleteMeal,
    favoriteMeals,
    deleteFavoriteMeal,
    setIsModalOpen,
  } = useRecompStore();

  const [isAiScanOpen, setIsAiScanOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [activeCategoryForManual, setActiveCategoryForManual] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('almuerzo');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'desayuno' | 'almuerzo' | 'cena' | 'snack'>('todos');
  const [selectedPhotoMeal, setSelectedPhotoMeal] = useState<MealItem | null>(null);
  const [selectedDetailMeal, setSelectedDetailMeal] = useState<MealItem | null>(null);

  // Form for manual entry
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  const currentMeals = getMealsByDate(selectedDate);
  const totalCalories = currentMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = currentMeals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = currentMeals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = currentMeals.reduce((s, m) => s + m.fat, 0);

  // Only meals with uploaded photos
  const mealsWithPhotos = meals.filter((m) => Boolean(m.imageBase64 || m.imageUrl));

  const filterTabs: { key: 'todos' | 'desayuno' | 'almuerzo' | 'cena' | 'snack'; label: string; icon?: string }[] = [
    { key: 'todos', label: `Todos (${currentMeals.length})` },
    { key: 'desayuno', label: 'Desayuno', icon: '🥐' },
    { key: 'almuerzo', label: 'Almuerzo', icon: '🍲' },
    { key: 'cena', label: 'Cena', icon: '🍽️' },
    { key: 'snack', label: 'Snacks', icon: '🍎' },
  ];

  const displayedMeals = activeFilter === 'todos'
    ? currentMeals
    : currentMeals.filter((m) => getMealCategory(m) === activeFilter);

  const handleAddFavorite = (fav: FavoriteMealItem) => {
    addMeal({
      name: fav.name,
      calories: fav.calories,
      protein: fav.protein || 0,
      carbs: fav.carbs || 0,
      fat: fav.fat || 0,
      date: selectedDate,
      category: 'snack',
    });
  };

  const handleOpenManual = (cat: 'desayuno' | 'almuerzo' | 'cena' | 'snack') => {
    setActiveCategoryForManual(cat);
    setIsManualModalOpen(true);
    setIsModalOpen(true);
  };

  const handleCloseManual = () => {
    setIsManualModalOpen(false);
    setIsModalOpen(false);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualCalories) return;

    addMeal({
      name: manualName,
      calories: parseInt(manualCalories) || 0,
      protein: parseInt(manualProtein) || 0,
      carbs: parseInt(manualCarbs) || 0,
      fat: parseInt(manualFat) || 0,
      date: selectedDate,
      category: activeCategoryForManual,
    });

    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    handleCloseManual();
  };

  return (
    <div className="space-y-4 pb-36 animate-fade-in relative z-10">
      {/* 1. Header Minimalista */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">
            Módulo de Nutrición
          </span>
          <h1 className="text-xl font-black text-[#F5F5F7] flex items-center gap-2 tracking-tight">
            <span>🍽️</span>
            <span>Comidas & Dieta</span>
          </h1>
        </div>
        <button
          onClick={() => setIsDateModalOpen(true)}
          className="glass-pill px-3 py-1.5 rounded-full text-xs font-black text-[#F5F5F7] flex items-center gap-1.5 hover:border-white/30 active:scale-95 transition-transform"
        >
          <span>🗓️</span>
          <span>Cambiar</span>
        </button>
      </div>

      {/* 2. Hero Bento Card de Telemetría & Acciones Rápidas Unificadas */}
      <div className="glass-surface p-5 rounded-[32px] border-t-white/20 space-y-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold text-[#8E8E93]">Consumo del Día</div>
            <div className="text-2xl font-black text-[#F5F5F7] tracking-tight mt-0.5">
              {totalCalories}{' '}
              <span className="text-sm font-bold text-[#8E8E93]">/ {targetCalories} kcal</span>
            </div>
          </div>

          {/* Micro-píldoras de Macronutrientes */}
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-[#0A84FF]/15 text-[#64D2FF] text-[11px] font-black border border-[#0A84FF]/25 shadow-sm">
              {totalProtein}g P
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FF9F0A]/15 text-[#FFD60A] text-[11px] font-black border border-[#FF9F0A]/25 shadow-sm">
              {totalCarbs}g C
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#BF5AF2]/15 text-[#DA8FFF] text-[11px] font-black border border-[#BF5AF2]/25 shadow-sm">
              {totalFat}g G
            </span>
          </div>
        </div>

        {/* Barra de Progreso Luminosa de Calorías */}
        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#34C759] to-[#30B753] shadow-[0_0_10px_rgba(52,199,89,0.5)] transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.round((totalCalories / (targetCalories || 2000)) * 100))}%`,
            }}
          />
        </div>

        {/* Acciones Rápidas Integradas (Elimina botones flotantes colisionantes) */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={() => {
              setIsAiScanOpen(true);
              setIsModalOpen(true);
            }}
            className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#34C759] to-[#30B753] text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(52,199,89,0.35)] active:scale-95 hover:scale-[1.01] transition-all"
          >
            <IconCamera className="w-4 h-4" />
            <span>Escanear con IA</span>
          </button>

          <button
            onClick={() => handleOpenManual(activeFilter === 'todos' ? 'almuerzo' : activeFilter)}
            className="py-3 px-4 rounded-full glass-pill text-[#F5F5F7] font-black text-xs flex items-center justify-center gap-1.5 hover:border-white/30 active:scale-95 transition-all shadow-sm"
          >
            <IconPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Manual</span>
          </button>
        </div>
      </div>

      {/* 3. Comidas Frecuentes (Píldoras Confinadas con Truncado) */}
      {favoriteMeals.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-black text-[#8E8E93] uppercase tracking-wider flex items-center gap-1 px-1">
            <span>⭐</span>
            <span>Comidas Frecuentes</span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {favoriteMeals.map((fav) => (
              <div
                key={fav.id}
                className="glass-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0 text-xs font-black text-[#F5F5F7] shadow-sm hover:border-white/30 transition-all"
              >
                <span>{fav.emoji}</span>
                <span className="max-w-[125px] truncate">{fav.name}</span>
                <span className="text-[#8E8E93] text-[10px] font-bold shrink-0">{fav.calories} kcal</span>
                <button
                  onClick={() => handleAddFavorite(fav)}
                  className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center text-black font-black text-xs shrink-0 active:scale-90 shadow-sm"
                  title="Añadir a hoy"
                >
                  +
                </button>
                <button
                  onClick={() => deleteFavoriteMeal(fav.id)}
                  className="text-[#8E8E93] hover:text-[#FF453A] text-xs shrink-0 active:scale-90"
                  title="Eliminar de frecuentes"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Selector Segmentado de Tiempos de Comida en Píldoras de Cristal */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-2 rounded-full text-xs font-black shrink-0 transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'glass-pill-active text-[#34C759] shadow-md border-white/25'
                  : 'glass-pill text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Lista de Comidas Registradas o Estado Vacío Elegante */}
      {displayedMeals.length === 0 ? (
        <div className="glass-surface rounded-[28px] p-8 text-center space-y-3 border-t-white/20 shadow-md flex flex-col items-center">
          <div className="w-14 h-14 rounded-3xl glass-pill flex items-center justify-center text-2xl shadow-inner">
            🍽️
          </div>
          <div>
            <h3 className="text-sm font-black text-[#F5F5F7]">
              {activeFilter === 'todos'
                ? 'No has registrado comidas hoy'
                : `Sin comidas registradas en ${activeFilter}`}
            </h3>
            <p className="text-xs font-bold text-[#8E8E93] max-w-xs mx-auto mt-1">
              Toca "Escanear con IA" o "Manual" para calcular macros al instante.
            </p>
          </div>
          <button
            onClick={() => {
              setIsAiScanOpen(true);
              setIsModalOpen(true);
            }}
            className="glass-pill px-4 py-2 rounded-full text-xs font-black text-[#34C759] hover:border-white/30 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm mt-1"
          >
            <IconCamera className="w-3.5 h-3.5" />
            <span>Registrar Plato con Foto</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedMeals.map((meal) => {
            const category = getMealCategory(meal);
            const iconMap: Record<string, string> = {
              desayuno: '🥐',
              almuerzo: '🍲',
              cena: '🍽️',
              snack: '🍎',
            };

            return (
              <div
                key={meal.id}
                onClick={() => setSelectedDetailMeal(meal)}
                className="glass-pill p-3.5 rounded-[22px] flex items-center justify-between shadow-sm cursor-pointer hover:border-white/30 active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {meal.imageBase64 || meal.imageUrl ? (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-sm">
                      <img
                        src={meal.imageBase64 || meal.imageUrl}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-2xl glass-surface flex items-center justify-center text-lg shrink-0">
                      {iconMap[category] || '🍽️'}
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <h4 className="text-xs font-black text-[#F5F5F7] truncate group-hover:text-[#34C759] transition-colors">
                      {meal.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-1.5 py-0.5 rounded-full bg-[#0A84FF]/15 text-[#64D2FF] text-[9px] font-black">
                        {meal.protein}g P
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#FFD60A] text-[9px] font-black">
                        {meal.carbs}g C
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-[#BF5AF2]/15 text-[#DA8FFF] text-[9px] font-black">
                        {meal.fat}g G
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-xs font-black text-[#F5F5F7] border border-white/10">
                    {meal.calories} kcal
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMeal(meal.id);
                    }}
                    className="text-[#8E8E93] hover:text-[#FF453A] p-1.5 transition-colors active:scale-90"
                    title="Eliminar comida"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Galería de Fotos Reales (Fotos de comidas tomadas por el usuario) */}
      {mealsWithPhotos.length > 0 && (
        <div className="glass-surface rounded-[28px] p-4.5 space-y-3 border-t-white/20 shadow-md">
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <div className="glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
              <span>📸</span>
              <span>Galería de Fotos Reales</span>
            </div>
            <span className="text-xs font-bold text-[#8E8E93]">
              {mealsWithPhotos.length} {mealsWithPhotos.length === 1 ? 'foto' : 'fotos'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {mealsWithPhotos.map((meal) => (
              <div
                key={meal.id}
                onClick={() => setSelectedPhotoMeal(meal)}
                className="relative aspect-square rounded-[20px] overflow-hidden border border-white/15 group cursor-pointer active:scale-95 transition-all shadow-sm hover:border-white/30"
              >
                <img
                  src={meal.imageBase64 || meal.imageUrl}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  {meal.calories} kcal
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Entrada Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center animate-fade-in">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xl"
            onClick={handleCloseManual}
          />
          <div
            className="relative glass-surface-elevated border-t border-white/20 w-full max-w-md rounded-t-[38px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] z-20 animate-sheet-up space-y-4 shadow-2xl backdrop-blur-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 rounded-full bg-white/20 mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <h3 className="text-base font-black text-[#F5F5F7] tracking-tight capitalize">
                Registrar en {activeCategoryForManual}
              </h3>
              <button
                onClick={handleCloseManual}
                className="glass-pill w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-3">
              <div>
                <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                  Descripción / Alimento
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pechuga de pollo con arroz y ensalada"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full mt-1 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                    Calorías (kcal)
                  </label>
                  <input
                    type="number"
                    placeholder="450"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    className="w-full mt-1 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                    Proteína (g)
                  </label>
                  <input
                    type="number"
                    placeholder="35"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    className="w-full mt-1 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                    Carbos (g)
                  </label>
                  <input
                    type="number"
                    placeholder="40"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    className="w-full mt-1 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                    Grasas (g)
                  </label>
                  <input
                    type="number"
                    placeholder="12"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    className="w-full mt-1 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#34C759] to-[#30B753] text-black font-black text-sm shadow-[0_4px_16px_rgba(52,199,89,0.35)] active:scale-95 transition-all mt-2"
              >
                Guardar Comida
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Foto */}
      {selectedPhotoMeal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedPhotoMeal(null)}
          />
          <div
            className="relative glass-surface-elevated border border-white/15 rounded-[32px] overflow-hidden max-w-xs w-full z-10 animate-scale-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video">
              <img
                src={selectedPhotoMeal.imageBase64 || selectedPhotoMeal.imageUrl}
                alt={selectedPhotoMeal.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPhotoMeal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center text-xs shadow-md"
              >
                ✕
              </button>
            </div>
            <div className="p-4.5 space-y-2 text-center">
              <h4 className="text-sm font-black text-[#F5F5F7] tracking-tight">
                {selectedPhotoMeal.name}
              </h4>
              <div className="inline-block px-3 py-1 rounded-full glass-pill text-xs font-black text-[#34C759]">
                {selectedPhotoMeal.calories} kcal • {selectedPhotoMeal.date}
              </div>
              <button
                onClick={() => setSelectedPhotoMeal(null)}
                className="glass-pill w-full py-2 rounded-full text-xs font-black text-[#F5F5F7] hover:border-white/30 active:scale-95 transition-all mt-1"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Meal Capture Modal */}
      <MealCaptureModal
        isOpen={isAiScanOpen}
        onClose={() => {
          setIsAiScanOpen(false);
          setIsModalOpen(false);
        }}
      />

      {/* Date Picker Modal */}
      <DateSelectionModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      />

      {/* Meal Detail Modal */}
      <MealDetailModal
        meal={selectedDetailMeal}
        isOpen={Boolean(selectedDetailMeal)}
        onClose={() => setSelectedDetailMeal(null)}
        onDelete={(id) => {
          deleteMeal(id);
          setSelectedDetailMeal(null);
        }}
      />
    </div>
  );
};
