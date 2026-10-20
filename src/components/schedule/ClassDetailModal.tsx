'use client';

import React from 'react';
import { useScheduleStore, SubjectItem, ClassSlot } from '@/stores/useScheduleStore';
import { BottomModal } from '../common/BottomModal';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectItem | null;
  activeSlot?: ClassSlot;
  onEditSubject: (subject: SubjectItem) => void;
  onAddTaskForSubject: (subjectId: string) => void;
}

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  isOpen,
  onClose,
  subject,
  activeSlot,
  onEditSubject,
  onAddTaskForSubject,
}) => {
  const { tasks, toggleTask, logAttendance, resetAttendance, deleteSubject, quickNotes, setQuickNote } =
    useScheduleStore();

  if (!subject) return null;

  const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
  const pendingSubjectTasks = subjectTasks.filter((t) => !t.completed);

  // Group recurring days
  const recurringDaysText = subject.slots
    .map((s) => DAY_NAMES[s.dayOfWeek])
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(', ');

  const timeRangeText = subject.slots[0]
    ? `${subject.slots[0].startHour} - ${subject.slots[0].endHour} (${subject.slots[0].durationMinutes}m)`
    : 'Horario no definido';

  // Attendance Calculations
  const hasTargetSessions = typeof subject.targetSessions === 'number' && subject.targetSessions > 0;
  const targetSessions = subject.targetSessions || 0;
  const attended = subject.attendedSessions || 0;
  const targetPercent = hasTargetSessions ? Math.min(100, Math.round((attended / targetSessions) * 100)) : 0;

  const hasMaxAbsences = typeof subject.maxAbsences === 'number' && subject.maxAbsences > 0;
  const maxAbsences = subject.maxAbsences || 0;
  const absences = subject.absencesCount || 0;
  const absencesRemaining = Math.max(0, maxAbsences - absences);

  const currentNote = quickNotes[subject.id] || '';

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar "${subject.name}" de tu horario?`)) {
      deleteSubject(subject.id);
      onClose();
    }
  };

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxHeightClass="h-[calc(100vh-40px)] max-h-[92vh]"
    >
      <div className="space-y-4 pb-6">
        {/* 1. Header Banner with Subject Color Accent & Large Emoji */}
        <div
          className="p-5 rounded-[26px] relative overflow-hidden flex items-center justify-between shadow-md border border-white/[0.08]"
          style={{
            backgroundColor: '#242426',
            borderLeft: `8px solid ${subject.color}`,
          }}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93]">
              Información de la Clase
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">{subject.name}</h2>
            <p className="text-xs font-bold text-[#8E8E93]">
              {recurringDaysText} • {timeRangeText}
            </p>
          </div>

          <div className="w-16 h-16 rounded-[22px] bg-[#2C2C2E] border border-white/10 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {subject.emoji}
          </div>
        </div>

        {/* 2. Key Attributes Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Location / Aula */}
          <div className="p-3.5 rounded-[20px] bg-[#242426] border border-white/[0.08] space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93] flex items-center gap-1">
              <span>📍</span> Ubicación / Salón
            </span>
            <div className="text-sm font-black text-white truncate">
              {subject.shortInfo || 'Sin especificar'}
            </div>
          </div>

          {/* Instructor / Profesor */}
          <div className="p-3.5 rounded-[20px] bg-[#242426] border border-white/[0.08] space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8E93] flex items-center gap-1">
              <span>👨‍🏫</span> Instructor / Docente
            </span>
            <div className="text-sm font-black text-white truncate">
              {subject.instructor || 'Sin especificar'}
            </div>
          </div>
        </div>

        {/* 3. Attendance Shield (Control de Asistencia & Conducción) */}
        {(hasTargetSessions || hasMaxAbsences) && (
          <div className="p-4 rounded-[24px] bg-[#242426] border border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <div>
                  <h4 className="text-xs font-black text-white">Escudo de Asistencias</h4>
                  <p className="text-[10px] font-bold text-[#8E8E93]">
                    Seguimiento de cumplimiento y límites
                  </p>
                </div>
              </div>
              <button
                onClick={() => resetAttendance(subject.id)}
                className="text-[10px] font-bold text-[#8E8E93] hover:text-[#FA114F] fitness-press"
              >
                Reiniciar
              </button>
            </div>

            {/* Target Sessions */}
            {hasTargetSessions && (
              <div className="space-y-2 pt-1 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white">
                    Clases Completadas: {attended} de {targetSessions}
                  </span>
                  <span className="font-black text-[#A1F524]">{targetPercent}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#2C2C2E] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#A1F524] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#A1F524]"
                    style={{ width: `${targetPercent}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => logAttendance(subject.id, true)}
                    className="flex-1 py-2 rounded-xl bg-[#A1F524] text-black text-xs font-black fitness-press shadow-md"
                  >
                    + Registrar Asistencia Hoy
                  </button>
                </div>
              </div>
            )}

            {/* University Max Absences Limit */}
            {hasMaxAbsences && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white">
                    Inasistencias: {absences} de {maxAbsences} permitidas
                  </span>
                  <span
                    className={`font-black text-xs ${
                      absencesRemaining <= 1 ? 'text-[#FA114F]' : 'text-[#FFD60A]'
                    }`}
                  >
                    {absencesRemaining > 0
                      ? `Te queda(n) ${absencesRemaining} falta(s)`
                      : '¡Límite superado!'}
                  </span>
                </div>

                <button
                  onClick={() => logAttendance(subject.id, false)}
                  className="w-full py-2 rounded-xl bg-[#2C2C2E] border border-white/5 text-[#FA114F] text-xs font-black fitness-press"
                >
                  + Registrar Falta / Inasistencia
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Linked Tasks / Pendientes for this Subject */}
        <div className="p-4 rounded-[24px] bg-[#242426] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <h4 className="text-xs font-black text-white">
                Pendientes de esta Materia ({pendingSubjectTasks.length})
              </h4>
            </div>

            <button
              onClick={() => onAddTaskForSubject(subject.id)}
              className="px-3 py-1 rounded-full bg-[#A1F524] text-black text-[11px] font-black fitness-press shadow-sm"
            >
              + Añadir Tarea
            </button>
          </div>

          <div className="space-y-1.5">
            {subjectTasks.length === 0 ? (
              <p className="text-xs text-[#8E8E93] py-2 text-center">
                No tienes tareas asignadas a esta materia.
              </p>
            ) : (
              subjectTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className="p-2.5 rounded-xl bg-[#2C2C2E] border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/10 transition-colors fitness-press"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-black ${
                        t.completed ? 'bg-[#A1F524] text-black border-[#A1F524]' : 'border-white/20'
                      }`}
                    >
                      {t.completed ? '✓' : ''}
                    </span>
                    <span
                      className={`text-xs font-bold truncate ${
                        t.completed ? 'line-through text-[#8E8E93]' : 'text-white'
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#8E8E93] shrink-0">{t.dueDate}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Live Focus Note taking */}
        <div className="p-4 rounded-[24px] bg-[#242426] border border-white/[0.08] space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#8E8E93] flex items-center gap-1.5">
            <span>✏️</span> Apuntes Rápidos de Clase
          </span>
          <textarea
            rows={2}
            value={currentNote}
            onChange={(e) => setQuickNote(subject.id, e.target.value)}
            placeholder="Apunta ideas clave, temas del parcial o notas del instructor..."
            className="w-full bg-[#2C2C2E] border border-white/10 rounded-[16px] p-3 text-xs text-white font-medium focus:outline-none focus:border-[#A1F524] resize-none"
          />
        </div>

        {/* 6. Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={() => {
              onClose();
              onEditSubject(subject);
            }}
            className="py-3 rounded-full bg-[#2C2C2E] border border-white/5 text-xs font-bold text-white hover:bg-white/10 fitness-press transition-all flex items-center justify-center gap-1.5"
          >
            <span>✏️</span>
            <span>Editar Materia</span>
          </button>

          <button
            onClick={handleDelete}
            className="py-3 rounded-full bg-[#2C2C2E] border border-white/5 text-xs font-bold text-[#FA114F] hover:bg-[#FA114F]/10 fitness-press transition-all flex items-center justify-center gap-1.5"
          >
            <span>🗑️</span>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </BottomModal>
  );
};
