'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { generateRoutineWithAI } from '@/lib/workoutAiGenerator';
import { WorkoutRoutine } from '@/types/workout';

interface AiRoutineBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiRoutineBuilderModal: React.FC<AiRoutineBuilderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { geminiApiKey, showToast } = useHubStore();
  const { addRoutine, setWorkoutDaysTarget } = useAesthetixStore();

  const [step, setStep] = useState<number>(1);
  const [goal, setGoal] = useState<string>('Hipertrofia & Masa Muscular');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [level, setLevel] = useState<string>('Intermedio (1-3 años)');
  const [focus, setFocus] = useState<string>('Pecho, Hombros 3D y Espalda en V');
  const [equipment, setEquipment] = useState<string>('Gimnasio comercial completo');
  const [duration, setDuration] = useState<number>(75);

  const [loading, setLoading] = useState<boolean>(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<WorkoutRoutine | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const routine = await generateRoutineWithAI(geminiApiKey, {
        goal,
        daysPerWeek,
        level,
        focus,
        equipment,
        sessionDuration: duration,
      });

      setGeneratedRoutine(routine);
      setStep(6); // preview step
    } catch (err: any) {
      showToast(err.message || 'Error al generar la rutina con Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndActivate = () => {
    if (generatedRoutine) {
      addRoutine(generatedRoutine);
      setWorkoutDaysTarget(generatedRoutine.targetDaysPerWeek);
      showToast(`¡Rutina "${generatedRoutine.name}" activada!`);
      onClose();
      // Reset
      setStep(1);
      setGeneratedRoutine(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg glass-surface-elevated rounded-t-[36px] max-h-[90vh] flex flex-col overflow-hidden z-10 border-t border-white/20 shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <span className="text-xs font-black text-[#64D2FF] uppercase tracking-wider">
              Aesthetix AI Coach
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-[#8E8E93] hover:text-white active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-lg font-black text-[#F5F5F7]">¿Cuál es tu objetivo primordial?</h3>
              <p className="text-xs text-[#8E8E93]">
                Gemini estructurará la curva de volumen, intensidad y selección de ejercicios.
              </p>

              <div className="space-y-2 pt-2">
                {[
                  { title: 'Hipertrofia & Masa Muscular', icon: '🛡️', desc: 'Máximo crecimiento, estímulo y bombeo' },
                  { title: 'Fuerza Pura & Sobrecarga Progresiva', icon: '⚡', desc: 'Levantar más peso en movimientos básicos' },
                  { title: 'Estética & Proporciones Clásicas', icon: '🏛️', desc: 'Cintura estrecha, hombros 3D y simetría' },
                  { title: 'Definición & Pérdida de Grasa', icon: '🔥', desc: 'Retención de masa magra y densidad' },
                ].map((item) => (
                  <div
                    key={item.title}
                    onClick={() => setGoal(item.title)}
                    className={`p-3.5 rounded-[22px] cursor-pointer transition-all ${
                      goal === item.title
                        ? 'glass-pill-active border-[#64D2FF]/40 bg-[#64D2FF]/10 shadow-[0_0_20px_rgba(100,210,255,0.2)]'
                        : 'glass-surface hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="text-xs font-black text-[#F5F5F7]">{item.title}</p>
                          <p className="text-[11px] font-bold text-[#8E8E93]">{item.desc}</p>
                        </div>
                      </div>
                      {goal === item.title && <span className="text-[#64D2FF] font-black text-sm">✓</span>}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 mt-4 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md active:scale-95 transition-all"
              >
                Siguiente: Frecuencia Semanal →
              </button>
            </div>
          )}

          {/* Step 2: Days per week */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-lg font-black text-[#F5F5F7]">¿Cuántos días entrenarás a la semana?</h3>
              <p className="text-xs text-[#8E8E93]">
                Se calcularán tus descansos programados para proteger tu racha.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { days: 3, label: '3 Días', sub: 'Full Body integral', rest: '4 descansos' },
                  { days: 4, label: '4 Días', sub: 'Torso / Pierna clásico', rest: '3 descansos' },
                  { days: 5, label: '5 Días (Recomendado)', sub: 'Push / Pull / Legs + Torso', rest: '2 descansos' },
                  { days: 6, label: '6 Días', sub: 'Push / Pull / Legs x2', rest: '1 descanso' },
                ].map((item) => (
                  <div
                    key={item.days}
                    onClick={() => setDaysPerWeek(item.days)}
                    className={`p-4 rounded-[22px] cursor-pointer transition-all space-y-1 ${
                      daysPerWeek === item.days
                        ? 'glass-pill-active border-[#34C759]/40 bg-[#34C759]/10 shadow-[0_0_20px_rgba(52,199,89,0.2)]'
                        : 'glass-surface hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#F5F5F7]">{item.label}</span>
                      {daysPerWeek === item.days && <span className="text-[#34C759] font-black">✓</span>}
                    </div>
                    <p className="text-[11px] font-bold text-[#8E8E93]">{item.sub}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-[#34C759] font-black">
                      {item.rest}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-full glass-pill text-xs font-black text-[#8E8E93]"
                >
                  ← Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md active:scale-95 transition-all"
                >
                  Siguiente: Nivel & Enfoque →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Level & Focus */}
          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-lg font-black text-[#F5F5F7]">Nivel y Zonas de Prioridad</h3>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93] block mb-1">
                  Tu nivel de entrenamiento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Principiante', 'Intermedio', 'Avanzado'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`py-2 rounded-full text-xs font-black transition-all ${
                        level.startsWith(l)
                          ? 'bg-[#34C759] text-black shadow-md'
                          : 'glass-pill text-[#8E8E93] hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93] block mb-1">
                  Músculos a enfatizar
                </label>
                <input
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Ej: Pecho superior, Hombros 3D y Brazos"
                  className="w-full glass-surface rounded-[18px] px-4 py-3 text-xs text-[#F5F5F7] font-bold placeholder-[#636366] border border-white/10 outline-none focus:border-[#64D2FF]"
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-full glass-pill text-xs font-black text-[#8E8E93]"
                >
                  ← Atrás
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 rounded-full bg-[#34C759] text-black font-black text-xs shadow-md active:scale-95 transition-all"
                >
                  Siguiente: Equipamiento →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Equipment & Duration */}
          {step === 4 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-lg font-black text-[#F5F5F7]">Equipamiento y Tiempo</h3>

              <div className="space-y-2">
                {[
                  'Gimnasio comercial completo',
                  'Mancuernas y barra en casa',
                  'Calistenia y barras de dominadas',
                ].map((eq) => (
                  <div
                    key={eq}
                    onClick={() => setEquipment(eq)}
                    className={`p-3 rounded-[18px] cursor-pointer text-xs font-black flex items-center justify-between ${
                      equipment === eq
                        ? 'glass-pill-active border-[#34C759]/40 text-[#34C759]'
                        : 'glass-surface text-[#8E8E93]'
                    }`}
                  >
                    <span>{eq}</span>
                    {equipment === eq && <span>✓</span>}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93] block mb-1">
                  Tiempo aproximado por sesión: {duration} minutos
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[45, 60, 75, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-2 rounded-full text-xs font-black transition-all ${
                        duration === d
                          ? 'bg-[#64D2FF] text-black shadow-md'
                          : 'glass-pill text-[#8E8E93]'
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-3 rounded-full glass-pill text-xs font-black text-[#8E8E93]"
                >
                  ← Atrás
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#64D2FF] to-[#34C759] text-black font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Diseñando rutina con Gemini IA...</span>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Generar Rutina con IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Routine Preview */}
          {step === 6 && generatedRoutine && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass-surface p-4 rounded-[26px] border-t-white/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#34C759]/15 text-[#34C759] text-xs font-black border border-[#34C759]/25">
                    {generatedRoutine.targetDaysPerWeek} Días / Semana
                  </span>
                  <span className="text-xs font-bold text-[#8E8E93] uppercase">Gemini 2.0 Flash</span>
                </div>
                <h3 className="text-lg font-black text-[#F5F5F7]">{generatedRoutine.name}</h3>
                <p className="text-xs font-semibold text-[#8E8E93] leading-relaxed">
                  {generatedRoutine.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
                  Estructura de la Rutina
                </h4>
                {generatedRoutine.days.map((day, dIdx) => (
                  <div key={dIdx} className="glass-pill p-3.5 rounded-[22px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#F5F5F7]">{day.dayName}</span>
                      <span className="text-[10px] font-bold text-[#34C759]">{day.focus}</span>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      {day.exercises.map((ex, eIdx) => (
                        <div
                          key={eIdx}
                          className="flex items-center justify-between text-xs text-[#8E8E93]"
                        >
                          <span className="text-[#F5F5F7] font-semibold">{ex.name}</span>
                          <span className="font-mono text-[11px] font-black text-[#64D2FF]">
                            {ex.targetSets} x {ex.targetReps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveAndActivate}
                className="w-full py-3.5 rounded-full bg-[#34C759] text-black font-black text-xs shadow-[0_0_24px_rgba(52,199,89,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>🚀</span>
                <span>Guardar y Activar Rutina en Aesthetix</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
