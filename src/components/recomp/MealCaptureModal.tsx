'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRecompStore } from '@/stores/useRecompStore';
import { useHubStore } from '@/stores/useHubStore';
import { parseMealWithGemini } from '@/lib/gemini';
import { compressImage, createThumbnail } from '@/lib/image';
import { saveMealImage } from '@/lib/imageStorage';
import { getTodayKey } from '@/lib/date';
import { IconCamera, IconSparkles } from '../common/Icons';

interface MealCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MealCaptureModal: React.FC<MealCaptureModalProps> = ({ isOpen, onClose }) => {
  const { addMeal, addFavoriteMeal, selectedDate, setIsModalOpen } = useRecompStore();
  const { geminiApiKey, showToast } = useHubStore();

  const [category, setCategory] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('almuerzo');
  const [imageForApi, setImageForApi] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize modal open state with Zustand store to manage bottom nav visibility
  useEffect(() => {
    if (isOpen) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
    return () => {
      setIsModalOpen(false);
    };
  }, [isOpen, setIsModalOpen]);

  if (!isOpen) return null;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress to high-definition (1200px, 0.8 quality) for crystal-clear clarity & accurate IA macro calculation
      const compressed = await compressImage(file, 1200, 0.8);
      setImageForApi(compressed);
      setImagePreview(compressed);
    } catch (err: any) {
      console.error('Error compressing image:', err);
      showToast('No se pudo procesar la imagen seleccionada.');
    }

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!description.trim() && !imageForApi) {
      showToast('Por favor toma una foto o escribe qué vas a comer.');
      return;
    }

    setIsLoading(true);
    try {
      showToast('🤖 Analizando comida con Gemini...');
      const result = await parseMealWithGemini(geminiApiKey, {
        text: description.trim() || undefined,
        imageBase64: imageForApi || undefined,
      });

      const mealId = `meal-${Date.now()}`;

      // Save high-resolution image to IndexedDB (unlimited iPhone storage quota)
      if (imageForApi) {
        await saveMealImage(mealId, imageForApi);
      }

      // Generate an ultra-lightweight 160px thumbnail (~4-6KB) for instant saving in native storage
      let thumbnail: string | undefined;
      if (imageForApi) {
        try {
          thumbnail = await createThumbnail(imageForApi, 160, 0.5);
        } catch {
          thumbnail = undefined;
        }
      }

      const targetDate = selectedDate || getTodayKey();
      const mealName = result.name || 'Comida Registrada';
      const calories = Number(result.calories) || 0;
      const protein = Number(result.protein) || 0;
      const carbs = Number(result.carbs) || 0;
      const fat = Number(result.fat) || 0;

      addMeal({
        id: mealId,
        name: mealName,
        calories,
        protein,
        carbs,
        fat,
        date: targetDate,
        category,
        notes: result.notes || '',
        imageBase64: thumbnail,
        imageUrl: undefined,
        isAiGenerated: true,
      });

      // If user toggled favorite, save to favoriteMeals
      if (isFavorite) {
        const categoryEmojis: Record<string, string> = {
          desayuno: '🥐',
          almuerzo: '🍲',
          cena: '🍽️',
          snack: '🍎',
        };
        addFavoriteMeal({
          name: mealName,
          calories,
          protein,
          carbs,
          fat,
          emoji: categoryEmojis[category] || '🍲',
        });
      }

      showToast(`✅ ${mealName} (${calories} kcal) registrada${isFavorite ? ' y agregada a Frecuentes' : ''}.`);
      resetForm();
      setIsModalOpen(false);
      onClose();
    } catch (err: any) {
      console.error('Meal AI parsing error:', err);
      showToast(err?.message || 'Error al analizar la comida con IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImageForApi(null);
    setImagePreview(null);
    setDescription('');
    setCategory('almuerzo');
    setIsFavorite(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      setIsModalOpen(false);
      onClose();
    }
  };

  const categories: { key: 'desayuno' | 'almuerzo' | 'cena' | 'snack'; label: string; icon: string }[] = [
    { key: 'desayuno', label: 'Desayuno', icon: '🥐' },
    { key: 'almuerzo', label: 'Almuerzo', icon: '🍲' },
    { key: 'cena', label: 'Cena', icon: '🍽️' },
    { key: 'snack', label: 'Snacks', icon: '🍎' },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Bottom Sheet Modal (Glassmorphism Elevated) */}
      <div
        className="relative glass-surface-elevated border-t border-white/20 w-full max-w-md rounded-t-[38px] p-6 pb-20 z-20 animate-sheet-up space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
              REGISTRO FOTOGRÁFICO
            </span>
            <h2 className="text-2xl font-black text-[#F5F5F7] tracking-tight">Escaneo con IA</h2>
          </div>
          <button
            onClick={handleClose}
            className="glass-pill w-10 h-10 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white hover:border-white/30 active:scale-95 transition-all"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </div>

        {/* Category Selection (Segmented Glass Pills) */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
            Categoría
          </label>
          <div className="glass-surface p-1 rounded-2xl flex gap-1.5 shadow-inner">
            {categories.map((c) => {
              const isActive = category === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'glass-pill-active text-[#F5F5F7] shadow-sm scale-100'
                      : 'text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95'
                  }`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo Upload Dashed Container */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full h-56 rounded-[28px] border-2 border-dashed border-white/20 glass-surface flex flex-col items-center justify-center cursor-pointer hover:border-white/40 active:scale-[0.99] transition-all overflow-hidden group shadow-inner"
        >
          {imagePreview ? (
            <div className="relative w-full h-full">
              <img
                src={imagePreview}
                alt="Foto de la comida"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageForApi(null);
                  setImagePreview(null);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/75 backdrop-blur-sm text-white flex items-center justify-center text-xs shadow-lg hover:scale-110 active:scale-95 transition-transform"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <div className="w-14 h-14 rounded-2xl glass-pill flex items-center justify-center text-2xl text-[#8E8E93] group-hover:scale-110 group-hover:text-white transition-all shadow-sm">
                📷
              </div>
              <span className="text-sm font-black text-[#F5F5F7]">
                Toca para tomar foto de tu plato
              </span>
              <span className="text-[11px] font-semibold text-[#8E8E93]">
                Alta resolución HD para cálculo exacto de macros con Gemini
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        {/* Description Text Box */}
        <div className="p-3.5 rounded-2xl glass-surface border border-white/10 focus-within:border-white/30 transition-all">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del plato (ej: Pollo 200g con arroz y aguacate)..."
            rows={2}
            className="w-full bg-transparent text-sm text-[#F5F5F7] placeholder-[#636366] font-bold focus:outline-none resize-none"
          />
        </div>

        {/* Favorite Toggle Option */}
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border transition-all active:scale-[0.99] ${
            isFavorite
              ? 'bg-[#FFD60A]/10 border-[#FFD60A]/40 text-[#FFD60A]'
              : 'glass-surface border-white/10 text-[#8E8E93] hover:text-[#F5F5F7]'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-black">
            <span>⭐</span>
            <span>Guardar en Comidas Frecuentes</span>
          </div>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              isFavorite
                ? 'bg-[#FFD60A] text-black shadow-[0_0_10px_rgba(255,214,10,0.5)]'
                : 'border border-white/20'
            }`}
          >
            {isFavorite ? '✓' : ''}
          </div>
        </button>

        {/* Action Button */}
        <div className="pt-1 pb-4">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading || (!description.trim() && !imageForApi)}
            className="w-full py-4 rounded-full bg-[#34C759] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(52,199,89,0.35)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <IconSparkles className="w-5 h-5 animate-spin text-black" />
                <span>Analizando con Gemini...</span>
              </>
            ) : (
              <>
                <IconSparkles className="w-5 h-5 text-black" />
                <span>Analizar Comida con IA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
