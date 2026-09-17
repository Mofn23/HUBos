'use client';

import React, { useState, useMemo } from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useHubStore } from '@/stores/useHubStore';
import { WorkoutRoutine, RoutineDay, RoutineExercise, Exercise } from '@/types/workout';
import { getAllExercises, searchExercises, BODY_PART_TRANSLATIONS } from '@/lib/exercisesDb';

interface CustomRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomRoutineModal: React.FC<CustomRoutineModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addRoutine, setActiveRoutineId } = useAesthetixStore();
  const { showToast } = useHubStore();

  const [routineName, setRoutineName] = useState('Mi Rutina PPL x UL');
  const [description, setDescription] = useState('Distribución híbrida Push-Pull-Legs + Upper-Lower para máxima hipertrofia.');
  const [targetDays, setTargetDays] = useState(5);

  // Days state
  const [days, setDays] = useState<RoutineDay[]>([
    {
      id: 'day_ppl_push',
      dayName: 'Día 1 - Push (Empuje)',
      focus: 'Pectorales, Hombros y Tríceps',
      exercises: [
        { id: 'e1', exerciseId: '0025', name: 'Barbell Bench Press', targetSets: 4, targetReps: '8-10', restSeconds: 150 },
        { id: 'e2', exerciseId: '0314', name: 'Dumbbell Incline Bench Press', targetSets: 3, targetReps: '10-12', restSeconds: 150 },
        { id: 'e3', exerciseId: '0334', name: 'Dumbbell Lateral Raise', targetSets: 4, targetReps: '12-15', restSeconds: 120 },
        { id: 'e4', exerciseId: '0223', name: 'Cable Triceps Pushdown', targetSets: 3, targetReps: '10-12', restSeconds: 120 },
      ],
    },
    {
      id: 'day_ppl_pull',
      dayName: 'Día 2 - Pull (Tracción)',
      focus: 'Espalda, Bíceps y Deltoides Posterior',
      exercises: [
        { id: 'e5', exerciseId: '0027', name: 'Barbell Bent Over Row', targetSets: 4, targetReps: '8-10', restSeconds: 150 },
        { id: 'e6', exerciseId: '0150', name: 'Lat Pulldown Cable', targetSets: 3, targetReps: '10-12', restSeconds: 150 },
        { id: 'e7', exerciseId: '0310', name: 'Dumbbell Bicep Curl', targetSets: 3, targetReps: '10-12', restSeconds: 120 },
        { id: 'e8', exerciseId: '0220', name: 'Face Pull Cable', targetSets: 3, targetReps: '12-15', restSeconds: 120 },
      ],
    },
    {
      id: 'day_ppl_legs',
      dayName: 'Día 3 - Legs (Pierna)',
      focus: 'Cuádriceps, Isquiosurales y Pantorrillas',
      exercises: [
        { id: 'e9', exerciseId: '0032', name: 'Barbell Squat', targetSets: 4, targetReps: '6-8', restSeconds: 180 },
        { id: 'e10', exerciseId: '0178', name: 'Leg Press', targetSets: 3, targetReps: '10-12', restSeconds: 150 },
        { id: 'e11', exerciseId: '0182', name: 'Leg Curl', targetSets: 3, targetReps: '10-12', restSeconds: 120 },
        { id: 'e12', exerciseId: '0179', name: 'Standing Calf Raise', targetSets: 4, targetReps: '12-15', restSeconds: 90 },
      ],
    },
    {
      id: 'day_ppl_upper',
      dayName: 'Día 4 - Upper (Torso Completo)',
      focus: 'Pecho, Espalda y Brazos',
      exercises: [
        { id: 'e13', exerciseId: '0336', name: 'Dumbbell Overhead Shoulder Press', targetSets: 4, targetReps: '8-10', restSeconds: 150 },
        { id: 'e14', exerciseId: '0198', name: 'Seated Cable Row', targetSets: 3, targetReps: '10-12', restSeconds: 150 },
        { id: 'e15', exerciseId: '0047', name: 'Dips Chest', targetSets: 3, targetReps: '10-12', restSeconds: 120 },
        { id: 'e16', exerciseId: '0318', name: 'Incline Dumbbell Curl', targetSets: 3, targetReps: '10-12', restSeconds: 120 },
      ],
    },
    {
      id: 'day_ppl_lower',
      dayName: 'Día 5 - Lower (Pierna & Core)',
      focus: 'Fuerza de Pierna, Isquios y Abdomen',
      exercises: [
        { id: 'e17', exerciseId: '0038', name: 'Romanian Deadlift Barbell', targetSets: 4, targetReps: '8-10', restSeconds: 180 },
        { id: 'e18', exerciseId: '0183', name: 'Leg Extension', targetSets: 3, targetReps: '12-15', restSeconds: 120 },
        { id: 'e19', exerciseId: '0184', name: 'Seated Leg Curl', targetSets: 3, targetReps: '10-12', restSeconds: 120 },
        { id: 'e20', exerciseId: '0001', name: 'Hanging Leg Raise', targetSets: 3, targetReps: '12-15', restSeconds: 90 },
      ],
    },
  ]);

  const [activeDayIdx, setActiveDayIdx] = useState(0);

  // Exercise Picker Sub-modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerBodyPart, setPickerBodyPart] = useState('all');

  const allDbExercises = useMemo(() => getAllExercises(), []);

  const filteredPickerExercises = useMemo(() => {
    return searchExercises(pickerSearch, {
      bodyPart: pickerBodyPart,
    }).slice(0, 40);
  }, [pickerSearch, pickerBodyPart]);

  if (!isOpen) return null;

  // Template loader helper
  const loadPplxUlTemplate = () => {
    setRoutineName('Mi Protocolo PPL x UL');
    setDescription('5 Días: Push, Pull, Legs, Upper, Lower optimizado para hipertrofia y fuerza.');
    setTargetDays(5);
    setActiveDayIdx(0);
    showToast('Plantilla PPL x UL cargada.');
  };

  const loadPushPullLegs3Template = () => {
    setRoutineName('Rutina Push Pull Legs (3 Días)');
    setDescription('Distribución clásica de 3 días para entrenar todo el cuerpo con máxima recuperación.');
    setTargetDays(3);
    setDays(days.slice(0, 3));
    setActiveDayIdx(0);
    showToast('Plantilla PPL 3 días cargada.');
  };

  const loadBlankTemplate = () => {
    setRoutineName('Nueva Rutina Personalizada');
    setDescription('Plan diseñado a medida.');
    setTargetDays(4);
    setDays([
      {
        id: `day_${Date.now()}_1`,
        dayName: 'Día 1 - Sesión A',
        focus: 'Músculos principales',
        exercises: [],
      },
    ]);
    setActiveDayIdx(0);
    showToast('Plantilla en blanco lista.');
  };

  // Day actions
  const handleAddDay = () => {
    const newIdx = days.length + 1;
    const newDay: RoutineDay = {
      id: `day_${Date.now()}_${newIdx}`,
      dayName: `Día ${newIdx} - Sesión`,
      focus: 'Foco muscular',
      exercises: [],
    };
    setDays([...days, newDay]);
    setActiveDayIdx(days.length);
    setTargetDays(days.length + 1);
  };

  const handleRemoveDay = (index: number) => {
    if (days.length <= 1) {
      showToast('La rutina debe tener al menos 1 día.');
      return;
    }
    const updated = days.filter((_, i) => i !== index);
    setDays(updated);
    setActiveDayIdx(Math.max(0, index - 1));
    setTargetDays(updated.length);
  };

  const handleUpdateDay = (index: number, updates: Partial<RoutineDay>) => {
    const updated = [...days];
    updated[index] = { ...updated[index], ...updates };
    setDays(updated);
  };

  // Exercise inside Day actions
  const handleAddExerciseToCurrentDay = (dbEx: Exercise) => {
    const current = days[activeDayIdx];
    if (!current) return;

    const newEx: RoutineExercise = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      exerciseId: dbEx.id,
      name: dbEx.name,
      targetSets: 3,
      targetReps: '10-12',
      restSeconds: 150,
      notes: `${dbEx.target} • ${dbEx.equipment}`,
    };

    const updatedExercises = [...current.exercises, newEx];
    handleUpdateDay(activeDayIdx, { exercises: updatedExercises });
    showToast(`Añadido: ${dbEx.name}`);
    setIsPickerOpen(false);
  };

  const handleRemoveExerciseFromDay = (dayIndex: number, exIndex: number) => {
    const current = days[dayIndex];
    if (!current) return;
    const updated = current.exercises.filter((_, i) => i !== exIndex);
    handleUpdateDay(dayIndex, { exercises: updated });
  };

  const handleUpdateExerciseInDay = (
    dayIndex: number,
    exIndex: number,
    field: 'targetSets' | 'targetReps' | 'restSeconds',
    value: any
  ) => {
    const current = days[dayIndex];
    if (!current) return;
    const updatedExercises = [...current.exercises];
    updatedExercises[exIndex] = {
      ...updatedExercises[exIndex],
      [field]: value,
    };
    handleUpdateDay(dayIndex, { exercises: updatedExercises });
  };

  // Save full routine
  const handleSaveRoutine = () => {
    if (!routineName.trim()) {
      showToast('Por favor escribe un nombre para la rutina.');
      return;
    }

    const totalExercises = days.reduce((acc, d) => acc + d.exercises.length, 0);
    if (totalExercises === 0) {
      showToast('Añade al menos un ejercicio a alguno de los días.');
      return;
    }

    const newRoutine: WorkoutRoutine = {
      id: `routine_custom_${Date.now()}`,
      name: routineName.trim(),
      description: description.trim() || 'Rutina personalizada por el atleta.',
      splitType: 'custom',
      targetDaysPerWeek: days.length,
      createdAt: new Date().toISOString(),
      days,
    };

    addRoutine(newRoutine);
    setActiveRoutineId(newRoutine.id);
    showToast(`✅ Rutina "${newRoutine.name}" guardada y activada.`);
    onClose();
  };

  const currentDay = days[activeDayIdx] || days[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-lg glass-surface-elevated rounded-[36px] p-5 z-10 border border-white/20 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden text-[#F5F5F7]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[18px] bg-[#34C759]/15 border border-[#34C759]/30 flex items-center justify-center text-xl">
              🛠️
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-[#F5F5F7]">
                Diseñar Rutina Personalizada
              </h2>
              <p className="text-[11px] font-bold text-[#8E8E93]">
                Crea tu distribución por días (ej. PPL x UL)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
          {/* Quick Presets Carousel */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-1">
              PLANTILLAS RÁPIDAS
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={loadPplxUlTemplate}
                className="glass-pill px-3 py-1.5 rounded-full text-xs font-black text-[#34C759] hover:bg-[#34C759]/15 shrink-0 border border-[#34C759]/30 transition-all"
              >
                ⚡ PPL x UL (5 Días)
              </button>
              <button
                type="button"
                onClick={loadPushPullLegs3Template}
                className="glass-pill px-3 py-1.5 rounded-full text-xs font-black text-[#64D2FF] hover:bg-[#64D2FF]/15 shrink-0 border border-[#64D2FF]/30 transition-all"
              >
                🔄 Push Pull Legs (3 Días)
              </button>
              <button
                type="button"
                onClick={loadBlankTemplate}
                className="glass-pill px-3 py-1.5 rounded-full text-xs font-bold text-[#8E8E93] hover:text-white shrink-0 transition-all"
              >
                ✨ Desde Cero
              </button>
            </div>
          </div>

          {/* Routine Name & Description */}
          <div className="space-y-2.5 glass-surface rounded-[24px] p-4 border border-white/10">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] block mb-1">
                NOMBRE DE TU RUTINA *
              </label>
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="Ej. Mi Rutina PPL x UL"
                className="w-full glass-surface rounded-[16px] px-3 py-2 text-xs font-black text-[#F5F5F7] outline-none border border-white/10 focus:border-[#34C759]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">
                Descripción u objetivo
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Foco en pecho superior y espalda con sobrecarga progresiva"
                className="w-full glass-surface rounded-[16px] px-3 py-2 text-xs text-[#8E8E93] font-bold outline-none border border-white/10"
              />
            </div>
          </div>

          {/* Days Tabs Strip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">
                DÍAS DE LA RUTINA ({days.length})
              </span>
              <button
                type="button"
                onClick={handleAddDay}
                className="text-[11px] font-black text-[#34C759] hover:underline flex items-center gap-1"
              >
                <span>+ Añadir Día</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {days.map((d, idx) => (
                <button
                  key={d.id || idx}
                  type="button"
                  onClick={() => setActiveDayIdx(idx)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeDayIdx === idx
                      ? 'bg-[#34C759] text-black shadow-md'
                      : 'glass-pill text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <span>{d.dayName.split('-')[0] || `Día ${idx + 1}`}</span>
                  <span className="opacity-60 text-[10px]">({d.exercises.length})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Day Detail Box */}
          {currentDay && (
            <div className="glass-surface-elevated rounded-[26px] p-4 border border-white/10 space-y-3">
              {/* Day Name & Focus Inputs */}
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={currentDay.dayName}
                    onChange={(e) =>
                      handleUpdateDay(activeDayIdx, { dayName: e.target.value })
                    }
                    placeholder="Nombre del día (ej. Día 1 - Push)"
                    className="w-full bg-transparent font-black text-sm text-[#F5F5F7] outline-none border-b border-white/10 focus:border-[#34C759] pb-0.5"
                  />
                  <input
                    type="text"
                    value={currentDay.focus}
                    onChange={(e) =>
                      handleUpdateDay(activeDayIdx, { focus: e.target.value })
                    }
                    placeholder="Foco muscular (ej. Pecho, Hombro, Tríceps)"
                    className="w-full bg-transparent font-bold text-xs text-[#34C759] outline-none"
                  />
                </div>

                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(activeDayIdx)}
                    className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-xs text-[#FF453A] hover:bg-[#FF453A]/20"
                    title="Eliminar este día"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Exercises in This Day */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#8E8E93] px-1">
                  <span>Ejercicios ({currentDay.exercises.length})</span>
                  <span>Series x Reps</span>
                </div>

                {currentDay.exercises.length === 0 ? (
                  <div className="p-4 rounded-[20px] bg-white/[0.02] border border-dashed border-white/10 text-center space-y-2">
                    <p className="text-xs text-[#8E8E93]">No hay ejercicios en este día aún</p>
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(true)}
                      className="px-4 py-1.5 rounded-full bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/40 text-xs font-black hover:scale-105 transition-all"
                    >
                      + Añadir Primer Ejercicio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
                    {currentDay.exercises.map((ex, exIdx) => (
                      <div
                        key={ex.id || exIdx}
                        className="glass-pill p-2.5 rounded-[18px] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-white/[0.08] text-[10px] font-black flex items-center justify-center text-[#8E8E93] shrink-0">
                            {exIdx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-[#F5F5F7] truncate capitalize">
                              {ex.name}
                            </p>
                            <p className="text-[10px] font-bold text-[#8E8E93]">
                              Descanso: {ex.restSeconds || 150}s
                            </p>
                          </div>
                        </div>

                        {/* Sets & Reps Inputs */}
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={ex.targetSets}
                            onChange={(e) =>
                              handleUpdateExerciseInDay(
                                activeDayIdx,
                                exIdx,
                                'targetSets',
                                parseInt(e.target.value) || 3
                              )
                            }
                            className="w-10 text-center glass-surface rounded-lg py-1 text-xs font-mono font-black text-[#64D2FF] outline-none"
                            title="Series objetivo"
                          />
                          <span className="text-xs text-[#8E8E93] font-bold">x</span>
                          <input
                            type="text"
                            value={ex.targetReps}
                            onChange={(e) =>
                              handleUpdateExerciseInDay(
                                activeDayIdx,
                                exIdx,
                                'targetReps',
                                e.target.value
                              )
                            }
                            className="w-14 text-center glass-surface rounded-lg py-1 text-xs font-mono font-black text-[#F5F5F7] outline-none"
                            title="Repeticiones objetivo"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveExerciseFromDay(activeDayIdx, exIdx)}
                            className="w-6 h-6 rounded-full glass-pill flex items-center justify-center text-[10px] text-[#FF453A] hover:bg-[#FF453A]/20 ml-1"
                            title="Quitar ejercicio"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Exercise Button */}
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="w-full py-2.5 rounded-full border border-dashed border-[#34C759]/40 text-[#34C759] hover:bg-[#34C759]/10 text-xs font-black transition-all flex items-center justify-center gap-1.5"
                >
                  <span>+ Añadir Ejercicio desde Catálogo (1.324)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full glass-pill text-xs font-black text-[#8E8E93] hover:text-white transition-all"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveRoutine}
            className="flex-[2] py-3.5 rounded-full bg-gradient-to-r from-[#34C759] to-[#2ECC71] text-black font-black text-xs shadow-[0_0_25px_rgba(52,199,89,0.35)] hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <span>✓</span>
            <span>Guardar Rutina Personalizada</span>
          </button>
        </div>
      </div>

      {/* Sub-modal: Quick Exercise Picker from Catalog */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center animate-fade-in p-2">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsPickerOpen(false)}
          />

          <div className="relative w-full max-w-md glass-surface-elevated rounded-[32px] p-5 z-20 border border-white/20 shadow-2xl space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-black text-[#F5F5F7]">
                Seleccionar Ejercicio para {currentDay.dayName}
              </h3>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="shrink-0 space-y-2">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Buscar ejercicio por nombre o músculo..."
                className="w-full glass-surface rounded-[16px] px-3 py-2 text-xs font-bold text-[#F5F5F7] outline-none border border-white/10 focus:border-[#34C759]"
                autoFocus
              />

              {/* Quick body parts pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => setPickerBodyPart('all')}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black ${
                    pickerBodyPart === 'all'
                      ? 'bg-[#34C759] text-black'
                      : 'glass-pill text-[#8E8E93]'
                  }`}
                >
                  Todos
                </button>
                {['chest', 'back', 'upper legs', 'shoulders', 'upper arms', 'waist'].map(
                  (bp) => (
                    <button
                      key={bp}
                      type="button"
                      onClick={() => setPickerBodyPart(bp)}
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black ${
                        pickerBodyPart === bp
                          ? 'bg-[#34C759] text-black'
                          : 'glass-pill text-[#8E8E93]'
                      }`}
                    >
                      {BODY_PART_TRANSLATIONS[bp] || bp}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
              {filteredPickerExercises.map((dbEx) => (
                <div
                  key={dbEx.id}
                  onClick={() => handleAddExerciseToCurrentDay(dbEx)}
                  className="glass-pill p-2.5 rounded-[16px] flex items-center justify-between hover:border-[#34C759]/40 cursor-pointer active:scale-98 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#F5F5F7] capitalize truncate">
                      {dbEx.name}
                    </p>
                    <p className="text-[10px] font-bold text-[#8E8E93]">
                      {BODY_PART_TRANSLATIONS[dbEx.body_part] || dbEx.body_part} •{' '}
                      <span className="text-[#34C759] capitalize">{dbEx.target}</span>
                    </p>
                  </div>

                  <span className="w-6 h-6 rounded-full bg-[#34C759]/20 text-[#34C759] text-xs font-black flex items-center justify-center shrink-0 ml-2">
                    +
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
