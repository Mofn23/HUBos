'use client';

import React, { useState } from 'react';
import { useRecompStore, MealItem, FavoriteMealItem } from '@/stores/useRecompStore';
import { getTodayKey } from '@/lib/date';
import { IconCamera, IconPlus, IconTrash } from '../common/Icons';
import { MealCaptureModal } from './MealCaptureModal';
import { DateSelectionModal } from './DateSelectionModal';
import { MealDetailModal } from './MealDetailModal';
import { StoredPhoto } from './StoredPhoto';

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
    <div className="space-y-4 pb-36 animate-fade-in motion-reduce:animate-none relative z-10">
      {/* 1. Header Minimalista */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#F5F5F7] flex items-center gap-2 tracking-tight">
            <span>🍽️</span>
            <span>Comida</span>
          </h1>
        </div>
        <button
          onClick={() => setIsDateModalOpen(true)}
          className="bg-[#2C2C2E] border border-white/[0.08] px-3 py-1.5 rounded-full text-xs font-black text-[#F5F5F7] flex items-center gap-1.5 hover:border-white/30 active:scale-95 motion-reduce:active:scale-100 transition-transform duration-150 motion-reduce:transition-none"
        >
          <span>🗓️</span>
          <span>Cambiar</span>
        </button>
      </div>

      {/* 2. Hero Bento Card de Telemetría & Acciones Rápidas Unificadas */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-5 rounded-[32px] border-t-white/20 space-y-4 shadow-sm">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-bold text-[#8E8E93]">Consumo del Día</div>
            <div className="text-2xl font-black text-[#F5F5F7] tracking-tight mt-0.5">
              {totalCalories}{' '}
              <span className="text-sm font-bold text-[#8E8E93]">/ {targetCalories} kcal</span>
            </div>
          </div>

          {/* Compact nutrient summary */}
          <div className="grid grid-cols-3 divide-x divide-white/[0.08] rounded-2xl bg-black/20 py-2.5">
            <div className="min-w-0 text-center">
              <div className="text-sm font-black text-[#64D2FF]">{totalProtein}g</div>
              <div className="mt-0.5 truncate px-1 text-[10px] font-semibold text-[#8E8E93]">Proteína</div>
            </div>
            <div className="min-w-0 text-center">
              <div className="text-sm font-black text-[#FFD60A]">{totalCarbs}g</div>
              <div className="mt-0.5 truncate px-1 text-[10px] font-semibold text-[#8E8E93]">Carbohidratos</div>
            </div>
            <div className="min-w-0 text-center">
              <div className="text-sm font-black text-[#DA8FFF]">{totalFat}g</div>
              <div className="mt-0.5 truncate px-1 text-[10px] font-semibold text-[#8E8E93]">Grasas</div>
            </div>
          </div>
        </div>

        {/* Barra de Progreso Luminosa de Calorías */}
        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#A1F524] to-[#30B753]  transition-[width] duration-500 motion-reduce:transition-none"
            style={{
              width: `${Math.min(100, Math.round((totalCalories / (targetCalories || 2000)) * 100))}%`,
            }}
          />
        </div>

        {/* Acciones Rápidas Integradas (Elimina botones flotantes colisionantes) */}
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          <button
            onClick={() => {
              setIsAiScanOpen(true);
              setIsModalOpen(true);
            }}
            className="mx-auto flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A1F524] to-[#30B753] px-4 py-3 text-xs font-black text-black active:scale-95 motion-reduce:active:scale-100 hover:scale-[1.01] transition-colors duration-150 motion-reduce:transition-none"
          >
            <IconCamera className="w-4 h-4" />
            <span>Escanear con IA</span>
          </button>

          <button
            onClick={() => handleOpenManual('almuerzo')}
            className="flex items-center justify-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none"
          >
            <IconPlus className="h-3 w-3" />
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
                className="bg-[#2C2C2E] border border-white/[0.08] inline-flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0 text-xs font-black text-[#F5F5F7] shadow-sm hover:border-white/30 transition-colors duration-150 motion-reduce:transition-none"
              >
                <span>{fav.emoji}</span>
                <span className="max-w-[90px] truncate" title={fav.name}>{fav.name}</span>
                <span className="text-[#8E8E93] text-[10px] font-bold shrink-0">{fav.calories} kcal</span>
                <button
                  onClick={() => handleAddFavorite(fav)}
                  className="w-5 h-5 rounded-full bg-[#A1F524] flex items-center justify-center text-black font-black text-xs shrink-0 active:scale-90 motion-reduce:active:scale-100 shadow-sm"
                  title="Añadir a hoy"
                >
                  +
                </button>
                <button
                  onClick={() => deleteFavoriteMeal(fav.id)}
                  className="text-[#8E8E93] hover:text-[#FF453A] text-xs shrink-0 active:scale-90 motion-reduce:active:scale-100"
                  title="Eliminar de frecuentes"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Lista de Comidas Registradas o Estado Vacío Elegante */}
      {currentMeals.length === 0 ? (
        <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-[28px] p-8 text-center space-y-3 border-t-white/20 shadow-sm flex flex-col items-center">
          <div className="w-14 h-14 rounded-3xl bg-[#2C2C2E] border border-white/[0.08] flex items-center justify-center text-2xl shadow-inner">
            🍽️
          </div>
          <div>
            <h3 className="text-sm font-black text-[#F5F5F7]">
              {selectedDate === getTodayKey()
                ? 'No has registrado comidas hoy'
                : 'No hay comidas registradas en esta fecha'}
            </h3>
            <p className="text-xs font-bold text-[#8E8E93] max-w-xs mx-auto mt-1">
              Registra una comida para verla aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentMeals.map((meal) => {
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
                className="bg-[#2C2C2E] border border-white/[0.08] p-3.5 rounded-[22px] flex items-center justify-between shadow-sm cursor-pointer hover:border-white/30 active:scale-[0.99] motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none group"
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
                    <div className="w-11 h-11 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] flex items-center justify-center text-lg shrink-0">
                      {iconMap[category] || '🍽️'}
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <h4 className="text-xs font-black text-[#F5F5F7] truncate group-hover:text-[#A1F524] transition-colors">
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
                    className="text-[#8E8E93] hover:text-[#FF453A] p-1.5 transition-colors active:scale-90 motion-reduce:active:scale-100"
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

      {/* 6. Galería de fotos de comidas: solo el contador, centrado */}
      {mealsWithPhotos.length > 0 && (
        <div className="bg-[#1C1C1E] border border-white/[0.08] rounded-[28px] p-4 space-y-3 border-t-white/20 shadow-sm">
          <div className="flex items-center justify-center pb-2 border-b border-white/5">
            <span className="text-xs font-bold text-[#8E8E93] tabular-nums">
              {mealsWithPhotos.length} {mealsWithPhotos.length === 1 ? 'foto' : 'fotos'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {mealsWithPhotos.map((meal) => (
              <button
                type="button"
                key={meal.id}
                onClick={() => setSelectedPhotoMeal(meal)}
                aria-label={'Abrir foto de ' + meal.name}
                className="relative aspect-square rounded-[20px] overflow-hidden border border-white/15 group cursor-pointer active:scale-95 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none shadow-sm hover:border-white/30 bg-[#2C2C2E]"
              >
                <StoredPhoto
                  lazy
                  kind="meal"
                  id={meal.id}
                  fallback={meal.imageBase64 || meal.imageUrl}
                  alt={meal.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-[opacity,transform] duration-150 motion-reduce:transition-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black text-white px-2 py-0.5 rounded-full bg-black/60 border border-white/10">
                  {meal.calories} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Entrada Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center animate-fade-in motion-reduce:animate-none">
          <div
            className="fixed inset-0 bg-black/75 "
            onClick={handleCloseManual}
          />
          <div
            className="relative bg-[#1C1C1E] border border-white/[0.08] border-t border-white/20 w-full max-w-md rounded-t-[38px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] z-20 animate-sheet-up motion-reduce:animate-none space-y-4 shadow-sm "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 rounded-full bg-white/20 mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <h3 className="text-base font-black text-[#F5F5F7] tracking-tight capitalize">
                Registrar en {activeCategoryForManual}
              </h3>
              <button
                onClick={handleCloseManual}
                className="bg-[#2C2C2E] border border-white/[0.08] w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white"
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
                  className="w-full mt-1 p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
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
                    className="w-full mt-1 p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
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
                    className="w-full mt-1 p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
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
                    className="w-full mt-1 p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
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
                    className="w-full mt-1 p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#A1F524] to-[#30B753] text-black font-black text-sm  active:scale-95 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none mt-2"
              >
                Guardar Comida
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Visor de foto: copia HD, sin recorte */}
      {selectedPhotoMeal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-5 py-10 animate-fade-in motion-reduce:animate-none">
          <button
            type="button"
            className="absolute inset-0 bg-black/95"
            onClick={() => setSelectedPhotoMeal(null)}
            aria-label="Cerrar foto"
          />
          <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setSelectedPhotoMeal(null)}
              className="absolute -top-2 right-0 z-20 w-9 h-9 rounded-full bg-[#2C2C2E] border border-white/15 text-[#F5F5F7] flex items-center justify-center text-sm active:scale-95 motion-reduce:active:scale-100 transition-transform duration-150 motion-reduce:transition-none"
              aria-label="Cerrar"
            >
              ✕
            </button>

            <StoredPhoto
              kind="meal"
              id={selectedPhotoMeal.id}
              fallback={selectedPhotoMeal.imageBase64 || selectedPhotoMeal.imageUrl}
              alt={selectedPhotoMeal.name}
              className="max-h-[62dvh] w-auto max-w-full rounded-[26px] object-contain border border-white/10"
            />

            <div className="w-full space-y-2.5 text-center">
              <h4 className="text-base font-black text-[#F5F5F7] tracking-tight">
                {selectedPhotoMeal.name}
              </h4>
              <div className="inline-block px-3 py-1 rounded-full bg-[#2C2C2E] border border-white/[0.08] text-xs font-black text-[#A1F524]">
                {selectedPhotoMeal.calories} kcal • {selectedPhotoMeal.date}
              </div>
              <button
                onClick={() => setSelectedPhotoMeal(null)}
                className="bg-[#2C2C2E] border border-white/[0.08] w-full py-3 rounded-full text-xs font-black text-[#F5F5F7] hover:border-white/30 active:scale-95 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none"
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
