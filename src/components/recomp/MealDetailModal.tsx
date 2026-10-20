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
    } else {
      setIsModalOpen(false);
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
      setIsModalOpen(false);
      onClose();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleCloseModal}
      />

      {/* Bottom Sheet (Apple Fitness Sheet) */}
      <div
        className="relative bg-[#1C1C1E] border-t border-white/15 w-full max-w-md rounded-t-[38px] p-6 pb-16 z-20 animate-sheet-up space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#2C2C2E] border border-white/5 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7] flex items-center gap-1.5 shadow-sm">
              <span>{catInfo.icon}</span>
              <span>{catInfo.label}</span>
            </span>
            {meal.isAiGenerated && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-black">
                ✨ Escaneo con IA
              </span>
            )}
          </div>

          <button
            onClick={handleCloseModal}
            className="w-9 h-9 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors fitness-press"
          >
            <span className="text-sm font-bold">✕</span>
          </button>
        </div>

        {/* Meal Photo HD */}
        {photo && (
          <div className="relative w-full h-56 rounded-[28px] overflow-hidden border border-white/15 shadow-xl">
            <img
              src={photo}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title & Calories Card */}
        <div className="bg-[#242426] border border-white/5 p-4 rounded-[24px] flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">{meal.name}</h3>
            <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
              Fecha: {meal.date}
            </p>
          </div>

          <div className="bg-[#2C2C2E] border border-white/5 px-4 py-2 rounded-2xl text-right">
            <span className="text-base font-black text-[#FA114F] block leading-none">
              {meal.calories}
            </span>
            <span className="text-[9px] font-black text-[#8E8E93] uppercase tracking-wider block mt-0.5">
              kcal
            </span>
          </div>
        </div>

        {/* Macronutrient Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Protein - Move Red #FA114F */}
          <div className="bg-[#242426] border border-white/5 p-3.5 rounded-[22px] text-center space-y-1 shadow-sm">
            <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-wider block">
              Proteína
            </span>
            <span className="text-base font-black text-[#FA114F] block">
              {meal.protein}g
            </span>
            <span className="text-[9px] font-bold text-[#8E8E93] block">
              {meal.protein * 4} kcal
            </span>
          </div>

          {/* Carbs - Stand Blue #00F0FF */}
          <div className="bg-[#242426] border border-white/5 p-3.5 rounded-[22px] text-center space-y-1 shadow-sm">
            <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-wider block">
              Carbos
            </span>
            <span className="text-base font-black text-[#00F0FF] block">
              {meal.carbs}g
            </span>
            <span className="text-[9px] font-bold text-[#8E8E93] block">
              {meal.carbs * 4} kcal
            </span>
          </div>

          {/* Fat - Awards Gold #FFD60A */}
          <div className="bg-[#242426] border border-white/5 p-3.5 rounded-[22px] text-center space-y-1 shadow-sm">
            <span className="text-[10px] font-black text-[#8E8E93] uppercase tracking-wider block">
              Grasas
            </span>
            <span className="text-base font-black text-[#FFD60A] block">
              {meal.fat}g
            </span>
            <span className="text-[9px] font-bold text-[#8E8E93] block">
              {meal.fat * 9} kcal
            </span>
          </div>
        </div>

        {/* Notes / Description */}
        {meal.notes && (
          <div className="bg-[#242426] border border-white/5 p-4 rounded-[22px] space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
              Descripción / Notas
            </span>
            <p className="text-xs font-bold text-[#F5F5F7] leading-relaxed">
              {meal.notes}
            </p>
          </div>
        )}

        {/* Delete Action Button */}
        <div className="pt-2 pb-2 flex justify-center">
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2.5 rounded-full bg-[#FA114F]/15 border border-[#FA114F]/30 text-[#FA114F] font-black text-xs flex items-center gap-2 fitness-press transition-all shadow-sm"
          >
            <IconTrash className="w-4 h-4" />
            <span>Eliminar Comida</span>
          </button>
        </div>
      </div>
    </div>
  );
};
