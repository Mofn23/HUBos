'use client';

import React, { useEffect, useState } from 'react';
import { MealItem, useRecompStore } from '@/stores/useRecompStore';
import { getMealImage } from '@/lib/imageStorage';
import { IconTrash } from '../common/Icons';

interface MealDetailModalProps {
  meal: MealItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  isOpen,
  onClose,
  onDelete,
}) => {
  const { setIsModalOpen } = useRecompStore();
  const [hdPhoto, setHdPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsModalOpen(true);
    }
    return () => {
      setIsModalOpen(false);
    };
  }, [isOpen, setIsModalOpen]);

  useEffect(() => {
    if (meal?.id) {
      getMealImage(meal.id).then((img) => {
        if (img) setHdPhoto(img);
      });
    } else {
      setHdPhoto(null);
    }
  }, [meal?.id]);

  if (!isOpen || !meal) return null;

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'desayuno':
        return { label: 'Desayuno', icon: '🥐' };
      case 'almuerzo':
        return { label: 'Almuerzo', icon: '🍲' };
      case 'cena':
        return { label: 'Cena', icon: '🍽️' };
      case 'snack':
      default:
        return { label: 'Snack', icon: '🍎' };
    }
  };

  const catInfo = getCategoryBadge(meal.category);
  const photo = hdPhoto || meal.imageUrl || meal.imageBase64;

  const handleDelete = () => {
    if (confirm(`¿Eliminar ${meal.name}?`)) {
      onDelete(meal.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* MonAI Bottom Sheet */}
      <div
        className="relative bg-[#121214] border-t border-white/10 w-full max-w-md rounded-t-[36px] p-6 pb-16 z-20 animate-sheet-up space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#242426] text-xs font-black text-[#F5F5F7] flex items-center gap-1.5">
              <span>{catInfo.icon}</span>
              <span>{catInfo.label}</span>
            </span>
            {meal.isAiGenerated && (
              <span className="px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] text-[10px] font-black">
                ✨ Escaneo IA
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </div>

        {/* Meal Photo (if uploaded) */}
        {photo && (
          <div className="relative w-full h-52 rounded-3xl overflow-hidden border border-white/10 shadow-lg">
            <img
              src={photo}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title & Calories Banner */}
        <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">{meal.name}</h3>
            <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
              Fecha: {meal.date}
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#242426] border border-white/10 text-right">
            <span className="text-base font-black text-[#34C759] block">
              {meal.calories}
            </span>
            <span className="text-[10px] font-bold text-[#8E8E93] uppercase block">
              kcal
            </span>
          </div>
        </div>

        {/* Macronutrient Breakdown Grid (4 Cards) */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Protein */}
          <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 text-center space-y-0.5 shadow-sm">
            <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-wider block">
              Proteína
            </span>
            <span className="text-base font-black text-[#34C759] block">
              {meal.protein}g
            </span>
            <span className="text-[9px] font-bold text-[#8E8E93] block">
              {meal.protein * 4} kcal
            </span>
          </div>

          {/* Carbs */}
          <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 text-center space-y-0.5 shadow-sm">
            <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-wider block">
              Carbos
            </span>
            <span className="text-base font-black text-[#0A84FF] block">
              {meal.carbs}g
            </span>
            <span className="text-[9px] font-bold text-[#8E8E93] block">
              {meal.carbs * 4} kcal
            </span>
          </div>

          {/* Fat */}
          <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 text-center space-y-0.5 shadow-sm">
            <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-wider block">
              Grasas
            </span>
            <span className="text-base font-black text-[#FF9500] block">
              {meal.fat}g
            </span>
            <span className="text-[9px] font-bold text-[#8E8E93] block">
              {meal.fat * 9} kcal
            </span>
          </div>
        </div>

        {/* Notes / Description */}
        {meal.notes && (
          <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
              Descripción / Notas
            </span>
            <p className="text-xs font-bold text-[#F5F5F7] leading-relaxed">
              {meal.notes}
            </p>
          </div>
        )}

        {/* Delete Action Button */}
        <div className="pt-2 pb-4 flex justify-center">
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 rounded-full bg-[#E8505B]/15 border border-[#E8505B]/30 text-[#E8505B] font-black text-xs flex items-center gap-2 active:scale-95 transition-all"
          >
            <IconTrash className="w-4 h-4" />
            <span>Eliminar Comida</span>
          </button>
        </div>
      </div>
    </div>
  );
};
