'use client';

import React, { useState, useRef } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { parseMealWithGemini } from '@/lib/gemini';
import { getTodayKey } from '@/lib/date';
import { IconCamera, IconSparkles, IconX } from '../common/Icons';

interface MealCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MealCaptureModal: React.FC<MealCaptureModalProps> = ({ isOpen, onClose }) => {
  const { geminiApiKey, showToast } = useHubStore();
  const { addMeal, selectedDate } = useRecompStore();

  const [category, setCategory] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('almuerzo');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!description.trim() && !imageBase64) {
      showToast('Toma una foto o escribe una descripción de tu comida.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await parseMealWithGemini(geminiApiKey, {
        text: description,
        imageBase64: imageBase64 || undefined,
      });

      const targetDate = selectedDate || getTodayKey();
      addMeal({
        name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        date: targetDate,
        category,
        notes: result.notes || '',
        imageBase64: imageBase64 || undefined,
        imageUrl: imageBase64 || undefined,
        isAiGenerated: true,
      });

      showToast(`✅ ${result.name} (${result.calories} kcal) registrada.`);
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
    setImageBase64(null);
    setImagePreview(null);
    setDescription('');
    setCategory('almuerzo');
  };

  const categories: { key: 'desayuno' | 'almuerzo' | 'cena' | 'snack'; label: string; icon: string }[] = [
    { key: 'desayuno', label: 'Desayuno', icon: '🥐' },
    { key: 'almuerzo', label: 'Almuerzo', icon: '🍲' },
    { key: 'cena', label: 'Cena', icon: '🍽️' },
    { key: 'snack', label: 'Snacks', icon: '🍎' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Bottom Sheet Modal matching Screenshot */}
      <div
        className="relative bg-[#121214] border-t border-white/10 w-full max-w-md rounded-t-[32px] p-6 pb-[calc(env(safe-area-inset-bottom,24px)+28px)] z-20 animate-sheet-up space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#F5F5F7]">Escaneo IA</h2>
          <button
            onClick={() => {
              if (!isLoading) onClose();
            }}
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
                  setImageBase64(null);
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

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading || (!description.trim() && !imageBase64)}
          className="w-full py-4 rounded-full bg-[#34C759] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(52,199,89,0.35)] active:scale-95 transition-all disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <IconSparkles className="w-5 h-5 animate-spin" />
              <span>Analizando con Gemini 2.0...</span>
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
  );
};
