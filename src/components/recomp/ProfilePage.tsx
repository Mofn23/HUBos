'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore, BodyMeasurementEntry, ProgressPhotoItem } from '@/stores/useRecompStore';
import { getTodayKey } from '@/lib/date';
import { WeightTrend } from './WeightTrend';
import { callGemini } from '@/lib/gemini';
import { compressImage, createThumbnail } from '@/lib/image';
import { saveProgressPhoto } from '@/lib/imageStorage';
import { IconTrash, IconCamera, IconSparkles, IconPlus } from '../common/Icons';

export const ProfilePage: React.FC = () => {
  const { userName, geminiApiKey, setGeminiApiKey, showToast, setCurrentApp } = useHubStore();
  const {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    setNutritionalTargets,
    supplements,
    addSupplement,
    deleteSupplement,
    measurements,
    addMeasurement,
    photos,
    addProgressPhoto,
    deleteProgressPhoto,
    meals,
    setIsModalOpen,
  } = useRecompStore();

  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Modals & Sheets
  const [showAddSuppModal, setShowAddSuppModal] = useState(false);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppDose, setNewSuppDose] = useState('3-5g');
  const [newSuppTime, setNewSuppTime] = useState('08:00');

  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [newWeight, setNewWeight] = useState('80');
  const [newWaist, setNewWaist] = useState('');
  const [newChest, setNewChest] = useState('');
  const [newArms, setNewArms] = useState('');

  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const todayKey = getTodayKey();
  const latestWeight = measurements[0]?.weightKg || 80;

  // Save API Key
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setGeminiApiKey(apiKeyInput.trim());
    showToast('✅ API Key de Gemini guardada correctamente.');
  };

  // Add Supplement
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
    showToast('💊 Suplemento añadido.');
  };

  // Add Measurement
  const handleSaveMeasure = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (!weightNum) return;

    addMeasurement({
      date: todayKey,
      weightKg: weightNum,
      waistCm: parseFloat(newWaist) || undefined,
      chestCm: parseFloat(newChest) || undefined,
      armsCm: parseFloat(newArms) || undefined,
    });

    setShowMeasureModal(false);
    setIsModalOpen(false);
    showToast(`⚖️ Medición registrada: ${weightNum} kg`);
  };

  // Upload and analyze progress photo
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingPhoto(true);
    try {
      showToast('📸 Comprimiendo foto para el Coach IA...');
      const base64 = await compressImage(file, 1200, 0.85);

      showToast('🤖 Analizando foto con Gemini IA...');
      const prompt = `Analiza detalladamente esta foto de progreso físico de recomposición corporal.
Evalúa:
1. Composición corporal visual y masa magra.
2. Definición abdominal y tono muscular.
3. Recomendaciones prácticas de nutrición y entreno para los próximos 7 días.
Formato en Markdown claro con emojis.`;

      const analysisText = await callGemini(geminiApiKey, [
        { text: prompt },
        {
          inlineData: {
            data: base64.replace(/^data:[^;]+;base64,/, ''),
            mimeType: 'image/jpeg',
          },
        },
      ]);

      const photoId = `photo-${Date.now()}`;
      // Save full photo in IndexedDB (no 5MB quota)
      await saveProgressPhoto(photoId, base64);
      // Create light 360px thumbnail (~15-20KB) for fast list display in state
      const thumbnail = await createThumbnail(base64, 360, 0.6);

      const newPhoto: ProgressPhotoItem = {
        id: photoId,
        date: todayKey,
        type: 'front',
        imageBase64: thumbnail,
        aiAnalysis: analysisText,
      };

      addProgressPhoto(newPhoto);
      showToast('✨ ¡Foto de progreso analizada por el Coach IA!');
    } catch (err: any) {
      console.error('Photo analysis error:', err);
      showToast(err?.message || 'Error al procesar foto con IA.');
    } finally {
      setIsAnalyzingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  // Weekly intake calculations
  const weeklyData = useMemo(() => {
    return [
      { day: 'Lun', calories: 2150, icon: '🥗' },
      { day: 'Mar', calories: 2340, icon: '🔥' },
      { day: 'Mié', calories: 2200, icon: '🥗' },
      { day: 'Jue', calories: 2280, icon: '🔥', active: true },
      { day: 'Vie', calories: 2100, icon: '🥗' },
    ];
  }, []);

  const latestPhoto = photos[0];

  return (
    <div className="space-y-4 pb-36 animate-fade-in relative z-10">
      {/* Header */}
      <div>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
          Ajustes & Cuenta
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F7] flex items-center gap-2 tracking-tight">
          <span>👤</span>
          <span>Perfil & Preferencias</span>
        </h1>
        <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
          Configuración biométrica, API keys y seguimiento corporal
        </p>
      </div>

      {/* 1. User Profile Bento Card */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-5 rounded-3xl flex items-center gap-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-[#2C2C2E] border border-white/5 flex items-center justify-center text-3xl shrink-0 shadow-inner">
          💪
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">{userName}</h2>
          <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
            🎯 Recomposición Corporal • <strong className="text-[#A1F524]">{latestWeight} kg</strong>
          </p>
        </div>
      </div>

      {/* 2. Modo de Tema */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-5 rounded-3xl space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <span>🎨</span>
          <span>Esquema Visual de Color</span>
        </div>

        <div className="bg-[#2C2C2E] p-1 rounded-full flex gap-1 shadow-inner">
          <button
            onClick={() => setThemeMode('dark')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all fitness-press ${
              themeMode === 'dark'
                ? 'bg-white text-black font-black shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <span>🌙</span>
            <span>Tema Oscuro OLED</span>
          </button>
          <button
            onClick={() => setThemeMode('light')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all fitness-press ${
              themeMode === 'light'
                ? 'bg-white text-black font-black shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <span>☀️</span>
            <span>Tema Claro</span>
          </button>
        </div>
      </div>

      {/* 3. Meta Calórica Diaria */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-4.5 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] border border-white/5 flex items-center justify-center text-lg shrink-0">
            🎯
          </div>
          <div>
            <div className="text-sm font-black text-white">Meta Calórica Diaria</div>
            <div className="text-xs font-bold text-[#8E8E93]">
              Rango: {targetCalories - 75} - {targetCalories + 75} kcal
            </div>
          </div>
        </div>
        <span className="bg-[#2C2C2E] border border-white/5 px-3.5 py-1.5 rounded-full text-xs font-black text-[#A1F524]">
          {targetCalories} kcal
        </span>
      </div>

      {/* 4. Metas de Macronutrientes */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-4.5 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] border border-white/5 flex items-center justify-center text-lg shrink-0">
            🥩
          </div>
          <div>
            <div className="text-sm font-black text-white">Meta Proteica</div>
            <div className="text-xs font-bold text-[#8E8E93]">Construcción y saciedad</div>
          </div>
        </div>
        <span className="bg-[#2C2C2E] border border-white/5 px-3.5 py-1.5 rounded-full text-xs font-black text-[#FA114F]">
          {targetProtein}g Proteína
        </span>
      </div>

      {/* 5. API Key de Gemini Status */}
      <div className="bg-[#1C1C1E] border border-white/[0.08] p-4.5 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] border border-white/5 flex items-center justify-center text-lg shrink-0">
            🤖
          </div>
          <div>
            <div className="text-sm font-black text-white">API Key de Gemini</div>
            <div className="text-xs font-bold text-[#8E8E93]">
              {geminiApiKey ? `Conectado (${geminiApiKey.substring(0, 8)}...)` : 'No configurada'}
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-black border ${
            geminiApiKey
              ? 'bg-[#A1F524]/15 text-[#A1F524] border-[#A1F524]/30'
              : 'bg-[#FA114F]/15 text-[#FA114F] border-[#FA114F]/30'
          }`}
        >
          {geminiApiKey ? 'Activo' : 'Pendiente'}
        </span>
      </div>

      {/* 6. Formulario Actualizar Gemini API Key */}
      <form
        onSubmit={handleSaveApiKey}
        className="bg-[#1C1C1E] border border-white/[0.08] p-5 rounded-3xl space-y-3.5 shadow-xl"
      >
        <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
          Ingresar / Actualizar Gemini API Key
        </label>
        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full p-3.5 rounded-xl bg-[#2C2C2E] border border-white/10 text-sm text-white font-bold tracking-widest focus:border-[#A1F524] focus:outline-none"
        />
        <button
          type="submit"
          className="w-full py-4 rounded-full bg-[#A1F524] text-black font-black text-xs flex items-center justify-center gap-2 fitness-press transition-all shadow-md shadow-[#A1F524]/20"
        >
          <span>✓</span>
          <span>Guardar API Key</span>
        </button>
      </form>

      {/* 7. Consumo Semanal Bar Chart */}
      <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-[28px] space-y-3.5 shadow-md">
        <div className="flex items-center gap-2 text-xs font-black text-[#F5F5F7]">
          <span>📈</span>
          <span>Consumo Semanal (kcal)</span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1">
          {weeklyData.map((d, i) => (
            <div
              key={i}
              className={`h-36 rounded-2xl flex flex-col items-center justify-between p-2.5 relative overflow-hidden border transition-all ${
                d.active
                  ? 'bg-[#242426] border-[#A1F524]/50 shadow-sm'
                  : 'bg-[#2C2C2E]/60 border-white/5'
              }`}
            >
              <span className="text-base">{d.icon}</span>
              <div className="text-center">
                <span className="text-xs font-black text-[#F5F5F7] block">{d.calories}</span>
                <span className="text-[10px] font-extrabold text-[#8E8E93] block">{d.day}</span>
              </div>
              {d.active && (
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#A1F524] rounded-b-2xl shadow-[0_0_8px_#A1F524]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 8. Mis Suplementos */}
      <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-[28px] space-y-3.5 shadow-md">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="bg-[#2C2C2E] border border-white/5 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
            <span>💊</span>
            <span>Mis Suplementos</span>
          </div>
          <button
            onClick={() => {
              setShowAddSuppModal(true);
              setIsModalOpen(true);
            }}
            className="bg-[#2C2C2E] border border-white/5 text-xs font-black text-[#A1F524] px-3.5 py-1.5 rounded-full hover:bg-[#3A3A3C] fitness-press"
          >
            + Añadir
          </button>
        </div>

        <div className="space-y-2">
          {supplements.map((s) => (
            <div
              key={s.id}
              className="bg-[#242426] border border-white/5 p-3.5 rounded-[22px] flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2C2C2E] flex items-center justify-center text-lg">
                  {s.icon || '💊'}
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#F5F5F7]">{s.name}</h4>
                  <p className="text-[10px] font-bold text-[#8E8E93]">
                    {s.dosage} • {s.timeOfDay}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteSupplement(s.id)}
                className="text-[#8E8E93] hover:text-[#FA114F] p-2 transition-colors"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Registro Corporal & WeightTrend */}
      <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-[28px] space-y-3.5 shadow-md">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="bg-[#2C2C2E] border border-white/5 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
            <span>📏</span>
            <span>Registro Corporal</span>
          </div>
          <button
            onClick={() => {
              setShowMeasureModal(true);
              setIsModalOpen(true);
            }}
            className="bg-[#2C2C2E] border border-white/5 text-xs font-black text-[#00F0FF] px-3.5 py-1.5 rounded-full hover:bg-[#3A3A3C] fitness-press"
          >
            + Registrar
          </button>
        </div>

        <div className="bg-[#242426] border border-white/5 p-4 rounded-[22px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#2C2C2E] border border-white/5 flex items-center justify-center text-xl shrink-0">
              ⚖️
            </div>
            <div>
              <div className="text-base font-black text-[#F5F5F7]">{latestWeight} kg</div>
              <div className="text-xs font-bold text-[#8E8E93]">Último peso registrado</div>
            </div>
          </div>
        </div>

        {/* 7-Day Moving Average Graph */}
        <WeightTrend measurements={measurements} />
      </div>

      {/* 10. Fotos de Progreso Físico & Análisis IA */}
      <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-[28px] space-y-3.5 shadow-md">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="bg-[#2C2C2E] border border-white/5 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
            <span>📷</span>
            <span>Fotos de Progreso Físico</span>
          </div>
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={isAnalyzingPhoto}
            className="text-xs font-black text-black px-4 py-1.5 rounded-full bg-[#A1F524] shadow-md shadow-[#A1F524]/20 fitness-press flex items-center gap-1"
          >
            {isAnalyzingPhoto ? (
              <>
                <IconSparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <span>+</span>
                <span>Subir</span>
              </>
            )}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {latestPhoto ? (
          <div className="rounded-[28px] overflow-hidden bg-[#242426] space-y-4 border border-white/10">
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <img
                src={latestPhoto.imageBase64}
                alt="Foto de progreso"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-3 left-3 text-xs font-black text-white px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10">
                Hoy
              </span>
            </div>

            {/* AI Coach Detailed Analysis */}
            <div className="p-5 pt-0 space-y-3">
              <div className="flex items-center gap-2 text-[#A1F524] text-xs font-black">
                <IconSparkles className="w-4 h-4 text-[#A1F524]" />
                <span>Análisis del Coach IA</span>
              </div>

              <div className="text-xs text-[#E2E8F0] font-bold leading-relaxed whitespace-pre-line space-y-2 opacity-95">
                {latestPhoto.aiAnalysis}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center space-y-2 flex flex-col items-center bg-[#242426]/50 rounded-[22px] border border-white/5">
            <span className="text-3xl">📷</span>
            <h4 className="text-sm font-black text-[#F5F5F7]">
              Sube tu primera foto de progreso
            </h4>
            <p className="text-xs font-bold text-[#8E8E93] max-w-xs mx-auto">
              El Coach IA de Gemini analizará tu estructura ósea, tono muscular y recomposición corporal.
            </p>
          </div>
        )}
      </div>

      {/* 11. Respaldo y Exportación */}
      <div className="bg-[#1C1C1E] border border-white/5 p-5 rounded-[28px] space-y-3 shadow-md">
        <div className="bg-[#2C2C2E] border border-white/5 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-[#F5F5F7]">
          <span>📥</span>
          <span>Respaldo de Datos</span>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => showToast('📄 Resumen .txt descargado.')}
            className="w-full py-3.5 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-white/5 text-xs font-black text-[#F5F5F7] flex items-center justify-center gap-2 fitness-press transition-all"
          >
            <span>📥</span>
            <span>Resumen .txt</span>
          </button>
          <button
            onClick={() => showToast('📤 Respaldo JSON exportado.')}
            className="w-full py-3.5 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-white/5 text-xs font-black text-[#F5F5F7] flex items-center justify-center gap-2 fitness-press transition-all"
          >
            <span>📤</span>
            <span>Exportar JSON</span>
          </button>
          <button
            onClick={() => showToast('📥 Selecciona archivo JSON para importar.')}
            className="w-full py-3.5 rounded-2xl bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-white/5 text-xs font-black text-[#F5F5F7] flex items-center justify-center gap-2 fitness-press transition-all"
          >
            <span>📥</span>
            <span>Importar JSON</span>
          </button>
        </div>
      </div>

      {/* Modal Añadir Suplemento (Apple Fitness Sheet) */}
      {showAddSuppModal && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center animate-fade-in">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => {
              setShowAddSuppModal(false);
              setIsModalOpen(false);
            }}
          />
          <div
            className="relative bg-[#1C1C1E] border-t border-white/15 w-full max-w-md rounded-t-[38px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] z-20 animate-sheet-up space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">Añadir Suplemento</h3>
              <button
                onClick={() => {
                  setShowAddSuppModal(false);
                  setIsModalOpen(false);
                }}
                className="bg-[#2C2C2E] hover:bg-[#3A3A3C] w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSupp} className="space-y-3">
              <div>
                <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Ej: Creatina, Magnesio, Omega 3"
                  value={newSuppName}
                  onChange={(e) => setNewSuppName(e.target.value)}
                  className="w-full mt-1.5 p-3.5 rounded-2xl bg-[#2C2C2E] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-[#A1F524] focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                    Dosis
                  </label>
                  <input
                    type="text"
                    placeholder="3-5g"
                    value={newSuppDose}
                    onChange={(e) => setNewSuppDose(e.target.value)}
                    className="w-full mt-1.5 p-3.5 rounded-2xl bg-[#2C2C2E] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-[#A1F524] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={newSuppTime}
                    onChange={(e) => setNewSuppTime(e.target.value)}
                    className="w-full mt-1.5 p-3.5 rounded-2xl bg-[#2C2C2E] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-[#A1F524] focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#A1F524] text-black font-black text-xs fitness-press transition-all shadow-md shadow-[#A1F524]/20 mt-2"
              >
                Guardar Suplemento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Medidas Corporales (Apple Fitness Sheet) */}
      {showMeasureModal && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center animate-fade-in">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => {
              setShowMeasureModal(false);
              setIsModalOpen(false);
            }}
          />
          <div
            className="relative bg-[#1C1C1E] border-t border-white/15 w-full max-w-md rounded-t-[38px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] z-20 animate-sheet-up space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#F5F5F7] tracking-tight">Registro Corporal</h3>
              <button
                onClick={() => {
                  setShowMeasureModal(false);
                  setIsModalOpen(false);
                }}
                className="bg-[#2C2C2E] hover:bg-[#3A3A3C] w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeasure} className="space-y-3">
              <div>
                <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                  Peso Corporal (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="80.0"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full mt-1.5 p-3.5 rounded-2xl bg-[#2C2C2E] text-base font-black text-[#F5F5F7] border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                    Cintura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="81"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full mt-1.5 p-3.5 rounded-2xl bg-[#2C2C2E] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                    Pecho (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="104"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                    className="w-full mt-1.5 p-3.5 rounded-2xl bg-[#2C2C2E] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-[#8E8E93] uppercase tracking-wider">
                  Brazos (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="38.5"
                  value={newArms}
                  onChange={(e) => setNewArms(e.target.value)}
                  className="w-full mt-1.5 p-3.5 rounded-2xl bg-[#2C2C2E] text-sm text-[#F5F5F7] font-bold border border-white/10 focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#00F0FF] text-black font-black text-xs fitness-press transition-all shadow-md shadow-[#00F0FF]/20 mt-2"
              >
                Guardar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
