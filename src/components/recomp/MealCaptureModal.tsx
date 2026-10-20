'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRecompStore } from '@/stores/useRecompStore';
import { useHubStore } from '@/stores/useHubStore';
import { parseMealWithGemini } from '@/lib/gemini';
import { compressImage, createThumbnail, AI_MAX_EDGE, AI_QUALITY, PREVIEW_MAX_EDGE, PREVIEW_QUALITY } from '@/lib/image';
import { deleteMealImage, saveMealImage } from '@/lib/imageStorage';
import { audioEngine } from '@/lib/audio';
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
  const [hdImage, setHdImage] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [description, setDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestSequenceRef = useRef(0);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.querySelector<HTMLElement>('.app-frame'));
  }, []);

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

  useEffect(() => {
    if (!isLoading) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);
    return () => window.clearInterval(timer);
  }, [isLoading]);

  if (!isOpen || !portalRoot) return null;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPreparing(true);
    try {
      // Copia HD (1600 px, calidad 0.88): es la que se ve al abrir la foto y
      // la que se guarda en IndexedDB.
      const hd = await compressImage(file);
      setHdImage(hd);
      setAiImage(null);
    } catch (err: any) {
      console.error('Error compressing image:', err);
      showToast('No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsPreparing(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAnalyze = async () => {
    if (!description.trim() && !hdImage) {
      showToast('Por favor toma una foto o escribe qué vas a comer.');
      return;
    }

    // Unlock audio on the tap because the meal is added after Gemini responds.
    audioEngine.unlock();
    const requestId = ++requestSequenceRef.current;
    setIsLoading(true);
    setElapsedSeconds(0);
    try {
      showToast('🤖 Analizando comida con Gemini...');

      // Copia ligera para la IA: mismo detalle útil, mucho menos peso de subida.
      let aiPayload = aiImage;
      if (hdImage && !aiPayload) {
        aiPayload = await createThumbnail(hdImage, AI_MAX_EDGE, AI_QUALITY);
        setAiImage(aiPayload);
      }
      if (requestId !== requestSequenceRef.current) return;

      const result = await parseMealWithGemini(geminiApiKey, {
        text: description.trim() || undefined,
        imageBase64: aiPayload || undefined,
      });
      if (requestId !== requestSequenceRef.current) return;

      const mealId = `meal-${Date.now()}`;

      // Guardado en paralelo: la copia HD va a IndexedDB y la miniatura ligera
      // se queda en el estado persistido para las listas.
      let thumbnail: string | undefined;
      if (hdImage) {
        const [thumb] = await Promise.all([
          createThumbnail(hdImage, PREVIEW_MAX_EDGE, PREVIEW_QUALITY).catch(() => undefined),
          saveMealImage(mealId, hdImage),
        ]);
        thumbnail = thumb;
      }
      if (requestId !== requestSequenceRef.current) {
        if (hdImage) await deleteMealImage(mealId);
        return;
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
      if (requestId === requestSequenceRef.current) setIsLoading(false);
    }
  };

  const resetForm = () => {
    setHdImage(null);
    setAiImage(null);
    setIsPreparing(false);
    setElapsedSeconds(0);
    setDescription('');
    setCategory('almuerzo');
    setIsFavorite(false);
  };

  const handleClose = () => {
    requestSequenceRef.current += 1;
    setIsLoading(false);
    resetForm();
    setIsModalOpen(false);
    onClose();
  };

  const categories: { key: 'desayuno' | 'almuerzo' | 'cena' | 'snack'; label: string; icon: string }[] = [
    { key: 'desayuno', label: 'Desayuno', icon: '🥐' },
    { key: 'almuerzo', label: 'Almuerzo', icon: '🍲' },
    { key: 'cena', label: 'Cena', icon: '🍽️' },
    { key: 'snack', label: 'Snacks', icon: '🍎' },
  ];

  return createPortal((
    <div className="fixed inset-0 z-[2147483000] flex items-end justify-center animate-fade-in motion-reduce:animate-none sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/80 transition-opacity" onClick={handleClose} aria-label="Cerrar registro con IA" />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-capture-title"
        className="relative z-10 flex w-full max-w-md max-h-[calc(100dvh-12px)] flex-col overflow-hidden rounded-t-[30px] border border-white/[0.08] bg-[#1C1C1E] shadow-2xl animate-sheet-up motion-reduce:animate-none sm:max-h-[min(92dvh,760px)] sm:rounded-[30px]"
      >
        <header className="shrink-0 flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 pb-4 pt-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">RecompAI</span>
            <h2 id="meal-capture-title" className="text-xl font-black text-[#F5F5F7] tracking-tight">Registrar comida</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            title="Cerrar"
            className="relative z-20 shrink-0 bg-[#2C2C2E] border border-white/[0.08] w-10 h-10 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white hover:border-white/30 active:scale-95 motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar px-5 pb-4 pt-4 space-y-4">
        {/* Category Selection (Segmented Glass Pills) */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
            Categoría
          </label>
          <div className="bg-[#1C1C1E] border border-white/[0.08] p-1 rounded-2xl flex gap-1.5 shadow-inner">
            {categories.map((c) => {
              const isActive = category === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`min-w-0 flex-1 py-2 px-1 rounded-xl text-[10px] leading-none font-black flex items-center justify-center gap-1 transition-colors duration-150 motion-reduce:transition-none ${
                    isActive
                      ? 'bg-[#3A3A3C] text-[#F5F5F7] shadow-sm scale-100'
                      : 'text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95 motion-reduce:active:scale-100'
                  }`}
                >
                  <span className="shrink-0 text-xs">{c.icon}</span>
                  <span className="min-w-0 truncate whitespace-nowrap">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo Upload Dashed Container */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full h-44 sm:h-52 rounded-[24px] border-2 border-dashed border-white/20 bg-[#1C1C1E] border border-white/[0.08] flex flex-col items-center justify-center cursor-pointer hover:border-white/40 active:scale-[0.99] motion-reduce:active:scale-100 transition-colors duration-150 motion-reduce:transition-none overflow-hidden group shadow-inner"
        >
          {isPreparing ? (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <IconSparkles className="w-6 h-6 animate-spin text-[#A1F524]" />
              <span className="text-xs font-bold text-[#8E8E93]">Procesando foto…</span>
            </div>
          ) : hdImage ? (
            <div className="relative w-full h-full">
              <img
                src={hdImage}
                alt="Foto de la comida"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHdImage(null);
                  setAiImage(null);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/75  text-white flex items-center justify-center text-xs shadow-sm hover:scale-110 active:scale-95 motion-reduce:active:scale-100 transition-transform duration-150 motion-reduce:transition-none"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2C2C2E] border border-white/[0.08] flex items-center justify-center text-2xl text-[#8E8E93] group-hover:scale-110 group-hover:text-white transition-colors duration-150 motion-reduce:transition-none shadow-sm">
                📷
              </div>
              <span className="text-sm font-black text-[#F5F5F7]">
                Toca para tomar foto de tu plato
              </span>
              <span className="text-[11px] font-semibold text-[#8E8E93]">
                Foto nítida; Gemini calcula los macros automáticamente
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
        <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] border border-white/10 focus-within:border-white/30 transition-colors duration-150 motion-reduce:transition-none">
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
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border transition-colors duration-150 motion-reduce:transition-none active:scale-[0.99] motion-reduce:active:scale-100 ${
            isFavorite
              ? 'bg-[#FFD60A]/10 border-[#FFD60A]/40 text-[#FFD60A]'
              : 'bg-[#1C1C1E] border border-white/[0.08] border-white/10 text-[#8E8E93] hover:text-[#F5F5F7]'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-black">
            <span>⭐</span>
            <span>Guardar en Comidas Frecuentes</span>
          </div>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-colors duration-150 motion-reduce:transition-none ${
              isFavorite
                ? 'bg-[#FFD60A] text-black '
                : 'border border-white/20'
            }`}
          >
            {isFavorite ? '✓' : ''}
          </div>
        </button>

        </div>

        <footer className="shrink-0 border-t border-white/[0.06] bg-[#1C1C1E] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] pt-3">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading || isPreparing || (!description.trim() && !hdImage)}
            className="w-full min-h-12 rounded-full bg-[#A1F524] text-black font-black text-sm flex items-center justify-center gap-2 hover:brightness-105 active:scale-[.98] motion-reduce:active:scale-100 transition-[filter,transform] duration-150 motion-reduce:transition-none disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <IconSparkles className="w-5 h-5 animate-spin text-black" />
                <span>Analizando… {elapsedSeconds}s</span>
              </>
            ) : isPreparing ? (
              <span>Preparando foto…</span>
            ) : (
              <><IconSparkles className="w-5 h-5 text-black" /><span>Analizar comida</span></>
            )}
          </button>
        </footer>
      </section>
    </div>
  ), portalRoot);
};
