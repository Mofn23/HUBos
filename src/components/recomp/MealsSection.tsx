'use client';

import React, { useState } from 'react';
import { useRecompStore, MealItem, FavoriteMealItem } from '@/stores/useRecompStore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { IconPlus, IconTrash, IconCamera } from '../common/Icons';
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
  const formattedDate = format(parseISO(selectedDate), 'MMM d, yyyy', { locale: es });

  // Only meals with uploaded photos
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
    <div className="space-y-5 pb-28 animate-fade-in relative z-10">
      {/* 1. Header */}
      <div>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
          Módulo de Nutrición
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F7] flex items-center gap-2 tracking-tight">
          <span>🍽️</span>
          <span>Comidas & Dieta</span>
        </h1>
        <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
          Registro ultra-minimalista con análisis fotográfico por IA
        </p>
      </div>

      {/* 2. Date Card */}
      <div className="glass-surface p-4 rounded-[26px] flex items-center justify-between border-t-white/20 shadow-sm">
        <span className="text-xs font-black text-[#F5F5F7]">Fecha de registro</span>
        <button
          onClick={() => setIsDateModalOpen(true)}
          className="glass-pill px-4 py-1.5 rounded-full text-xs font-black text-[#F5F5F7] capitalize hover:border-white/30 active:scale-95 transition-transform"
        >
          🗓️ {formattedDate}
        </button>
      </div>

      {/* 3. Comidas Frecuentes */}
      {favoriteMeals.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider flex items-center gap-1 px-1">
            <span>⭐</span>
            <span>COMIDAS FRECUENTES ({favoriteMeals.length})</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
            {favoriteMeals.map((fav) => (
              <div
                key={fav.id}
                className="glass-pill flex items-center gap-2 px-3.5 py-2 rounded-full shrink-0 text-xs font-black text-[#F5F5F7] shadow-sm hover:border-white/30 transition-all"
              >
                <span>{fav.emoji}</span>
                <span>{fav.name}</span>
                <span className="text-[#8E8E93] text-[11px] font-bold">{fav.calories} kcal</span>
                <button
                  onClick={() => handleAddFavorite(fav)}
                  className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center text-black font-black text-xs ml-0.5 active:scale-90 shadow-sm"
                  title="Añadir a hoy"
                >
                  +
                </button>
                <button
                  onClick={() => deleteFavoriteMeal(fav.id)}
                  className="text-[#8E8E93] hover:text-[#FF453A] text-xs ml-0.5 active:scale-90"
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
            <div key={cat.key} className="glass-surface rounded-[28px] p-4.5 space-y-3 border-t-white/20 shadow-md">
              {/* Category Header Row */}
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <div className="glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#8E8E93]">
                    {categoryMeals.length === 0 ? 'Sin registros' : `${totalCatCalories} kcal`}
                  </span>
                  <button
                    onClick={() => handleOpenManual(cat.key)}
                    className="glass-pill w-7 h-7 rounded-full flex items-center justify-center text-[#F5F5F7] font-black text-xs active:scale-90 hover:border-white/30 transition-transform"
                    title={`Agregar a ${cat.label}`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Meals in category or empty label */}
              {categoryMeals.length === 0 ? (
                <div className="py-2 px-1 text-xs font-bold text-[#636366]">
                  Sin registros para {cat.label}
                </div>
              ) : (
                <div className="space-y-2">
                  {categoryMeals.map((meal) => (
                    <div
                      key={meal.id}
                      onClick={() => setSelectedDetailMeal(meal)}
                      className="glass-pill p-3 rounded-[20px] flex items-center justify-between shadow-sm cursor-pointer hover:border-white/30 active:scale-[0.99] transition-all group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {meal.imageBase64 || meal.imageUrl ? (
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-sm">
                            <img
                              src={meal.imageBase64 || meal.imageUrl}
                              alt={meal.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl glass-surface flex items-center justify-center text-lg shrink-0">
                            {cat.icon}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-black text-[#F5F5F7] truncate group-hover:text-[#34C759] transition-colors">
                            {meal.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
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
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.06] text-xs font-black text-[#F5F5F7]">
                          {meal.calories} kcal
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMeal(meal.id);
                          }}
                          className="text-[#8E8E93] hover:text-[#FF453A] p-1 transition-colors"
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
      <div className="glass-surface rounded-[28px] p-5 space-y-3.5 border-t-white/20 shadow-md">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
            <span>📸</span>
            <span>Galería de Fotos Reales</span>
          </div>
          <span className="text-xs font-bold text-[#8E8E93]">
            {mealsWithPhotos.length} {mealsWithPhotos.length === 1 ? 'foto' : 'fotos'}
          </span>
        </div>

        {mealsWithPhotos.length === 0 ? (
          <div className="p-6 text-center space-y-2 flex flex-col items-center">
            <span className="text-3xl">📸</span>
            <span className="text-xs font-bold text-[#8E8E93] max-w-xs text-center">
              Las fotos que escanees con la cámara aparecerán aquí en alta resolución automáticamente.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {mealsWithPhotos.map((meal) => (
              <div
                key={meal.id}
                onClick={() => setSelectedPhotoMeal(meal)}
                className="relative aspect-square rounded-[22px] overflow-hidden border border-white/15 group cursor-pointer active:scale-95 transition-all shadow-sm hover:border-white/30"
              >
                <img
                  src={meal.imageBase64 || meal.imageUrl}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-black text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  {meal.calories} kcal
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Floating Action Buttons */}
      <div className="fixed bottom-24 right-5 z-40 flex items-center gap-3">
        {/* Manual Add Button */}
        <button
          onClick={() => handleOpenManual('almuerzo')}
          className="glass-surface-elevated w-13 h-13 rounded-full text-[#F5F5F7] flex items-center justify-center shadow-2xl active:scale-90 transition-all border border-white/20 hover:border-white/40"
          aria-label="Añadir Manual"
          title="Añadir Manual"
        >
          <IconPlus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* AI Camera Scan Button */}
        <button
          onClick={() => {
            setIsAiScanOpen(true);
            setIsModalOpen(true);
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#34C759] to-[#30B753] text-black flex items-center justify-center shadow-[0_8px_24px_rgba(52,199,89,0.4)] active:scale-90 transition-all border border-white/30 hover:scale-105"
          aria-label="Escanear Comida con IA"
          title="Escanear con Gemini IA"
        >
          <IconCamera className="w-7 h-7" />
        </button>
      </div>

      {/* Manual Entry Sheet Modal (Glassmorphism Elevated) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center animate-fade-in">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleCloseManual}
          />
          <div
            className="relative glass-surface-elevated border-t border-white/20 w-full max-w-md rounded-t-[38px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] z-20 animate-sheet-up space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">
                Registrar en {categories.find((c) => c.key === activeCategoryForManual)?.label}
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
                  className="w-full mt-1.5 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
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
                    className="w-full mt-1.5 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
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
                    className="w-full mt-1.5 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
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
                    className="w-full mt-1.5 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
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
                    className="w-full mt-1.5 p-3.5 rounded-2xl glass-surface text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#34C759] text-black font-black text-sm shadow-md active:scale-95 transition-all mt-2"
              >
                Guardar Comida
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Meal Photo Detail Modal */}
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
            <div className="p-5 space-y-2.5 text-center">
              <h4 className="text-sm font-black text-[#F5F5F7] tracking-tight">
                {selectedPhotoMeal.name}
              </h4>
              <div className="inline-block px-3 py-1 rounded-full glass-pill text-xs font-black text-[#34C759]">
                {selectedPhotoMeal.calories} kcal • {selectedPhotoMeal.date}
              </div>
              <button
                onClick={() => setSelectedPhotoMeal(null)}
                className="glass-pill w-full py-2.5 rounded-full text-xs font-black text-[#F5F5F7] hover:border-white/30 active:scale-95 transition-all mt-2"
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
