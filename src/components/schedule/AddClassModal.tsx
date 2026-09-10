'use client';

import React, { useState, useEffect } from 'react';
import { useScheduleStore, SubjectItem, ClassSlot } from '@/stores/useScheduleStore';
import { BottomModal } from '../common/BottomModal';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubject?: SubjectItem | null;
}

const DAYS_OPTIONS = [
  { id: 1, label: 'Lunes', short: 'Lun' },
  { id: 2, label: 'Martes', short: 'Mar' },
  { id: 3, label: 'Miércoles', short: 'Mié' },
  { id: 4, label: 'Jueves', short: 'Jue' },
  { id: 5, label: 'Viernes', short: 'Vie' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
  { id: 7, label: 'Domingo', short: 'Dom' },
];

const PRESET_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Amber
  '#34C759', // Green
  '#00C7BE', // Teal
  '#30B0C7', // Cyan
  '#0A84FF', // Blue
  '#5856D6', // Indigo
  '#AF52DE', // Purple
  '#FF2D55', // Pink
];

const PRESET_EMOJIS = ['🚗', '📚', '💻', '🔬', '📐', '⚖️', '🎨', '🩺', '⚡', '💪', '🎵', '🗣️'];

const DURATION_OPTIONS = [
  { minutes: 60, label: '1 hora' },
  { minutes: 90, label: '1.5 hrs' },
  { minutes: 120, label: '2 horas' },
  { minutes: 180, label: '3 horas' },
  { minutes: 240, label: '4 horas' },
];

