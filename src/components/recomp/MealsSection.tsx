'use client';

import React, { useState } from 'react';
import { useRecompStore, MealItem, FavoriteMealItem } from '@/stores/useRecompStore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { IconPlus, IconTrash, IconCamera } from '../common/Icons';
import { MealCaptureModal } from './MealCaptureModal';
import { DateSelectionModal } from './DateSelectionModal';

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
    getMealsByDate,
    addMeal,
    deleteMeal,
    favoriteMeals,
    deleteFavoriteMeal,
  } = useRecompStore();

  const [isAiScanOpen, setIsAiScanOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [activeCategoryForManual, setActiveCategoryForManual] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('desayuno');
  const [selectedPhotoMeal, setSelectedPhotoMeal] = useState<MealItem | null>(null);

  // Form for manual entry
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  const currentMeals = getMealsByDate(selectedDate);
  const formattedDate = format(parseISO(selectedDate), 'MMM d, yyyy', { locale: es });

  // Only meals with uploaded photos (User meals only, zero random placeholders)
  const mealsWithPhotos = meals.filter((m) => Boolean(m.imageBase64 || m.imageUrl));

  const categories: { key: 'desayuno' | 'almuerzo' | 'cena' | 'snack'; label: string; icon: string }[] = [
    { key: 'desayuno', label: 'Desayuno', icon: '🥐' },
    { key: 'almuerzo', label: 'Almuerzo', icon: '🍲' },
    { key: 'cena', label: 'Cena', icon: '🍽️' },
    { key: 'snack', label: 'Snacks', icon: '🍎' },
  ];

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
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F5F5F7] flex items-center gap-2">
          <span>🍽️</span>
          <span>Nutrición y Comidas</span>
        </h1>
        <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
          Registro ultra-minimalista alimentado por IA
        </p>
      </div>

      {/* 2. Date Card */}
      <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 flex items-center justify-between">
        <span className="text-sm font-extrabold text-[#F5F5F7]">Fecha de registro</span>
        <button
          onClick={() => setIsDateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#2A2A2C] border border-white/10 text-xs font-extrabold text-[#F5F5F7] capitalize active:scale-95 transition-transform"
        >
          {formattedDate}
        </button>
      </div>

      {/* 3. Comidas Frecuentes */}
      {favoriteMeals.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider flex items-center gap-1">
            <span>⭐</span>
            <span>COMIDAS FRECUENTES ({favoriteMeals.length})</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
            {favoriteMeals.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1C1C1E] border border-white/5 shrink-0 text-xs font-extrabold text-[#F5F5F7]"
              >
                <span>{fav.emoji}</span>
                <span>{fav.name}</span>
                <span className="text-[#8E8E93] text-[11px]">{fav.calories} kcal</span>
                <button
                  onClick={() => handleAddFavorite(fav)}
                  className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center text-black font-black text-xs ml-0.5 active:scale-90"
                  title="Añadir a hoy"
                >
                  +
                </button>
                <button
                  onClick={() => deleteFavoriteMeal(fav.id)}
                  className="text-[#8E8E93] hover:text-[#E8505B] text-xs ml-0.5"
                  title="Eliminar de frecuentes"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Categorized Sections (Desayuno, Almuerzo, Cena, Snacks) */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const categoryMeals = currentMeals.filter((m) => getMealCategory(m) === cat.key);
          const totalCatCalories = categoryMeals.reduce((s, m) => s + m.calories, 0);

          return (
            <div key={cat.key} className="space-y-2">
              {/* Category Header Row */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242426] border border-white/5 text-xs font-black text-[#F5F5F7]">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#8E8E93]">
                    {categoryMeals.length === 0 ? 'Sin registros' : `${totalCatCalories} kcal`}
                  </span>
                  <button
                    onClick={() => {
                      setActiveCategoryForManual(cat.key);
                      setIsManualModalOpen(true);
                    }}
                    className="w-6 h-6 rounded-full bg-[#2A2A2C] border border-white/10 flex items-center justify-center text-[#F5F5F7] font-extrabold text-xs active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Meals in category or empty label */}
              {categoryMeals.length === 0 ? (
                <div className="py-2 px-1 text-xs font-bold text-[#636366]">
                  Sin registro para {cat.label}
                </div>
              ) : (
                <div className="space-y-2">
                  {categoryMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-3.5 rounded-[20px] bg-[#1C1C1E] border border-white/5 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {meal.imageBase64 || meal.imageUrl ? (
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
                            <img
                              src={meal.imageBase64 || meal.imageUrl}
                              alt={meal.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#2A2A2C] flex items-center justify-center text-lg shrink-0">
                            {cat.icon}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-extrabold text-[#F5F5F7] truncate">{meal.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="tag-pill tag-pill-green text-[10px] py-0.5">{meal.protein}g P</span>
                            <span className="tag-pill text-[10px] py-0.5">{meal.carbs}g C</span>
                            <span className="tag-pill text-[10px] py-0.5">{meal.fat}g G</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-[#242426] text-xs font-extrabold text-[#F5F5F7]">
                          {meal.calories} kcal
                        </span>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="text-[#8E8E93] hover:text-[#E8505B] p-1"
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
        })}
      </div>

      {/* 5. Galería de Comidas (ONLY Real user-uploaded photos) */}
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242426] border border-white/5 text-xs font-black text-[#F5F5F7]">
          <span>📸</span>
          <span>Galería de Comidas</span>
        </div>

        {mealsWithPhotos.length === 0 ? (
          <div className="card empty-state" style={{ padding: '24px 16px' }}>
            <span className="text-2xl">📸</span>
            <span className="text-xs font-bold text-[#8E8E93] max-w-xs text-center mt-1">
              Las fotos de los platos que escanees o registres aparecerán aquí automáticamente.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {mealsWithPhotos.map((meal) => (
              <div
                key={meal.id}
                onClick={() => setSelectedPhotoMeal(meal)}
                className="relative aspect-square rounded-[20px] overflow-hidden border border-white/10 group cursor-pointer active:scale-95 transition-transform"
              >
                <img
                  src={meal.imageBase64 || meal.imageUrl}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[11px] font-black text-white px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                  {meal.calories} kcal
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Floating Action Buttons (Bottom Left Manual + Bottom Right AI Camera) */}
      {/* Left Manual Add FAB */}
      <button
        onClick={() => {
          setActiveCategoryForManual('almuerzo');
          setIsManualModalOpen(true);
        }}
        className="fixed bottom-24 left-5 w-14 h-14 rounded-full bg-[#1C1C1E] border border-white/15 text-white flex items-center justify-center shadow-2xl active:scale-90 transition-transform z-40"
        aria-label="Añadir Manual"
      >
        <IconPlus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Right AI Camera FAB */}
      <button
        onClick={() => setIsAiScanOpen(true)}
        className="fixed bottom-24 right-5 w-16 h-16 rounded-full bg-[#E8505B] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(232,80,91,0.45)] active:scale-90 transition-transform z-40"
        aria-label="Escanear Comida con IA"
      >
        <IconCamera className="w-7 h-7" />
      </button>

      {/* Manual Entry Sheet Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsManualModalOpen(false)}
          />
          <div
            className="relative bg-[#121214] border-t border-white/10 w-full max-w-md rounded-t-[32px] p-6 pb-10 z-10 animate-sheet-up space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#F5F5F7]">
                Registrar en {categories.find((c) => c.key === activeCategoryForManual)?.label}
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center text-[#8E8E93]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-3">
              <div>
                <label className="text-[11px] font-extrabold text-[#8E8E93] uppercase">Descripción / Alimento</label>
                <input
                  type="text"
                  placeholder="Ej: Pechuga de pollo con arroz"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="input-field mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-extrabold text-[#8E8E93] uppercase">Calorías (kcal)</label>
                  <input
                    type="number"
                    placeholder="450"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    className="input-field mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-[#8E8E93] uppercase">Proteína (g)</label>
                  <input
                    type="number"
                    placeholder="35"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-extrabold text-[#8E8E93] uppercase">Carbos (g)</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-[#8E8E93] uppercase">Grasas (g)</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 mt-2">
                Guardar Comida
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Meal Photo Detail Modal */}
      {selectedPhotoMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedPhotoMeal(null)}
          />
          <div
            className="relative bg-[#1C1C1E] border border-white/10 rounded-[28px] overflow-hidden max-w-xs w-full z-10 animate-scale-up"
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
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-2 text-center">
              <h4 className="text-sm font-black text-[#F5F5F7]">{selectedPhotoMeal.name}</h4>
              <div className="inline-block px-3 py-1 rounded-full bg-[#242426] text-xs font-black text-[#34C759]">
                {selectedPhotoMeal.calories} kcal • {selectedPhotoMeal.date}
              </div>
              <button
                onClick={() => setSelectedPhotoMeal(null)}
                className="btn-primary w-full py-2.5 text-xs mt-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini 2.0 Meal Capture Modal */}
      <MealCaptureModal
        isOpen={isAiScanOpen}
        onClose={() => setIsAiScanOpen(false)}
      />

      {/* Date Picker Modal */}
      <DateSelectionModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      />
    </div>
  );
};
