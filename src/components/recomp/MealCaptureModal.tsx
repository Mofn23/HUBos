'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { parseMealWithGemini } from '@/lib/gemini';
import { getTodayKey } from '@/lib/date';
import { compressImage, createThumbnail } from '@/lib/image';
import { saveMealImage } from '@/lib/imageStorage';
import { IconSparkles } from '../common/Icons';

interface MealCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MealCaptureModal: React.FC<MealCaptureModalProps> = ({ isOpen, onClose }) => {
  const { geminiApiKey, showToast } = useHubStore();
  const { addMeal, addFavoriteMeal, selectedDate, setIsModalOpen } = useRecompStore();

  const [category, setCategory] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('almuerzo');
  // Full HD compressed image for Gemini API and IndexedDB storage
  const [imageForApi, setImageForApi] = useState<string | null>(null);
  // Preview for display in the modal UI
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsModalOpen(true);
    }
    return () => {
      if (!isOpen) {
        setIsModalOpen(false);
      }
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
      showToast('Toma una foto o escribe una descripción de tu comida.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await parseMealWithGemini(geminiApiKey, {
        text: description.trim() || undefined,
        imageBase64: imageForApi || undefined,
      });

      // Generate a stable ID for the meal
      const mealId = `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      // Save high-resolution image to IndexedDB (unlimited iPhone storage quota)
      if (imageForApi) {
        await saveMealImage(mealId, imageForApi);
      }

      // Generate a sharp 420px preview thumbnail for fast list display in localStorage
      let thumbnail: string | undefined;
      if (imageForApi) {
        try {
          thumbnail = await createThumbnail(imageForApi, 420, 0.65);
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
    <div className="fixed inset-0 z-[99999] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Bottom Sheet Modal */}
      <div
        className="relative bg-[#121214] border-t border-white/10 w-full max-w-md rounded-t-[36px] p-6 pb-20 z-20 animate-sheet-up space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#F5F5F7]">Escaneo IA</h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
            CATEGORÍA
          </label>
          <div className="flex gap-2">
            {categories.map((c) => {
              const isActive = category === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`flex-1 py-2.5 px-2 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#242426] border border-white/15 text-[#F5F5F7] shadow-sm'
                      : 'bg-transparent text-[#8E8E93] hover:text-[#F5F5F7]'
                  }`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo Upload Dashed Container */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full h-56 rounded-3xl border-2 border-dashed border-white/15 bg-[#1C1C1E] flex flex-col items-center justify-center cursor-pointer hover:border-white/25 active:scale-[0.99] transition-all overflow-hidden group"
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
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/75 backdrop-blur-sm text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-[#242426] flex items-center justify-center text-2xl text-[#8E8E93]">
                📷
              </div>
              <span className="text-sm font-extrabold text-[#F5F5F7]">
                Toca para tomar foto de tu plato
              </span>
              <span className="text-[11px] font-semibold text-[#8E8E93]">
                Alta resolución HD para cálculo exacto de macros
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
        <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del plato (ej: Pollo 200g con arroz)..."
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
              : 'bg-[#1C1C1E] border-white/5 text-[#8E8E93] hover:text-[#F5F5F7]'
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
        <div className="pt-1 pb-8">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading || (!description.trim() && !imageForApi)}
            className="w-full py-4.5 rounded-full bg-[#34C759] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(52,199,89,0.35)] active:scale-95 transition-all disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <IconSparkles className="w-5 h-5 animate-spin" />
                <span>Analizando con Gemini 3.5...</span>
              </>
            ) : (
              <>
                <IconSparkles className="w-5 h-5 text-black" />
                <span>Analizar Comida</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
