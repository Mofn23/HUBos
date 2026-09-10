'use client';

import React, { useState } from 'react';
import { useScheduleStore, TaskItem } from '@/stores/useScheduleStore';
import { BottomModal } from '../common/BottomModal';
import { format, addDays } from 'date-fns';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  editingTask?: TaskItem | null;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  editingTask,
}) => {
  const { subjects, addTask, updateTask } = useScheduleStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [title, setTitle] = useState(editingTask?.title || '');
  const [subjectId, setSubjectId] = useState(
    editingTask?.subjectId || defaultSubjectId || (subjects[0]?.id || '')
  );
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || todayStr);
  const [dueTime, setDueTime] = useState(editingTask?.dueTime || '23:59');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    editingTask?.priority || 'medium'
  );
  const [description, setDescription] = useState(editingTask?.description || '');

  // Reset state when opening
  React.useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setSubjectId(editingTask.subjectId || '');
      setDueDate(editingTask.dueDate);
      setDueTime(editingTask.dueTime || '23:59');
      setPriority(editingTask.priority);
      setDescription(editingTask.description || '');
    } else {
      setTitle('');
      setSubjectId(defaultSubjectId || (subjects[0]?.id || ''));
      setDueDate(todayStr);
      setDueTime('23:59');
      setPriority('medium');
      setDescription('');
    }
  }, [editingTask, defaultSubjectId, isOpen, subjects, todayStr]);

  const handleQuickDate = (daysAhead: number) => {
    const d = addDays(new Date(), daysAhead);
    setDueDate(format(d, 'yyyy-MM-dd'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        subjectId: subjectId || undefined,
        dueDate,
        dueTime,
        priority,
        description: description.trim(),
      });
    } else {
      addTask({
        title: title.trim(),
        subjectId: subjectId || undefined,
        dueDate,
        dueTime,
        priority,
        completed: false,
        description: description.trim(),
      });
    }

    onClose();
  };

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? 'Editar Tarea / Entrega' : 'Agregar Nueva Tarea'}
      subtitle="Registra tareas, exámenes o compromisos académicos"
      maxHeightClass="h-[calc(100vh-60px)] max-h-[85vh]"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            Título de la Tarea o Examen *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Taller de Manejo en Carretera, Taller #2 de Cálculo..."
            required
            className="w-full bg-[#242426] border border-white/10 rounded-[18px] px-4 py-3 text-[#F5F5F7] font-bold text-sm focus:outline-none focus:border-[#34C759]"
          />
        </div>

        {/* Linked Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            Vincular con una Materia
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full bg-[#242426] border border-white/10 rounded-[18px] px-4 py-3 text-[#F5F5F7] font-bold text-xs focus:outline-none focus:border-[#34C759]"
          >
            <option value="">General / Sin Materia Específica</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.emoji} {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date & Quick Chips */}
        <div className="space-y-2 p-4 rounded-[22px] bg-[#1F1F22] border border-white/5">
          <label className="text-xs font-black uppercase tracking-wider text-[#F5F5F7]">
            Fecha y Hora Límite 📅
          </label>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 bg-[#28282C] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] font-bold focus:outline-none focus:border-[#34C759]"
            />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-28 bg-[#28282C] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] font-bold focus:outline-none focus:border-[#34C759]"
            />
          </div>

          {/* Quick Date Chips */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleQuickDate(0)}
              className="px-2.5 py-1 rounded-lg bg-[#28282C] text-[11px] font-extrabold text-[#8E8E93] hover:text-[#F5F5F7] border border-white/5"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(1)}
              className="px-2.5 py-1 rounded-lg bg-[#28282C] text-[11px] font-extrabold text-[#8E8E93] hover:text-[#F5F5F7] border border-white/5"
            >
              Mañana
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(3)}
              className="px-2.5 py-1 rounded-lg bg-[#28282C] text-[11px] font-extrabold text-[#8E8E93] hover:text-[#F5F5F7] border border-white/5"
            >
              En 3 días
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(7)}
              className="px-2.5 py-1 rounded-lg bg-[#28282C] text-[11px] font-extrabold text-[#8E8E93] hover:text-[#F5F5F7] border border-white/5"
            >
              Próxima semana
            </button>
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            Nivel de Prioridad
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPriority('low')}
              className={`py-2 rounded-[16px] text-xs font-black transition-all ${
                priority === 'low'
                  ? 'bg-[#34C759] text-black shadow-glowGreen scale-102'
                  : 'bg-[#242426] border border-white/5 text-[#8E8E93]'
              }`}
            >
              Baja
            </button>
            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`py-2 rounded-[16px] text-xs font-black transition-all ${
                priority === 'medium'
                  ? 'bg-[#FF9500] text-black shadow-card scale-102'
                  : 'bg-[#242426] border border-white/5 text-[#8E8E93]'
              }`}
            >
              Media
            </button>
            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`py-2 rounded-[16px] text-xs font-black transition-all ${
                priority === 'high'
                  ? 'bg-[#FF453A] text-white shadow-glowRed scale-102'
                  : 'bg-[#242426] border border-white/5 text-[#8E8E93]'
              }`}
            >
              Alta 🔥
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93]">
            Descripción o Instrucciones
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Puntos a entregar, lectura asignada..."
            className="w-full bg-[#242426] border border-white/10 rounded-[16px] p-3 text-xs text-[#F5F5F7] font-bold focus:outline-none focus:border-[#34C759] resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full py-4 rounded-full bg-[#34C759] disabled:opacity-50 text-black font-black text-sm shadow-glowGreen active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span>✓</span>
          <span>{editingTask ? 'Actualizar Tarea' : 'Guardar Tarea'}</span>
        </button>
      </form>
    </BottomModal>
  );
};
