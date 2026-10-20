'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAesthetixStore } from '@/stores/useAesthetixStore';
import { useHubStore } from '@/stores/useHubStore';
import { WorkoutRoutine, RoutineDay, RoutineExercise, Exercise } from '@/types/workout';
import { getExerciseById, searchExercises, getExerciseMediaUrls, BODY_PART_TRANSLATIONS } from '@/lib/exercisesDb';
import { useScrollLock } from '@/lib/useScrollLock';

interface CustomRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineToEdit?: WorkoutRoutine;
  onRoutineUpdated?: (dayIndex: number) => void;
}

export const CustomRoutineModal: React.FC<CustomRoutineModalProps> = ({
  isOpen,
  onClose,
  routineToEdit,
  onRoutineUpdated,
}) => {
  const { addRoutine, updateRoutine, setActiveRoutineId } = useAesthetixStore();
  const { showToast } = useHubStore();

  // Lock background scroll in iOS WebKit
  useScrollLock(isOpen);

  // Modal navigation view: 'editor' or 'catalog'
  const [currentView, setCurrentView] = useState<'editor' | 'catalog'>('editor');

  const [routineName, setRoutineName] = useState('Mi Rutina Personalizada');
  const [description, setDescription] = useState('Protocolo personalizado diseñado a medida.');
  const [targetDays, setTargetDays] = useState(5);

  // Days state initialized with 5 days
  const [days, setDays] = useState<RoutineDay[]>([
    {
      id: 'day_custom_1',
      dayName: 'Lunes - PUSH',
      focus: 'Pecho, Hombro y Tríceps',
      exercises: [
        { id: 'e1', exerciseId: '0025', name: 'Barbell bench press', targetSets: 3, targetReps: '8', restSeconds: 150 },
        { id: 'e2', exerciseId: '0405', name: 'Dumbbell seated shoulder press', targetSets: 3, targetReps: '8', restSeconds: 150 },
        { id: 'e3', exerciseId: '0334', name: 'Dumbbell lateral raise', targetSets: 4, targetReps: '8', restSeconds: 90 },
      ],
    },
    {
      id: 'day_custom_2',
      dayName: 'Martes - PULL',
      focus: 'Espalda y Bíceps',
      exercises: [
        { id: 'e4', exerciseId: '2330', name: 'Cable lat pulldown full range of motion', targetSets: 3, targetReps: '8', restSeconds: 150 },
        { id: 'e5', exerciseId: '0606', name: 'Lever t bar row', targetSets: 3, targetReps: '8', restSeconds: 150 },
        { id: 'e6', exerciseId: '0592', name: 'Lever preacher curl', targetSets: 3, targetReps: '8', restSeconds: 120 },
      ],
    },
    {
      id: 'day_custom_3',
      dayName: 'Miércoles - Pierna y Abdomen',
      focus: 'Piernas y Core',
      exercises: [
        { id: 'e7', exerciseId: '0739', name: 'Sled 45° leg press', targetSets: 3, targetReps: '8', restSeconds: 180 },
        { id: 'e8', exerciseId: '0585', name: 'Lever leg extension', targetSets: 3, targetReps: '8', restSeconds: 120 },
        { id: 'e9', exerciseId: '0175', name: 'Cable kneeling crunch', targetSets: 3, targetReps: '10', restSeconds: 90 },
      ],
    },
    {
      id: 'day_custom_4',
      dayName: 'Jueves - Upper',
      focus: 'Torso Superior',
      exercises: [
        { id: 'e10', exerciseId: '0314', name: 'Dumbbell incline bench press', targetSets: 3, targetReps: '8', restSeconds: 150 },
        { id: 'e11', exerciseId: '1350', name: 'Lever seated row', targetSets: 3, targetReps: '8', restSeconds: 150 },
        { id: 'e12', exerciseId: '0334', name: 'Dumbbell lateral raise', targetSets: 4, targetReps: '8', restSeconds: 90 },
      ],
    },
    {
      id: 'day_custom_5',
      dayName: 'Viernes - Lower',
      focus: 'Cadena Posterior & Pierna',
      exercises: [
        { id: 'e13', exerciseId: '0043', name: 'Barbell full squat', targetSets: 3, targetReps: '8', restSeconds: 180 },
        { id: 'e14', exerciseId: '1459', name: 'Dumbbell romanian deadlift', targetSets: 3, targetReps: '8', restSeconds: 150 },
        { id: 'e15', exerciseId: '0598', name: 'Lever seated hip adduction', targetSets: 3, targetReps: '8', restSeconds: 90 },
      ],
    },
  ]);
  const initialDaysRef = useRef(days);

  const [activeDayIdx, setActiveDayIdx] = useState(0);

  // Catalog picker state (used when currentView === 'catalog')
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerBodyPart, setPickerBodyPart] = useState('all');
  const [exerciseIndexToReplace, setExerciseIndexToReplace] = useState<number | null>(null);
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);
  const [recentlyMovedExerciseId, setRecentlyMovedExerciseId] = useState<string | null>(null);
  const draggedExerciseIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentView('editor');
    setActiveDayIdx(0);
    setPickerSearch('');
    setPickerBodyPart('all');
    setExerciseIndexToReplace(null);

    if (routineToEdit) {
      setRoutineName(routineToEdit.name);
      setDescription(routineToEdit.description);
      setTargetDays(routineToEdit.targetDaysPerWeek);
      setDays(routineToEdit.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((exercise) => ({ ...exercise })),
      })));
      return;
    }

    setRoutineName('Mi Rutina Personalizada');
    setDescription('Protocolo personalizado diseñado a medida.');
    setTargetDays(5);
    setDays(initialDaysRef.current.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => ({ ...exercise })),
    })));
  }, [isOpen, routineToEdit]);

  const filteredPickerExercises = useMemo(() => {
    return searchExercises(pickerSearch, {
      bodyPart: pickerBodyPart,
    }).slice(0, 35);
  }, [pickerSearch, pickerBodyPart]);

  if (!isOpen) return null;

  const currentDay = days[activeDayIdx] || days[0];

  // Template loader helpers
  const loadPplxUlTemplate = () => {
    setRoutineName('Mi Protocolo PPL x UL');
    setDescription('5 Días: Push, Pull, Pierna & Abdomen, Upper, Lower optimizado.');
    setTargetDays(5);
    setActiveDayIdx(0);
    showToast('Plantilla PPL x UL cargada');
  };

  const loadPushPullLegs3Template = () => {
    setRoutineName('Rutina Push Pull Legs (3 Días)');
    setDescription('Distribución clásica de 3 días para entrenar todo el cuerpo.');
    setTargetDays(3);
    setDays(days.slice(0, 3));
    setActiveDayIdx(0);
    showToast('Plantilla PPL 3 días cargada');
  };

  const loadBlankTemplate = () => {
    setRoutineName('Nueva Rutina Personalizada');
    setDescription('Plan diseñado a medida.');
    setTargetDays(1);
    setDays([
      {
        id: `day_${Date.now()}_1`,
        dayName: 'Día 1 - Sesión',
        focus: 'Foco muscular',
        exercises: [],
      },
    ]);
    setActiveDayIdx(0);
    showToast('Plantilla en blanco lista');
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

  // Exercise actions within a day
  const handleAddExerciseToCurrentDay = (dbEx: Exercise) => {
    const targetDayIndex = activeDayIdx;
    const currentExercises = days[targetDayIndex]?.exercises || [];
    const exerciseToReplace =
      exerciseIndexToReplace === null ? undefined : currentExercises[exerciseIndexToReplace];

    const newRoutineExercise: RoutineExercise = {
      id: exerciseToReplace?.id || `ex_${Date.now()}_${currentExercises.length + 1}`,
      exerciseId: dbEx.id,
      name: dbEx.name,
      targetSets: exerciseToReplace?.targetSets ?? 3,
      targetReps: exerciseToReplace?.targetReps ?? '8',
      restSeconds: exerciseToReplace?.restSeconds ?? 120,
      targetRpe: exerciseToReplace?.targetRpe,
      notes: exerciseToReplace?.notes,
      category: dbEx.body_part,
      target: dbEx.target,
    };

    const updatedDays = [...days];
    updatedDays[targetDayIndex] = {
      ...updatedDays[targetDayIndex],
      exercises: exerciseToReplace
        ? currentExercises.map((exercise, index) =>
            index === exerciseIndexToReplace ? newRoutineExercise : exercise
          )
        : [...currentExercises, newRoutineExercise],
    };

    setDays(updatedDays);
    if (exerciseToReplace) {
      setExerciseIndexToReplace(null);
      setCurrentView('editor');
      showToast(`Ejercicio cambiado por ${dbEx.name}.`);
    } else if (routineToEdit) {
      updateRoutine(routineToEdit.id, {
        name: routineName.trim(),
        description: description.trim() || 'Rutina personalizada diseñada en Aesthetix.',
        targetDaysPerWeek: updatedDays.length,
        days: updatedDays,
      });
      onRoutineUpdated?.(targetDayIndex);
      showToast(`${dbEx.name} añadido a ${updatedDays[targetDayIndex]?.dayName || 'la rutina'}.`);
      onClose();
    } else {
      showToast(`${dbEx.name} añadido.`);
    }
  };

  const handleRemoveExerciseFromDay = (dayIndex: number, exIndex: number) => {
    const updatedDays = [...days];
    const targetExercises = updatedDays[dayIndex].exercises.filter((_, i) => i !== exIndex);
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], exercises: targetExercises };
    setDays(updatedDays);
  };

  const handleMoveExerciseInDay = (dayIndex: number, exerciseIndex: number, direction: -1 | 1) => {
    const day = days[dayIndex];
    const nextIndex = exerciseIndex + direction;
    if (!day || nextIndex < 0 || nextIndex >= day.exercises.length) return;

    const exercises = [...day.exercises];
    [exercises[exerciseIndex], exercises[nextIndex]] = [exercises[nextIndex], exercises[exerciseIndex]];

    const updatedDays = [...days];
    updatedDays[dayIndex] = { ...day, exercises };
    setDays(updatedDays);
    if (routineToEdit) {
      updateRoutine(routineToEdit.id, {
        days: updatedDays,
        targetDaysPerWeek: updatedDays.length,
      });
    }
    setRecentlyMovedExerciseId(exercises[nextIndex].id);
  };

  const handleExerciseDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const fromIndex = draggedExerciseIndexRef.current;
    if (fromIndex === null) return;

    const element = document.elementFromPoint(event.clientX, event.clientY);
    const card = element?.closest<HTMLElement>('[data-exercise-index]');
    const toIndex = Number(card?.dataset.exerciseIndex);
    if (!Number.isInteger(toIndex) || toIndex === fromIndex) return;

    const day = days[activeDayIdx];
    if (!day || toIndex < 0 || toIndex >= day.exercises.length) return;
    const exercises = [...day.exercises];
    const [movedExercise] = exercises.splice(fromIndex, 1);
    exercises.splice(toIndex, 0, movedExercise);
    const updatedDays = [...days];
    updatedDays[activeDayIdx] = { ...day, exercises };
    setDays(updatedDays);
    if (routineToEdit) {
      updateRoutine(routineToEdit.id, {
        days: updatedDays,
        targetDaysPerWeek: updatedDays.length,
      });
    }
    draggedExerciseIndexRef.current = toIndex;
    setDraggedExerciseIndex(toIndex);
    setRecentlyMovedExerciseId(movedExercise.id);
  };

  const handleExerciseDragEnd = () => {
    draggedExerciseIndexRef.current = null;
    setDraggedExerciseIndex(null);
  };

  const handleUpdateExerciseInDay = (
    dayIndex: number,
    exIndex: number,
    field: keyof RoutineExercise,
    val: any
  ) => {
    const updatedDays = [...days];
    const exercises = [...updatedDays[dayIndex].exercises];
    exercises[exIndex] = { ...exercises[exIndex], [field]: val };
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], exercises };
    setDays(updatedDays);
  };

  // Save routine
  const handleSaveRoutine = () => {
    if (!routineName.trim()) {
      showToast('Por favor introduce un nombre para la rutina.');
      return;
    }

    const totalExercises = days.reduce((sum, d) => sum + d.exercises.length, 0);
    if (totalExercises === 0) {
      showToast('Añade al menos un ejercicio a la rutina.');
      return;
    }

    if (routineToEdit) {
      updateRoutine(routineToEdit.id, {
        name: routineName.trim(),
        description: description.trim() || 'Rutina personalizada diseñada en Aesthetix.',
        targetDaysPerWeek: days.length,
        days,
      });
      showToast(`Rutina "${routineName.trim()}" actualizada.`);
    } else {
      const newRoutine: WorkoutRoutine = {
        id: `routine_custom_${Date.now()}`,
        name: routineName.trim(),
        description: description.trim() || 'Rutina personalizada diseñada en Aesthetix.',
        splitType: 'custom',
        targetDaysPerWeek: days.length,
        days,
        createdAt: new Date().toISOString(),
      };

      addRoutine(newRoutine);
      setActiveRoutineId(newRoutine.id);
      showToast(`Rutina "${newRoutine.name}" creada y activada.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in p-2">
      {/* Backdrop (single layer, prevents WebKit blur deadlock) */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* Main Single Modal Container */}
      <div
        className="relative w-full max-w-lg fitness-surface-elevated rounded-[32px] p-5 z-10 border border-white/20 shadow-2xl space-y-4 max-h-[calc(100dvh-120px)] sm:max-h-[90vh] flex flex-col overscroll-contain"
        onTouchMove={(e) => e.stopPropagation()}
      >
        
        {/* ======================================================== */}
        {/* VIEW 1: ROUTINE EDITOR                                  */}
        {/* ======================================================== */}
        {currentView === 'editor' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#A1F524]/20 text-[#A1F524] flex items-center justify-center text-sm font-black border border-[#A1F524]/30">
                  🛠️
                </span>
                <div>
                  <h3 className="text-sm font-black text-[#F5F5F7]">
                    {routineToEdit ? 'Editar rutina' : 'Creador de Rutina'}
                  </h3>
                  <p className="text-[10px] font-bold text-[#8E8E93]">
                    {routineToEdit
                      ? 'Modifica los ejercicios, series, repeticiones y descansos'
                      : 'Personaliza días, series, repeticiones y descansos'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full fitness-pill flex items-center justify-center text-xs text-[#8E8E93] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Editor Content */}
            <div
              className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar"
              onPointerMove={handleExerciseDragMove}
              onPointerUp={handleExerciseDragEnd}
              onPointerCancel={handleExerciseDragEnd}
            >
              {/* Quick Template Presets */}
              {!routineToEdit && <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">
                  Plantillas Rápidas
                </p>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                    type="button"
                    onClick={loadPplxUlTemplate}
                    className="shrink-0 px-3 py-1.5 rounded-full fitness-pill text-xs font-bold text-[#A1F524] hover:bg-[#A1F524]/15 active:scale-95 transition-all"
                  >
                    ⚡ PPL x UL (5 Días)
                  </button>
                  <button
                    type="button"
                    onClick={loadPushPullLegs3Template}
                    className="shrink-0 px-3 py-1.5 rounded-full fitness-pill text-xs font-bold text-[#64D2FF] hover:bg-[#64D2FF]/15 active:scale-95 transition-all"
                  >
                    💪 PPL Clásico (3 Días)
                  </button>
                  <button
                    type="button"
                    onClick={loadBlankTemplate}
                    className="shrink-0 px-3 py-1.5 rounded-full fitness-pill text-xs font-bold text-[#8E8E93] hover:text-white active:scale-95 transition-all"
                  >
                    📝 En Blanco
                  </button>
                </div>
              </div>}

              {/* Routine Basic Info Inputs */}
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#8E8E93] block mb-1">
                    Nombre del Protocolo
                  </label>
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    placeholder="Ej: Mi Rutina PPL x UL"
                    className="w-full fitness-surface rounded-[16px] px-3.5 py-2.5 text-xs font-bold text-[#F5F5F7] outline-none border border-white/10 focus:border-[#A1F524]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#8E8E93] block mb-1">
                    Descripción / Foco
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Distribución de 5 días con descansos programados..."
                    className="w-full fitness-surface rounded-[16px] px-3.5 py-2.5 text-xs font-bold text-[#F5F5F7] outline-none border border-white/10 focus:border-[#A1F524]"
                  />
                </div>
              </div>

              {/* Days Navigation Pills */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
                    DÍAS DE LA SEMANA ({days.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="text-[11px] font-black text-[#A1F524] hover:underline flex items-center gap-1"
                  >
                    <span>+ Añadir Día</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {days.map((day, idx) => (
                    <button
                      key={day.id || idx}
                      type="button"
                      onClick={() => setActiveDayIdx(idx)}
                      className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                        activeDayIdx === idx
                          ? 'bg-[#A1F524] text-black shadow-md'
                          : 'fitness-pill text-[#8E8E93] hover:text-white'
                      }`}
                    >
                      <span>{day.dayName}</span>
                      <span className="opacity-75 font-mono text-[10px]">
                        ({day.exercises.length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Day Exercises Section */}
              {currentDay && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  {/* Day Config Card */}
                  <div className="fitness-surface rounded-[20px] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={currentDay.dayName}
                        onChange={(e) => handleUpdateDay(activeDayIdx, { dayName: e.target.value })}
                        className="bg-transparent text-xs font-black text-[#F5F5F7] outline-none border-b border-transparent focus:border-[#A1F524] pb-0.5"
                        placeholder="Nombre del día..."
                      />
                      {days.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDay(activeDayIdx)}
                          className="text-[10px] font-bold text-[#FF453A] hover:underline"
                        >
                          Eliminar día
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={currentDay.focus}
                      onChange={(e) => handleUpdateDay(activeDayIdx, { focus: e.target.value })}
                      className="w-full bg-transparent text-[11px] font-bold text-[#8E8E93] outline-none border-b border-transparent focus:border-white/20 pb-0.5"
                      placeholder="Músculos objetivo (ej: Pecho, Hombro, Tríceps)..."
                    />
                  </div>

                  {/* Exercises List in current day */}
                  <div className="space-y-2">
                    {currentDay.exercises.length === 0 ? (
                      <div className="p-4 rounded-[18px] border border-dashed border-white/10 text-center space-y-1">
                        <p className="text-xs font-bold text-[#8E8E93]">
                          No hay ejercicios añadidos a este día todavía
                        </p>
                      </div>
                    ) : (
                      currentDay.exercises.map((ex, exIdx) => {
                        const dbEx = getExerciseById(ex.exerciseId) || searchExercises(ex.name).find(
                          (exercise) => exercise.name.trim().toLowerCase() === ex.name.trim().toLowerCase()
                        );
                        const media = getExerciseMediaUrls(dbEx);
                        const muscleLabel = dbEx
                          ? BODY_PART_TRANSLATIONS[dbEx.body_part] || dbEx.body_part
                          : BODY_PART_TRANSLATIONS[ex.category || ''] || ex.category || 'Entrenamiento';

                        return (
                          <div
                            key={ex.id || exIdx}
                            data-exercise-index={exIdx}
                            className={`rounded-[20px] bg-[#1C1C1E] border border-white/[0.07] p-3 space-y-3 transition-[transform,opacity,box-shadow] duration-200 ${
                              draggedExerciseIndex === exIdx ? 'scale-[1.02] opacity-80 shadow-[0_0_22px_rgba(161,245,36,0.2)]' : ''
                            } ${recentlyMovedExerciseId === ex.id ? 'animate-[exercise-reorder_220ms_ease-out]' : ''}`}
                            onAnimationEnd={() => {
                              if (recentlyMovedExerciseId === ex.id) setRecentlyMovedExerciseId(null);
                            }}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-[68px] h-[68px] rounded-[16px] bg-black overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                                <span className="text-xl" aria-hidden="true">🏋️</span>
                                {media.imageUrl && (
                                  <img
                                    src={media.imageUrl}
                                    alt={ex.name}
                                    className="absolute inset-0 w-full h-full object-contain exercise-media-dark"
                                    loading="lazy"
                                    onError={(event) => {
                                      event.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                                <span className="absolute bottom-1 left-1 min-w-5 h-5 px-1 rounded-full bg-black/80 flex items-center justify-center text-[10px] text-[#A1F524] font-black">
                                  {exIdx + 1}
                                </span>
                              </div>

                              <div className="min-w-0 flex-1">
                                <span className="block text-[9px] font-black uppercase tracking-widest text-[#8E8E93]">
                                  Ejercicio {exIdx + 1}
                                </span>
                                <p className="mt-0.5 text-xs font-black text-white capitalize leading-snug line-clamp-2">
                                  {ex.name}
                                </p>
                                <p className="mt-1 text-[10px] font-bold text-[#00F0FF] capitalize truncate">
                                  {muscleLabel}{dbEx?.target ? ` · ${dbEx.target}` : ex.target ? ` · ${ex.target}` : ''}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setPickerSearch('');
                                  setExerciseIndexToReplace(exIdx);
                                  setCurrentView('catalog');
                                }}
                                className="shrink-0 rounded-full bg-[#00F0FF]/10 px-2.5 py-2 text-[10px] font-black text-[#00F0FF] fitness-press"
                                aria-label={`Cambiar ${ex.name}`}
                              >
                                Cambiar
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <label className="min-w-0 rounded-[14px] bg-[#242426] border border-white/[0.05] px-2.5 py-2">
                                <span className="block text-[9px] font-bold text-[#8E8E93]">Series</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={ex.targetSets}
                                  onChange={(event) => handleUpdateExerciseInDay(
                                    activeDayIdx,
                                    exIdx,
                                    'targetSets',
                                    parseInt(event.target.value) || 3
                                  )}
                                  className="mt-1 w-full bg-transparent text-sm font-black font-mono text-[#A1F524] outline-none"
                                  aria-label={`Series para ${ex.name}`}
                                />
                              </label>
                              <label className="min-w-0 rounded-[14px] bg-[#242426] border border-white/[0.05] px-2.5 py-2">
                                <span className="block text-[9px] font-bold text-[#8E8E93]">Reps</span>
                                <input
                                  type="text"
                                  value={ex.targetReps}
                                  onChange={(event) => handleUpdateExerciseInDay(
                                    activeDayIdx,
                                    exIdx,
                                    'targetReps',
                                    event.target.value
                                  )}
                                  className="mt-1 w-full bg-transparent text-sm font-black font-mono text-white outline-none"
                                  aria-label={`Repeticiones para ${ex.name}`}
                                />
                              </label>
                              <label className="min-w-0 rounded-[14px] bg-[#242426] border border-white/[0.05] px-2.5 py-2">
                                <span className="block text-[9px] font-bold text-[#8E8E93]">Descanso</span>
                                <div className="mt-1 flex items-baseline gap-1">
                                  <input
                                    type="number"
                                    min="30"
                                    max="300"
                                    step="15"
                                    value={ex.restSeconds}
                                    onChange={(event) => handleUpdateExerciseInDay(
                                      activeDayIdx,
                                      exIdx,
                                      'restSeconds',
                                      parseInt(event.target.value) || 120
                                    )}
                                    className="w-full min-w-0 bg-transparent text-sm font-black font-mono text-white outline-none"
                                    aria-label={`Descanso en segundos para ${ex.name}`}
                                  />
                                  <span className="text-[9px] font-bold text-[#8E8E93]">s</span>
                                </div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5" aria-label={`Cambiar orden de ${ex.name}`}>
                                <span className="text-[10px] font-bold text-[#8E8E93]">Orden</span>
                                <button
                                  type="button"
                                  className="w-7 h-7 rounded-full fitness-pill text-xs font-black text-[#A1F524] touch-none cursor-grab active:cursor-grabbing"
                                  aria-label={`Arrastrar ${ex.name} para cambiar su orden`}
                                  title="Arrastrar para reordenar"
                                  onPointerDown={(event) => {
                                    event.preventDefault();
                                    event.currentTarget.setPointerCapture(event.pointerId);
                                    draggedExerciseIndexRef.current = exIdx;
                                    setDraggedExerciseIndex(exIdx);
                                  }}
                                  onPointerUp={handleExerciseDragEnd}
                                  onPointerCancel={handleExerciseDragEnd}
                                >
                                  ⠿
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveExerciseInDay(activeDayIdx, exIdx, -1)}
                                  disabled={exIdx === 0}
                                  className="w-7 h-7 rounded-full fitness-pill text-xs font-black text-[#A1F524] disabled:opacity-30 disabled:pointer-events-none"
                                  aria-label={`Subir ${ex.name}`}
                                  title="Subir"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveExerciseInDay(activeDayIdx, exIdx, 1)}
                                  disabled={exIdx === currentDay.exercises.length - 1}
                                  className="w-7 h-7 rounded-full fitness-pill text-xs font-black text-[#A1F524] disabled:opacity-30 disabled:pointer-events-none"
                                  aria-label={`Bajar ${ex.name}`}
                                  title="Bajar"
                                >
                                  ↓
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveExerciseFromDay(activeDayIdx, exIdx)}
                                className="px-2 py-1 text-[10px] font-bold text-[#FF453A] fitness-press"
                                aria-label={`Quitar ${ex.name} de la rutina`}
                              >
                                Quitar ejercicio
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Open Catalog Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setPickerSearch('');
                        setExerciseIndexToReplace(null);
                        setCurrentView('catalog');
                      }}
                      className="w-full py-3 rounded-full border border-dashed border-[#A1F524]/50 text-[#A1F524] hover:bg-[#A1F524]/10 text-xs font-black transition-all flex items-center justify-center gap-2"
                    >
                      <span className="text-sm">+</span>
                      <span>Añadir ejercicio desde el catálogo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-full fitness-pill text-xs font-black text-[#8E8E93] hover:text-white transition-all"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveRoutine}
                className="flex-[2] py-3.5 rounded-full bg-gradient-to-r from-[#A1F524] to-[#2ECC71] text-black font-black text-xs shadow-[0_0_25px_rgba(161,245,36,0.35)] hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <span>✓</span>
                <span>{routineToEdit ? 'Guardar cambios' : 'Guardar Rutina'}</span>
              </button>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: INLINE EXERCISE CATALOG PICKER                  */}
        {/* ======================================================== */}
        {currentView === 'catalog' && (
          <>
            {/* Header with Back Button */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentView('editor')}
                className="flex items-center gap-1.5 fitness-pill px-3 py-1.5 rounded-full text-xs font-black text-[#A1F524] hover:text-white transition-all"
              >
                <span>←</span>
                <span>Volver a la rutina</span>
              </button>

              <div className="text-right">
                <h4 className="text-xs font-black text-[#F5F5F7] truncate max-w-[160px]">
                  {exerciseIndexToReplace !== null ? 'Cambiar ejercicio' : currentDay.dayName}
                </h4>
                <p className="text-[10px] font-bold text-[#8E8E93]">
                  {exerciseIndexToReplace !== null
                    ? `Reemplaza ${currentDay.exercises[exerciseIndexToReplace]?.name || 'el ejercicio'}`
                    : `${currentDay.exercises.length} ejercicios agregados`}
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2 shrink-0">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Buscar ejercicio por nombre o músculo..."
                className="w-full fitness-surface rounded-[16px] px-3.5 py-2.5 text-xs font-bold text-[#F5F5F7] outline-none border border-white/10 focus:border-[#A1F524]"
              />

              {/* Muscle Group Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => setPickerBodyPart('all')}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                    pickerBodyPart === 'all'
                      ? 'bg-[#A1F524] text-black'
                      : 'fitness-pill text-[#8E8E93] hover:text-white'
                  }`}
                >
                  Todos
                </button>
                {['chest', 'back', 'upper legs', 'shoulders', 'upper arms', 'waist', 'lower legs'].map(
                  (bp) => (
                    <button
                      key={bp}
                      type="button"
                      onClick={() => setPickerBodyPart(bp)}
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                        pickerBodyPart === bp
                          ? 'bg-[#A1F524] text-black'
                          : 'fitness-pill text-[#8E8E93] hover:text-white'
                      }`}
                    >
                      {BODY_PART_TRANSLATIONS[bp] || bp}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Exercise Results List with Thumbnails */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {filteredPickerExercises.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs font-bold text-[#8E8E93]">
                    No se encontraron ejercicios con ese término.
                  </p>
                </div>
              ) : (
                filteredPickerExercises.map((dbEx) => {
                  const isAlreadyInDay = currentDay.exercises.some((e) => e.exerciseId === dbEx.id);
                  return (
                    <div
                      key={dbEx.id}
                      onClick={() => handleAddExerciseToCurrentDay(dbEx)}
                      className="fitness-surface p-2.5 rounded-[18px] flex items-center justify-between gap-3 hover:border-[#A1F524]/50 cursor-pointer active:scale-98 transition-all"
                    >
                      {/* Exercise Thumbnail / GIF */}
                      <div className="w-12 h-12 rounded-[14px] bg-[#000000] overflow-hidden flex items-center justify-center shrink-0 border border-white/10 p-0.5">
                        {(() => {
                          const media = getExerciseMediaUrls(dbEx);
                          return media.imageUrl ? (
                            <img
                              src={media.imageUrl}
                              alt={dbEx.name}
                              className="w-full h-full object-contain exercise-media-dark"
                              loading="lazy"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                const parent = (e.currentTarget as HTMLElement).parentElement;
                                if (parent && !parent.querySelector('.img-fallback')) {
                                  const fallback = document.createElement('span');
                                  fallback.className = 'text-base img-fallback';
                                  fallback.innerText = '🏋️';
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-base">🏋️</span>
                          );
                        })()}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-[#F5F5F7] capitalize truncate">
                          {dbEx.name}
                        </p>
                        <p className="text-[10px] font-bold text-[#8E8E93]">
                          {BODY_PART_TRANSLATIONS[dbEx.body_part] || dbEx.body_part} •{' '}
                          <span className="text-[#A1F524] capitalize">{dbEx.target}</span>
                        </p>
                      </div>

                      {/* Action Button */}
                      <span
                        className={`min-w-7 h-7 px-2 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                          exerciseIndexToReplace !== null
                            ? 'bg-[#00F0FF]/15 text-[#00F0FF]'
                            : isAlreadyInDay
                            ? 'bg-[#A1F524] text-black shadow-md'
                            : 'bg-[#A1F524]/20 text-[#A1F524] hover:bg-[#A1F524] hover:text-black'
                        }`}
                      >
                        {exerciseIndexToReplace !== null ? 'Cambiar' : isAlreadyInDay ? '✓' : '+'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Catalog Done Button */}
            <div className="pt-2 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentView('editor')}
                className="w-full py-3 rounded-full bg-[#A1F524] text-black font-black text-xs shadow-md active:scale-98 transition-all"
              >
                Listo ({currentDay.exercises.length} en este día) → Volver a la rutina
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
