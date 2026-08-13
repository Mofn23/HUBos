'use client';

import React, { useState, useRef } from 'react';
import { BottomModal } from '../common/BottomModal';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore, MealItem } from '@/stores/useRecompStore';
import { parseMealWithGemini } from '@/lib/gemini';
import { getTodayKey } from '@/lib/date';
import { IconCamera, IconSparkles, IconPlus, IconCheck, IconX } from '../common/Icons';

interface MealCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MealCaptureModal: React.FC<MealCaptureModalProps> = ({ isOpen, onClose }) => {
  const { geminiApiKey, showToast } = useHubStore();
  const { addMeal } = useRecompStore();

  const [textInput, setTextInput] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Extracted/Editable Fields
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealItem['mealType']>('almuerzo');
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAnalyzeWithAI = async () => {
    if (!textInput.trim() && !imageBase64) {
      showToast('Ingresa una descripción o sube una foto del plato.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await parseMealWithGemini(geminiApiKey, {
        text: textInput,
        imageBase64: imageBase64 || undefined,
      });

      setName(result.name);
      setCalories(String(result.calories));
      setProtein(String(result.protein));
      setCarbs(String(result.carbs));
      setFat(String(result.fat));
      setMealType(result.mealType);
      setNotes(result.notes || '');
      showToast('¡Comida analizada con Gemini 2.0 Flash!');
    } catch (err: any) {
      console.error('Meal AI parsing error:', err);
      showToast(err?.message || 'Error al analizar la comida con IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMeal = () => {
    if (!name.trim()) {
      showToast('Por favor asigna un nombre al plato.');
      return;
    }

    const todayStr = getTodayKey();
    addMeal({
      name: name.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      date: todayStr,
      mealType,
      notes: notes.trim(),
      imageBase64: imageBase64 || undefined,
      isAiGenerated: Boolean(imageBase64 || textInput),
    });

    showToast(`✅ Comida registrada: ${name}`);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTextInput('');
    setImageBase64(null);
    setImagePreview(null);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setMealType('almuerzo');
    setNotes('');
  };

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title="Registrar Comida con IA"
      subtitle="Escanea una foto o describe tu plato con Gemini 2.0"
    >
      <div className="space-y-4 pb-6">
        {/* Image & Text AI Input Box */}
        <div className="p-4 rounded-2xl bg-[#242426] border border-white/10 space-y-3">
          <div className="flex gap-2">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Describe lo que comiste (ej. 200g salmón con papas y ensalada)..."
              rows={2}
              disabled={isLoading}
              className="flex-1 bg-transparent text-xs text-[#F5F5F7] placeholder-[#8E8E93] focus:outline-none resize-none"
            />

            {/* Photo trigger */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-[#8E8E93] hover:text-[#F5F5F7] active:scale-95 transition-all shrink-0"
            >
              <IconCamera className="w-5 h-5 text-[#34C759]" />
              <span className="text-[9px] mt-0.5 font-bold">Foto</span>
            </button>
          </div>

          {/* Photo Preview if loaded */}
          {imagePreview && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Comida preview" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  setImageBase64(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleAnalyzeWithAI}
            disabled={isLoading || (!textInput.trim() && !imageBase64)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#34C759] to-[#0A84FF] text-black font-extrabold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-40 shadow-lg"
          >
            <IconSparkles className="w-4 h-4 text-black" />
            <span>{isLoading ? 'Analizando con Gemini 2.0...' : 'Desglosar Macros con IA'}</span>
          </button>
        </div>

        {/* Nutritional Breakdown Form */}
        <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-3.5">
          <p className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            Valores Nutricionales
          </p>

          <div>
            <label className="block text-xs text-[#8E8E93] mb-1 font-medium">Nombre del Plato</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Bowl de Atún y Arroz"
              className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#34C759]"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] text-[#8E8E93] mb-1 font-bold">Calorías</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="kcal"
                className="w-full bg-[#242426] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-black text-[#F5F5F7] text-center focus:outline-none focus:border-[#34C759]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#34C759] mb-1 font-bold">Proteína</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="g"
                className="w-full bg-[#242426] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-black text-[#34C759] text-center focus:outline-none focus:border-[#34C759]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#FF9500] mb-1 font-bold">Carbos</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="g"
                className="w-full bg-[#242426] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-black text-[#FF9500] text-center focus:outline-none focus:border-[#FF9500]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#0A84FF] mb-1 font-bold">Grasas</label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="g"
                className="w-full bg-[#242426] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-black text-[#0A84FF] text-center focus:outline-none focus:border-[#0A84FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8E8E93] mb-1 font-medium">Momento del Día</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['desayuno', 'almuerzo', 'cena', 'snack', 'pre-entreno', 'post-entreno'] as const).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all ${
                      mealType === type
                        ? 'bg-[#34C759] text-black shadow'
                        : 'bg-[#242426] text-[#8E8E93] hover:text-[#F5F5F7]'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          {notes && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[11px] text-[#8E8E93] italic">💡 {notes}</p>
            </div>
          )}

          <button
            onClick={handleSaveMeal}
            disabled={!name.trim()}
            className="w-full py-3 rounded-2xl bg-[#34C759] text-black font-extrabold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-40 shadow-lg mt-2"
          >
            <IconCheck className="w-4 h-4 stroke-[3]" />
            <span>Guardar Comida en RecompAI</span>
          </button>
        </div>
      </div>
    </BottomModal>
  );
};
