'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { BodyMeasurementEntry, ProgressPhotoItem, useRecompStore } from '@/stores/useRecompStore';
import { getTodayKey } from '@/lib/date';
import { calculateDailyNutrition } from '@/lib/nutritionEngine';
import { callGemini } from '@/lib/gemini';
import { AI_MAX_EDGE, AI_QUALITY, compressImage, createThumbnail, PREVIEW_MAX_EDGE, PREVIEW_QUALITY } from '@/lib/image';
import { deleteProgressPhoto as deleteStoredPhoto, saveProgressPhoto } from '@/lib/imageStorage';
import { WeightTrend } from './WeightTrend';
import { StoredPhoto } from './StoredPhoto';
import { IconCamera, IconPlus, IconSparkles, IconTrash } from '../common/Icons';

const DAY_LABELS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getWeekDays(todayKey: string) {
  const [year, month, day] = todayKey.split('-').map(Number);
  const today = new Date(year, month - 1, day, 12);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return { key: getDateKey(date), label: DAY_LABELS[date.getDay()], isToday: index === 6 };
  });
}

interface MeasurementSheetProps {
  onClose: () => void;
  onSave: (measurement: Omit<BodyMeasurementEntry, 'id'>) => void;
}

const MeasurementSheet: React.FC<MeasurementSheetProps> = ({ onClose, onSave }) => {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const weightKg = Number(weight);
    if (!Number.isFinite(weightKg) || weightKg <= 0) return;
    onSave({
      date: getTodayKey(),
      weightKg,
      bodyFatPercentage: bodyFat ? Number(bodyFat) : undefined,
      waistCm: waist ? Number(waist) : undefined,
      chestCm: chest ? Number(chest) : undefined,
      armsCm: arms ? Number(arms) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-3 animate-fade-in motion-reduce:animate-none">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Cerrar registro" />
      <section role="dialog" aria-modal="true" aria-labelledby="measurement-title" className="relative mb-4 w-full max-w-md rounded-[28px] bg-[#1C1C1E] border border-white/10 p-5 pb-[calc(env(safe-area-inset-bottom,20px)+20px)] space-y-4 animate-sheet-up motion-reduce:animate-none">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#8E8E93]">Registro corporal</p>
            <h2 id="measurement-title" className="text-lg font-black text-[#F5F5F7]">Nueva medición</h2>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full bg-[#2C2C2E] text-[#8E8E93]" aria-label="Cerrar">×</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-xs font-semibold text-[#8E8E93]">Peso (kg)
            <input type="number" min="1" max="500" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="76.4" required className="mt-1.5" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#8E8E93]">Grasa (%)
              <input type="number" min="1" max="80" step="0.1" value={bodyFat} onChange={(event) => setBodyFat(event.target.value)} placeholder="Opcional" className="mt-1.5" />
            </label>
            <label className="block text-xs font-semibold text-[#8E8E93]">Cintura (cm)
              <input type="number" min="1" max="300" step="0.5" value={waist} onChange={(event) => setWaist(event.target.value)} placeholder="Opcional" className="mt-1.5" />
            </label>
            <label className="block text-xs font-semibold text-[#8E8E93]">Pecho (cm)
              <input type="number" min="1" max="300" step="0.5" value={chest} onChange={(event) => setChest(event.target.value)} placeholder="Opcional" className="mt-1.5" />
            </label>
            <label className="block text-xs font-semibold text-[#8E8E93]">Brazos (cm)
              <input type="number" min="1" max="150" step="0.5" value={arms} onChange={(event) => setArms(event.target.value)} placeholder="Opcional" className="mt-1.5" />
            </label>
          </div>
          <button type="submit" className="w-full rounded-xl bg-[#A1F524] text-black py-3 font-bold text-sm fitness-press">Guardar medición</button>
        </form>
      </section>
    </div>
  );
};

export const BodyRecordSection: React.FC = () => {
  const { geminiApiKey, showToast } = useHubStore();
  const {
    measurements,
    addMeasurement,
    deleteMeasurement,
    meals,
    targetCalories,
    photos,
    addProgressPhoto,
    deleteProgressPhoto,
    setIsModalOpen,
  } = useRecompStore();
  const [isMeasureOpen, setIsMeasureOpen] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const todayKey = getTodayKey();
  const latestMeasurement = measurements[0];
  const latestPhoto = photos[0];

  const weeklyDays = useMemo(() => {
    const totals = new Map<string, number>();
    for (const meal of meals) totals.set(meal.date, (totals.get(meal.date) || 0) + meal.calories);
    return getWeekDays(todayKey).map((day) => ({ ...day, calories: Math.round(totals.get(day.key) || 0) }));
  }, [meals, todayKey]);
  const weeklyTotal = weeklyDays.reduce((sum, day) => sum + day.calories, 0);
  const maxCalories = Math.max(targetCalories, ...weeklyDays.map((day) => day.calories), 1);
  const nutritionToday = calculateDailyNutrition(meals, todayKey);

  const saveMeasurement = (measurement: Omit<BodyMeasurementEntry, 'id'>) => {
    addMeasurement(measurement);
    setIsMeasureOpen(false);
    setIsModalOpen(false);
    showToast(`Peso registrado: ${measurement.weightKg} kg`);
  };

  const closeMeasurementSheet = () => {
    setIsMeasureOpen(false);
    setIsModalOpen(false);
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsAnalyzingPhoto(true);
    try {
      const base64 = await compressImage(file);
      let analysis = 'Foto guardada. Añade una clave de Gemini en Perfil si quieres generar un análisis.';
      if (geminiApiKey) {
        try {
          // La IA no necesita la copia HD: con 896 px analiza igual y responde antes.
          const aiCopy = await createThumbnail(base64, AI_MAX_EDGE, AI_QUALITY);
          analysis = await callGemini(
            geminiApiKey,
            [
              { text: 'Analiza esta foto de progreso físico con un tono respetuoso. Resume composición corporal observable, postura y recomendaciones prácticas para nutrición y entrenamiento durante los próximos 7 días. No infieras datos médicos ni porcentajes exactos.' },
              { inlineData: { data: aiCopy.replace(/^data:[^;]+;base64,/, ''), mimeType: 'image/jpeg' } },
            ],
            undefined,
            { timeoutMs: 20000, generationConfig: { maxOutputTokens: 500, temperature: 0.4 } }
          );
        } catch (error) {
          console.error('Progress photo analysis failed:', error);
          analysis = 'Foto guardada. No se pudo generar el análisis; puedes intentarlo de nuevo más tarde.';
        }
      }
      const photoId = `photo-${Date.now()}`;
      await saveProgressPhoto(photoId, base64);
      const thumbnail = await createThumbnail(base64, PREVIEW_MAX_EDGE, PREVIEW_QUALITY);
      const photo: ProgressPhotoItem = { id: photoId, date: todayKey, type: 'front', imageBase64: thumbnail, aiAnalysis: analysis };
      addProgressPhoto(photo);
      showToast(geminiApiKey ? 'Foto de progreso guardada.' : 'Foto guardada. Configura Gemini para analizarla.');
    } catch (error) {
      console.error('Progress photo analysis failed:', error);
      showToast(error instanceof Error ? error.message : 'No se pudo analizar la foto.');
    } finally {
      setIsAnalyzingPhoto(false);
      event.target.value = '';
    }
  };

  const handleDeletePhoto = async (id: string) => {
    await deleteStoredPhoto(id);
    deleteProgressPhoto(id);
    showToast('Foto de progreso eliminada.');
  };

  return (
    <div className="space-y-4 pb-36 animate-fade-in motion-reduce:animate-none relative z-10">
      <header className="px-1 pt-1">
        <h1 className="text-2xl font-black tracking-tight text-[#F5F5F7]">Registro corporal</h1>
      </header>

      <section className="fitness-card p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#8E8E93]">Peso actual</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <strong className="text-3xl leading-none font-black tracking-tight text-[#F5F5F7]">{latestMeasurement?.weightKg ?? '—'}</strong>
              <span className="text-sm font-bold text-[#8E8E93]">kg</span>
            </div>
          <p className="mt-1 text-xs text-[#8E8E93]">{latestMeasurement ? `Último registro · ${latestMeasurement.date}` : 'Aún no hay mediciones'}</p>
          </div>
          <button type="button" onClick={() => { setIsMeasureOpen(true); setIsModalOpen(true); }} className="inline-flex items-center gap-1.5 rounded-full bg-[#2C2C2E] px-3 py-2 text-xs font-bold text-[#64D2FF] fitness-press">
            <IconPlus className="w-3.5 h-3.5" /> Registrar
          </button>
        </div>
        {latestMeasurement && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[#2C2C2E] p-2.5"><p className="text-[10px] text-[#8E8E93]">Grasa</p><p className="mt-1 text-sm font-bold text-[#F5F5F7]">{latestMeasurement.bodyFatPercentage ? `${latestMeasurement.bodyFatPercentage}%` : '—'}</p></div>
            <div className="rounded-xl bg-[#2C2C2E] p-2.5"><p className="text-[10px] text-[#8E8E93]">Cintura</p><p className="mt-1 text-sm font-bold text-[#F5F5F7]">{latestMeasurement.waistCm ? `${latestMeasurement.waistCm} cm` : '—'}</p></div>
            <div className="rounded-xl bg-[#2C2C2E] p-2.5"><p className="text-[10px] text-[#8E8E93]">Proteína hoy</p><p className="mt-1 text-sm font-bold text-[#64D2FF]">{Math.round(nutritionToday.consumedProtein)} g</p></div>
          </div>
        )}
        {latestMeasurement ? <WeightTrend measurements={measurements} /> : (
          <div className="rounded-2xl bg-[#2C2C2E] px-4 py-5 text-center text-xs text-[#8E8E93]">Registra tu peso para ver la tendencia.</div>
        )}
      </section>

      <section className="fitness-card p-4 space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-[#F5F5F7]">Consumo semanal</h2>
            <p className="mt-0.5 text-xs text-[#8E8E93]">{weeklyTotal.toLocaleString('es-CO')} kcal registradas</p>
          </div>
          <span className="text-[10px] font-bold text-[#8E8E93]">kcal / día</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 items-end" aria-label="Calorías registradas durante los últimos siete días">
          {weeklyDays.map((day) => {
            const height = day.calories ? Math.max(5, Math.round((day.calories / maxCalories) * 100)) : 2;
            return (
              <div key={day.key} className={`min-w-0 rounded-xl px-1.5 py-2 flex flex-col items-center gap-2 border ${day.isToday ? 'bg-[#2C2C2E] border-[#A1F524]/40' : 'bg-[#2C2C2E]/65 border-white/[0.05]'}`}>
                <span className="h-7 flex items-end text-[9px] font-bold text-[#F5F5F7] tabular-nums">{day.calories || '—'}</span>
                <div className="w-full h-[76px] flex items-end justify-center rounded-lg bg-black/10 overflow-hidden" aria-hidden="true">
                  <div className={`w-full rounded-md transition-[height] duration-500 ${day.isToday ? 'bg-[#A1F524]' : 'bg-[#64D2FF]/75'}`} style={{ height: `${height}%` }} />
                </div>
                <span className={`text-[10px] font-bold capitalize ${day.isToday ? 'text-[#A1F524]' : 'text-[#8E8E93]'}`}>{day.label}</span>
              </div>
            );
          })}
        </div>
        {weeklyTotal === 0 && <p className="text-center text-xs text-[#8E8E93]">Registra comidas para ver aquí tu semana.</p>}
      </section>

      <section className="fitness-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-[#F5F5F7]">Mediciones</h2>
            <p className="text-xs text-[#8E8E93]">Historial de peso y medidas</p>
          </div>
          <span className="text-xs font-bold text-[#8E8E93]">{measurements.length}</span>
        </div>
        {measurements.length ? (
          <div className="divide-y divide-white/[0.07]">
            {measurements.slice(0, 6).map((measurement) => (
              <div key={measurement.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
                <div className="w-9 h-9 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-sm" aria-hidden="true">⚖️</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#F5F5F7]">{measurement.weightKg} kg</p>
                  <p className="text-xs text-[#8E8E93] truncate">{measurement.date}{measurement.waistCm ? ` · Cintura ${measurement.waistCm} cm` : ''}{measurement.bodyFatPercentage ? ` · ${measurement.bodyFatPercentage}% grasa` : ''}</p>
                </div>
                <button type="button" aria-label={`Eliminar medición del ${measurement.date}`} onClick={() => deleteMeasurement(measurement.id)} className="p-2 text-[#8E8E93] hover:text-[#FF453A]"><IconTrash className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        ) : <p className="py-2 text-xs text-[#8E8E93]">Registra tu primera medición para empezar el seguimiento.</p>}
      </section>

      <section className="fitness-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-black text-[#F5F5F7]">Fotos de progreso</h2>
            <p className="text-xs text-[#8E8E93]">Comparte cambios a lo largo del tiempo</p>
          </div>
          <button type="button" onClick={() => photoInputRef.current?.click()} disabled={isAnalyzingPhoto} className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#A1F524] px-3 py-2 text-xs font-bold text-black disabled:opacity-60 fitness-press">
            {isAnalyzingPhoto ? <IconSparkles className="w-3.5 h-3.5 animate-spin" /> : <IconCamera className="w-3.5 h-3.5" />}
            {isAnalyzingPhoto ? 'Analizando' : 'Subir foto'}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
        </div>
        {latestPhoto ? (
          <div className="overflow-hidden rounded-2xl bg-[#2C2C2E]">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <StoredPhoto
                kind="progress"
                id={latestPhoto.id}
                fallback={latestPhoto.imageBase64}
                alt={`Foto de progreso del ${latestPhoto.date}`}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-xs font-bold text-white">{latestPhoto.date}</span>
              <button type="button" onClick={() => void handleDeletePhoto(latestPhoto.id)} className="absolute right-3 top-3 rounded-full bg-black/65 p-2 text-white" aria-label="Eliminar foto"><IconTrash className="w-4 h-4" /></button>
            </div>
            {latestPhoto.aiAnalysis && <p className="p-3.5 text-xs leading-relaxed text-[#D1D1D6] whitespace-pre-line">{latestPhoto.aiAnalysis}</p>}
          </div>
        ) : (
          <button type="button" onClick={() => photoInputRef.current?.click()} className="w-full rounded-2xl border border-dashed border-white/15 bg-[#2C2C2E]/50 px-5 py-8 text-center transition-colors hover:border-white/30">
            <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#2C2C2E] text-xl" aria-hidden="true">📷</span>
            <span className="block text-sm font-bold text-[#F5F5F7]">Añade tu primera foto</span>
            <span className="mt-1 block text-xs text-[#8E8E93]">Gemini puede generar un resumen de progreso.</span>
          </button>
        )}
        {photos.length > 1 && <p className="text-center text-[11px] text-[#8E8E93]">Mostrando la foto más reciente · {photos.length} registradas</p>}
      </section>

      {isMeasureOpen && <MeasurementSheet onClose={closeMeasurementSheet} onSave={saveMeasurement} />}
    </div>
  );
};
