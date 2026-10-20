'use client';

import React, { useEffect, useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { IconCheck, IconChevronRight, IconPlus, IconTrash } from '../common/Icons';

export const ProfilePage: React.FC = () => {
  const {
    userName,
    geminiApiKey,
    setGeminiApiKey,
    showToast,
    themeMode,
    setThemeMode,
  } = useHubStore();
  const {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    supplements,
    addSupplement,
    deleteSupplement,
    measurements,
    setIsModalOpen,
  } = useRecompStore();

  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [isApiEditorOpen, setIsApiEditorOpen] = useState(false);
  const [showAddSuppModal, setShowAddSuppModal] = useState(false);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppDose, setNewSuppDose] = useState('3-5g');
  const [newSuppTime, setNewSuppTime] = useState('08:00');

  const latestWeight = measurements[0]?.weightKg;

  useEffect(() => setApiKeyInput(geminiApiKey), [geminiApiKey]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setGeminiApiKey(apiKeyInput.trim());
    setIsApiEditorOpen(false);
    showToast('API Key de Gemini guardada.');
  };

  const handleAddSupp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppName.trim()) return;
    addSupplement({
      name: newSuppName.trim(),
      dosage: newSuppDose.trim(),
      timeOfDay: newSuppTime,
      icon: '💊',
    });
    setNewSuppName('');
    setShowAddSuppModal(false);
    setIsModalOpen(false);
    showToast('Suplemento añadido.');
  };

  const closeSuppModal = () => {
    setShowAddSuppModal(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-36 animate-fade-in motion-reduce:animate-none relative z-10">
      <header className="px-1 pt-1">
        <h1 className="text-2xl font-black tracking-tight text-[#F5F5F7]">Perfil y preferencias</h1>
      </header>

      <section className="fitness-card p-4 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#2C2C2E] flex items-center justify-center text-2xl shrink-0" aria-hidden="true">💪</div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-[#F5F5F7] truncate">{userName}</h2>
          <p className="text-xs font-semibold text-[#8E8E93] mt-0.5">
            Recomposición corporal{latestWeight ? <> <span aria-hidden="true">·</span> <strong className="text-[#A1F524]">{latestWeight} kg</strong></> : null}
          </p>
        </div>
      </section>

      <section className="fitness-card p-4 space-y-3">
        <h2 className="text-center text-xs font-bold text-[#8E8E93]">Esquema de color</h2>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#2C2C2E] p-1">
          {(['dark', 'light'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={themeMode === mode}
              onClick={() => setThemeMode(mode)}
              className={`min-h-10 rounded-xl px-3 text-xs font-bold transition-[background,color,transform] duration-200 active:scale-[.98] motion-reduce:transition-none ${
                themeMode === mode ? 'bg-[#3A3A3C] text-[#F5F5F7] shadow-sm' : 'text-[#8E8E93] hover:text-[#F5F5F7]'
              }`}
            >
              {mode === 'dark' ? 'Oscuro' : 'Claro'}
            </button>
          ))}
        </div>
      </section>

      <section className="fitness-card p-4 space-y-1">
        <div className="flex items-center justify-between px-1 pb-2">
          <h2 className="text-sm font-black text-[#F5F5F7]">Metas diarias</h2>
          <span className="text-[10px] font-semibold text-[#8E8E93]">Objetivos</span>
        </div>
        <div className="divide-y divide-white/[0.07]">
          <div className="flex items-center gap-3 py-3 px-1">
            <span className="w-9 h-9 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-base" aria-hidden="true">🔥</span>
            <span className="flex-1 text-sm font-semibold text-[#F5F5F7]">Calorías</span>
            <strong className="text-sm font-black text-[#A1F524] tabular-nums">{targetCalories} <span className="text-[11px]">kcal</span></strong>
          </div>
          <div className="flex items-center gap-3 py-3 px-1">
            <span className="w-9 h-9 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-base" aria-hidden="true">🥩</span>
            <span className="flex-1 text-sm font-semibold text-[#F5F5F7]">Proteína</span>
            <strong className="text-sm font-black text-[#64D2FF] tabular-nums">{targetProtein} <span className="text-[11px]">g</span></strong>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="rounded-xl bg-[#2C2C2E] px-3 py-2.5 flex justify-between gap-2">
              <span className="text-xs text-[#8E8E93]">Carbohidratos</span>
              <strong className="text-xs text-[#F5F5F7]">{targetCarbs} g</strong>
            </div>
            <div className="rounded-xl bg-[#2C2C2E] px-3 py-2.5 flex justify-between gap-2">
              <span className="text-xs text-[#8E8E93]">Grasas</span>
              <strong className="text-xs text-[#F5F5F7]">{targetFat} g</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="fitness-card overflow-hidden">
        <button
          type="button"
          onClick={() => setIsApiEditorOpen((open) => !open)}
          aria-expanded={isApiEditorOpen}
          className="w-full p-4 flex items-center gap-3 text-left fitness-press"
        >
          <span className="w-10 h-10 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-lg" aria-hidden="true">✦</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[#F5F5F7]">Gemini</span>
            <span className="block text-xs text-[#8E8E93] truncate">{geminiApiKey ? 'Conectado' : 'Añadir clave de API'}</span>
          </span>
          <span className={`text-xs font-bold ${geminiApiKey ? 'text-[#A1F524]' : 'text-[#8E8E93]'}`}>{geminiApiKey ? 'Activo' : 'Configurar'}</span>
          <IconChevronRight className={`w-4 h-4 text-[#8E8E93] transition-transform ${isApiEditorOpen ? 'rotate-90' : ''}`} />
        </button>
        {isApiEditorOpen && (
          <form onSubmit={handleSaveApiKey} className="px-4 pb-4 pt-1 space-y-3 border-t border-white/[0.07]">
            <label htmlFor="gemini-api-key" className="sr-only">Clave de API de Gemini</label>
            <input
              id="gemini-api-key"
              type="password"
              autoComplete="off"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Clave de API"
              className="w-full p-3 rounded-xl bg-[#2C2C2E] text-sm text-[#F5F5F7]"
            />
            <button type="submit" className="w-full py-3 rounded-xl bg-[#A1F524] text-black font-bold text-sm active:scale-[.98] motion-reduce:active:scale-100">
              <IconCheck className="inline w-4 h-4 mr-1" /> Guardar clave
            </button>
          </form>
        )}
      </section>

      <section className="fitness-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-[#F5F5F7]">Suplementos</h2>
          <button
            type="button"
            onClick={() => { setShowAddSuppModal(true); setIsModalOpen(true); }}
            className="inline-flex items-center gap-1 rounded-full bg-[#2C2C2E] px-3 py-2 text-xs font-bold text-[#A1F524] fitness-press"
          >
            <IconPlus className="w-3.5 h-3.5" /> Añadir
          </button>
        </div>
        {supplements.length ? (
          <div className="divide-y divide-white/[0.07]">
            {supplements.map((supplement) => (
              <div key={supplement.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
                <span className="w-9 h-9 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-base" aria-hidden="true">{supplement.icon || '💊'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#F5F5F7] truncate">{supplement.name}</p>
                  <p className="text-xs text-[#8E8E93]">{supplement.dosage} · {supplement.timeOfDay}</p>
                </div>
                <button type="button" aria-label={`Eliminar ${supplement.name}`} onClick={() => deleteSupplement(supplement.id)} className="p-2 text-[#8E8E93] hover:text-[#FF453A]">
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : <p className="py-2 text-xs text-[#8E8E93]">Aún no hay suplementos.</p>}
      </section>

      {showAddSuppModal && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center p-3 animate-fade-in motion-reduce:animate-none">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={closeSuppModal} aria-label="Cerrar" />
          <section role="dialog" aria-modal="true" aria-labelledby="add-supp-title" className="relative w-full max-w-md rounded-[28px] bg-[#1C1C1E] border border-white/10 p-5 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] space-y-4 animate-sheet-up motion-reduce:animate-none">
            <div className="flex items-center justify-between gap-3">
              <h2 id="add-supp-title" className="text-lg font-black text-[#F5F5F7]">Añadir suplemento</h2>
              <button type="button" onClick={closeSuppModal} className="w-9 h-9 rounded-full bg-[#2C2C2E] text-[#8E8E93]" aria-label="Cerrar">×</button>
            </div>
            <form onSubmit={handleAddSupp} className="space-y-3">
              <input type="text" placeholder="Nombre" value={newSuppName} onChange={(e) => setNewSuppName(e.target.value)} required />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Dosis" value={newSuppDose} onChange={(e) => setNewSuppDose(e.target.value)} />
                <input type="time" aria-label="Hora" value={newSuppTime} onChange={(e) => setNewSuppTime(e.target.value)} />
              </div>
              <button type="submit" className="w-full rounded-xl bg-[#A1F524] text-black py-3 font-bold text-sm fitness-press">Guardar</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