export const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
  editingSubject,
}) => {
  const { profiles, activeProfileId, addSubject, updateSubject } = useScheduleStore();

  const [profileId, setProfileId] = useState(activeProfileId === 'all' ? 'uni' : activeProfileId);
  const [name, setName] = useState('');
  const [shortInfo, setShortInfo] = useState('');
  const [instructor, setInstructor] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Monday by default
  const [startHour, setStartHour] = useState('07:00');
  const [durationMinutes, setDurationMinutes] = useState(120); // 2 hours by default
  const [color, setColor] = useState(PRESET_COLORS[1]); // Orange by default
  const [emoji, setEmoji] = useState('🚗');
  const [targetSessions, setTargetSessions] = useState<number | ''>('');
  const [maxAbsences, setMaxAbsences] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Populate if editing
  useEffect(() => {
    if (editingSubject) {
      setProfileId(editingSubject.profileId);
      setName(editingSubject.name);
      setShortInfo(editingSubject.shortInfo || '');
      setInstructor(editingSubject.instructor || '');
      setColor(editingSubject.color);
      setEmoji(editingSubject.emoji || '📚');
      setTargetSessions(editingSubject.targetSessions ?? '');
      setMaxAbsences(editingSubject.maxAbsences ?? '');
      setNotes(editingSubject.notes || '');

      if (editingSubject.slots && editingSubject.slots.length > 0) {
        setSelectedDays(editingSubject.slots.map((s) => s.dayOfWeek));
        setStartHour(editingSubject.slots[0].startHour);
        setDurationMinutes(editingSubject.slots[0].durationMinutes);
      }
    } else {
      setName('');
      setShortInfo('');
      setInstructor('');
      setSelectedDays([1]);
      setStartHour('07:00');
      setDurationMinutes(120);
      setColor(PRESET_COLORS[1]);
      setEmoji('🚗');
      setTargetSessions('');
      setMaxAbsences('');
      setNotes('');
    }
  }, [editingSubject, isOpen]);

  // Toggle days
  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  // Compute End Hour
  const calculateEndHour = (start: string, durationMins: number): string => {
    const [h, m] = start.split(':').map(Number);
    const totalMins = h * 60 + m + durationMins;
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const endHour = calculateEndHour(startHour, durationMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build slots for all selected days
    const [h, m] = startHour.split(':').map(Number);
    const startMins = h * 60 + m;

    const slots: ClassSlot[] = selectedDays.map((day) => ({
      id: `slot_${Date.now()}_${day}_${Math.random().toString(36).substring(2, 6)}`,
      subjectId: editingSubject ? editingSubject.id : '',
      dayOfWeek: day,
      startHour,
      endHour,
      startMinutes: startMins,
      durationMinutes,
      room: shortInfo.trim() || undefined,
    }));

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        profileId,
        name: name.trim(),
        shortInfo: shortInfo.trim(),
        instructor: instructor.trim(),
        color,
        emoji,
        targetSessions: targetSessions === '' ? undefined : Number(targetSessions),
        maxAbsences: maxAbsences === '' ? undefined : Number(maxAbsences),
        notes: notes.trim(),
        slots,
      });
    } else {
      addSubject({
        profileId,
        name: name.trim(),
        shortInfo: shortInfo.trim(),
        instructor: instructor.trim(),
        color,
        emoji,
        targetSessions: targetSessions === '' ? undefined : Number(targetSessions),
        maxAbsences: maxAbsences === '' ? undefined : Number(maxAbsences),
        notes: notes.trim(),
        slots,
      });
    }

    onClose();
  };

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSubject ? 'Editar Materia / Clase' : 'Agregar Nueva Materia'}
      subtitle="Configura horarios, días recurrentes y control de asistencias"
      maxHeightClass="h-[calc(100vh-40px)] max-h-[94vh]"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-8">
        {/* 1. Profile Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            Perfil o Categoría
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {profiles
              .filter((p) => p.id !== 'all')
              .map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setProfileId(p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
                    profileId === p.id
                      ? 'bg-[#34C759] text-black shadow-glowGreen scale-100'
                      : 'bg-[#242426] border border-white/5 text-[#8E8E93] hover:text-[#F5F5F7]'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
          </div>
        </div>

        {/* 2. Subject Name & Emoji */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            Nombre de la Materia / Clase *
          </label>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-[18px] bg-[#242426] border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {emoji}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Clases de Conducción, Cálculo, Física..."
              required
              className="flex-1 bg-[#242426] border border-white/10 rounded-[18px] px-4 py-3 text-[#F5F5F7] font-bold text-sm focus:outline-none focus:border-[#34C759] transition-colors"
            />
          </div>
        </div>

        {/* Emoji Presets Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {PRESET_EMOJIS.map((e) => (
            <button
              type="button"
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-9 h-9 rounded-[12px] flex items-center justify-center text-lg transition-all shrink-0 ${
                emoji === e ? 'bg-white/20 scale-110 ring-2 ring-[#34C759]' : 'bg-[#242426] hover:bg-white/10'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* 3. MULTI-DAY SELECTOR (The crucial feature requested!) */}
        <div className="p-4 rounded-[22px] bg-[#1F1F22] border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-[#F5F5F7]">
              ¿Qué días se ve esta clase? 🗓️
            </label>
            <span className="text-[11px] font-bold text-[#34C759]">
              {selectedDays.length} {selectedDays.length === 1 ? 'día' : 'días'} seleccionado(s)
            </span>
          </div>

          <p className="text-[11px] font-semibold text-[#8E8E93]">
            Toca los días en los que asistes a esta clase para reflejarlos en tu horario:
          </p>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {DAYS_OPTIONS.map((day) => {
              const isSelected = selectedDays.includes(day.id);
              return (
                <button
                  type="button"
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`py-2 rounded-[14px] text-xs font-black transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#34C759] text-black shadow-glowGreen scale-105'
                      : 'bg-[#28282C] text-[#8E8E93] hover:text-[#F5F5F7] border border-white/5'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold">{day.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Hours and Duration */}
        <div className="p-4 rounded-[22px] bg-[#1F1F22] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-[#F5F5F7]">
              Horario & Duración ⏰
            </label>
            <span className="text-xs font-extrabold text-[#34C759]">
              {startHour} → {endHour}
            </span>
          </div>

          {/* Start Time Input */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#8E8E93]">Hora de Inicio:</span>
            <input
              type="time"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="bg-[#28282C] border border-white/10 rounded-xl px-3 py-1.5 text-[#F5F5F7] font-bold text-sm focus:outline-none focus:border-[#34C759]"
            />
          </div>

          {/* Duration Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#8E8E93] block">Duración de la clase:</span>
            <div className="grid grid-cols-5 gap-1.5">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.minutes}
                  onClick={() => setDurationMinutes(opt.minutes)}
                  className={`py-1.5 px-1 rounded-xl text-center text-xs font-black transition-all ${
                    durationMinutes === opt.minutes
                      ? 'bg-white text-black shadow-sm scale-102'
                      : 'bg-[#28282C] text-[#8E8E93] hover:text-[#F5F5F7] border border-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Short Info / Location & Instructor */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
              Salón / Pista / Info
            </label>
            <input
              type="text"
              value={shortInfo}
              onChange={(e) => setShortInfo(e.target.value)}
              placeholder="Ej: Pista Norte Auto 04"
              className="w-full bg-[#242426] border border-white/10 rounded-[16px] px-3.5 py-2.5 text-xs text-[#F5F5F7] font-bold focus:outline-none focus:border-[#34C759]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
              Profesor / Instructor
            </label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Ej: Carlos Gómez"
              className="w-full bg-[#242426] border border-white/10 rounded-[16px] px-3.5 py-2.5 text-xs text-[#F5F5F7] font-bold focus:outline-none focus:border-[#34C759]"
            />
          </div>
        </div>

        {/* 6. Color Tag Picker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
              Color Identificador de Materia
            </label>
            <div
              style={{ backgroundColor: color }}
              className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white/20"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {PRESET_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full transition-all shrink-0 ${
                  color === c ? 'scale-125 ring-4 ring-white/40 shadow-lg' : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 7. Attendance Shield Config (WOW Feature) */}
        <div className="p-4 rounded-[22px] bg-[#1F1F22] border border-white/5 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <div>
              <h4 className="text-xs font-black text-[#F5F5F7]">Control de Asistencias & Metas</h4>
              <p className="text-[10px] font-bold text-[#8E8E93]">
                Ideal para certificar horas de conducción o evitar faltas en la universidad
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] font-black text-[#8E8E93] uppercase block mb-1">
                Meta de Clases Totales
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={targetSessions}
                onChange={(e) => setTargetSessions(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 15 (Conducción)"
                className="w-full bg-[#28282C] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] font-bold focus:outline-none focus:border-[#34C759]"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-[#8E8E93] uppercase block mb-1">
                Límite de Faltas Permitidas
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxAbsences}
                onChange={(e) => setMaxAbsences(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 3 (Universidad)"
                className="w-full bg-[#28282C] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] font-bold focus:outline-none focus:border-[#34C759]"
              />
            </div>
          </div>
        </div>

        {/* 8. Additional Notes */}
        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
            Notas o Enlaces
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enlaces a reuniones virtuales, temario o apuntes..."
            className="w-full bg-[#242426] border border-white/10 rounded-[16px] p-3 text-xs text-[#F5F5F7] font-bold focus:outline-none focus:border-[#34C759] resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-4 rounded-full bg-[#34C759] disabled:opacity-50 text-black font-black text-sm shadow-glowGreen active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span>✓</span>
          <span>{editingSubject ? 'Actualizar Materia' : 'Guardar en el Horario'}</span>
        </button>
      </form>
    </BottomModal>
  );
};
