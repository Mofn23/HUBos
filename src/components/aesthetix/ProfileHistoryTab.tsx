'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useHubStore } from '@/stores/useHubStore';
import { saveProgressPhoto, getProgressPhoto } from '@/lib/imageStorage';

export const ProfileHistoryTab: React.FC = () => {
  const { userName, showToast } = useHubStore();
  const {
    userWeightKg,
    setUserWeightKg,
    measurements,
    addMeasurement,
    userPhotoId,
    setUserPhotoId,
    history,
    prs,
  } = useAesthetixStore();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLogMeasureOpen, setIsLogMeasureOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(userWeightKg.toString());
  const [newChest, setNewChest] = useState('');
  const [newArms, setNewArms] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newThighs, setNewThighs] = useState('');
  const [newCalves, setNewCalves] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load avatar from IndexedDB if photoId exists
  useEffect(() => {
    if (userPhotoId) {
      getProgressPhoto(userPhotoId).then((img) => {
        if (img) setAvatarUrl(img);
      });
    }
  }, [userPhotoId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const photoId = `avatar_gym_${Date.now()}`;
      await saveProgressPhoto(photoId, base64);
      setUserPhotoId(photoId);
      setAvatarUrl(base64);
      showToast('📸 Foto de perfil de entrenamiento actualizada.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMeasurement = () => {
    const w = parseFloat(newWeight);
    if (!w || isNaN(w)) {
      showToast('Ingresa un peso válido.');
      return;
    }

    addMeasurement({
      date: new Date().toISOString().split('T')[0],
      weightKg: w,
      chestCm: parseFloat(newChest) || undefined,
      armsCm: parseFloat(newArms) || undefined,
      waistCm: parseFloat(newWaist) || undefined,
      thighsCm: parseFloat(newThighs) || undefined,
      calvesCm: parseFloat(newCalves) || undefined,
    });

    setUserWeightKg(w);
    showToast('⚖️ Registro antropométrico guardado.');
    setIsLogMeasureOpen(false);
  };

  const prList = Object.values(prs);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Profile Hero Avatar & Weight Card */}
      <div className="glass-surface rounded-[30px] p-5 border-t-white/20 shadow-xl space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar with click to upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#34C759] shadow-[0_0_20px_rgba(52,199,89,0.3)] cursor-pointer group bg-black/40 flex items-center justify-center shrink-0"
            title="Subir foto de perfil"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">👤</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black text-white transition-opacity">
              Cambiar
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="flex-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] text-[10px] font-black uppercase tracking-wider">
              Atleta Aesthetix
            </span>
            <h2 className="text-xl font-black text-[#F5F5F7] tracking-tight mt-0.5">
              {userName}
            </h2>
            <p className="text-xs font-bold text-[#8E8E93]">
              Peso Actual:{' '}
              <span className="text-[#F5F5F7] font-black font-mono">{userWeightKg} kg</span>
            </p>
          </div>

          <button
            onClick={() => setIsLogMeasureOpen(true)}
            className="glass-pill px-3 py-2 rounded-full text-xs font-black text-[#64D2FF] hover:text-white active:scale-95 transition-all shadow-sm"
          >
            + Medidas
          </button>
        </div>

        {/* Quick Body Metrics Row */}
        {measurements.length > 0 && (
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
            <div className="glass-pill p-2 rounded-[16px] text-center">
              <span className="text-[9px] font-bold text-[#8E8E93] block">Bíceps</span>
              <span className="text-xs font-black text-[#F5F5F7] font-mono">
                {measurements[0].armsCm ? `${measurements[0].armsCm}cm` : '--'}
              </span>
            </div>
            <div className="glass-pill p-2 rounded-[16px] text-center">
              <span className="text-[9px] font-bold text-[#8E8E93] block">Pecho</span>
              <span className="text-xs font-black text-[#F5F5F7] font-mono">
                {measurements[0].chestCm ? `${measurements[0].chestCm}cm` : '--'}
              </span>
            </div>
            <div className="glass-pill p-2 rounded-[16px] text-center">
              <span className="text-[9px] font-bold text-[#8E8E93] block">Cintura</span>
              <span className="text-xs font-black text-[#F5F5F7] font-mono">
                {measurements[0].waistCm ? `${measurements[0].waistCm}cm` : '--'}
              </span>
            </div>
            <div className="glass-pill p-2 rounded-[16px] text-center">
              <span className="text-[9px] font-bold text-[#8E8E93] block">Muslo</span>
              <span className="text-xs font-black text-[#F5F5F7] font-mono">
                {measurements[0].thighsCm ? `${measurements[0].thighsCm}cm` : '--'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Personal Records (PRs) Bento Section */}
      <div className="glass-surface-elevated rounded-[28px] p-5 border-t-white/10 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#F5F5F7]">
              Récords Personales (PRs)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#FFD60A]">
            {prList.length} marcas registradas
          </span>
        </div>

        {prList.length === 0 ? (
          <p className="text-xs text-[#8E8E93] py-2 text-center">
            Aún no has registrado récords. Inicia una sesión en el gimnasio para comenzar tu historial.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {prList.map((pr) => (
              <div
                key={pr.exerciseId}
                className="glass-pill p-3 rounded-[20px] space-y-1 border-t-white/15"
              >
                <span className="text-xs font-black text-[#F5F5F7] capitalize block truncate">
                  {pr.exerciseName}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-black text-[#FFD60A] font-mono">
                    {pr.maxWeightKg} kg
                  </span>
                  <span className="text-[10px] font-bold text-[#8E8E93]">x {pr.maxReps} reps</span>
                </div>
                <div className="text-[9px] font-bold text-[#34C759]">
                  1RM Est: {pr.estimated1RM} kg • {pr.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Complete Workout Sessions History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
            HISTORIAL DE SESIONES COMPLETADAS
          </h3>
          <span className="text-[10px] font-bold text-[#636366]">
            {history.length} entrenamientos
          </span>
        </div>

        {history.length === 0 ? (
          <div className="glass-surface rounded-[24px] p-6 text-center text-xs text-[#8E8E93] space-y-2">
            <span className="text-2xl">📋</span>
            <p>No tienes entrenamientos finalizados aún.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((session) => (
              <div
                key={session.id}
                className="glass-surface rounded-[24px] p-4 border-t-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-[#F5F5F7]">{session.routineName}</h4>
                    <p className="text-[10px] font-bold text-[#34C759]">{session.dayName}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-bold text-[#8E8E93]">
                    {session.date}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs pt-1 border-t border-white/5">
                  <span className="glass-pill px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-[#F5F5F7]">
                    ⏱️ {session.durationMinutes}m
                  </span>
                  <span className="glass-pill px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-[#34C759]">
                    ⚡ {session.totalVolumeKg} kg vol.
                  </span>
                  <span className="glass-pill px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-[#64D2FF]">
                    💪 {session.totalSets} series
                  </span>
                </div>

                {/* Exercises list in this completed workout */}
                <div className="space-y-1 text-[11px] text-[#8E8E93] pt-1">
                  {session.exercises.map((ex, exIdx) => {
                    const doneSets = ex.sets.filter((s) => s.completed);
                    if (doneSets.length === 0) return null;
                    return (
                      <div key={exIdx} className="flex items-center justify-between">
                        <span className="text-[#F5F5F7] capitalize font-medium">
                          {ex.exerciseName}
                        </span>
                        <span className="font-mono text-[10px]">
                          {doneSets.length} series ({doneSets.map((s) => `${s.weightKg}k`).join(', ')})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Measurement Modal */}
      {isLogMeasureOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsLogMeasureOpen(false)}
          />
          <div className="relative w-full max-w-sm glass-surface-elevated rounded-t-[32px] p-5 z-10 border-t border-white/20 space-y-3 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-black text-[#F5F5F7]">Registrar Peso & Medidas</h3>
              <button
                onClick={() => setIsLogMeasureOpen(false)}
                className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">
                  Peso Corporal (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full glass-surface rounded-[14px] px-3 py-2 text-xs font-black text-[#F5F5F7] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">Bíceps (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newArms}
                    onChange={(e) => setNewArms(e.target.value)}
                    placeholder="Ej. 38"
                    className="w-full glass-surface rounded-[14px] px-3 py-2 text-xs font-black text-[#F5F5F7] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">Pecho (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                    placeholder="Ej. 102"
                    className="w-full glass-surface rounded-[14px] px-3 py-2 text-xs font-black text-[#F5F5F7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    placeholder="Ej. 78"
                    className="w-full glass-surface rounded-[14px] px-3 py-2 text-xs font-black text-[#F5F5F7] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">Muslo (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newThighs}
                    onChange={(e) => setNewThighs(e.target.value)}
                    placeholder="Ej. 60"
                    className="w-full glass-surface rounded-[14px] px-3 py-2 text-xs font-black text-[#F5F5F7] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">Gemelo (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newCalves}
                    onChange={(e) => setNewCalves(e.target.value)}
                    placeholder="Ej. 39"
                    className="w-full glass-surface rounded-[14px] px-3 py-2 text-xs font-black text-[#F5F5F7] outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveMeasurement}
              className="w-full py-3 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md active:scale-95 transition-all mt-2"
            >
              Guardar Medidas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
