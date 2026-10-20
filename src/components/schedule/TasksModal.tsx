'use client';

import React, { useState } from 'react';
import { useScheduleStore, TaskItem } from '@/stores/useScheduleStore';
import { BottomModal } from '../common/BottomModal';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewTask: () => void;
  onEditTask: (task: TaskItem) => void;
}

export const TasksModal: React.FC<TasksModalProps> = ({
  isOpen,
  onClose,
  onAddNewTask,
  onEditTask,
}) => {
  const { tasks, subjects, toggleTask, deleteTask } = useScheduleStore();
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSubject = filterSubjectId === 'all' || t.subjectId === filterSubjectId;
    const matchesTab = activeTab === 'pending' ? !t.completed : t.completed;
    return matchesSubject && matchesTab;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestor de Pendientes & Tareas"
      subtitle="Organiza tus entregas, talleres y compromisos"
      headerAction={
        <button
          onClick={onAddNewTask}
          className="px-3.5 py-1.5 rounded-full bg-[#A1F524] text-black text-xs font-black fitness-press shadow-sm flex items-center gap-1"
        >
          <span>+</span>
          <span>Nueva Tarea</span>
        </button>
      }
      maxHeightClass="h-[calc(100vh-60px)] max-h-[88vh]"
    >
      <div className="space-y-4 pb-6">
        {/* Tabs: Pendientes vs Completadas (Apple Fitness Segmented Control) */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-[#2C2C2E] border border-white/5">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 fitness-press ${
              activeTab === 'pending'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <span>Pendientes</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                pendingCount > 0 ? 'bg-[#FFD60A]/20 text-[#FFD60A]' : 'bg-black/20 text-[#8E8E93]'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 fitness-press ${
              activeTab === 'completed'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <span>Completadas</span>
            <span className="px-2 py-0.5 rounded-full bg-black/20 text-[#8E8E93] text-[10px] font-black">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Subject Filter Chips */}
        {subjects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setFilterSubjectId('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all fitness-press ${
                filterSubjectId === 'all'
                  ? 'bg-white text-black font-black shadow-sm'
                  : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
              }`}
            >
              Todas
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setFilterSubjectId(sub.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 fitness-press ${
                  filterSubjectId === sub.id
                    ? 'bg-[#A1F524] text-black font-black shadow-sm'
                    : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
                }`}
              >
                <span>{sub.emoji}</span>
                <span>{sub.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#242426] flex items-center justify-center text-3xl border border-white/5">
                {activeTab === 'pending' ? '🎉' : '📂'}
              </div>
              <div>
                <h4 className="text-sm font-black text-white">
                  {activeTab === 'pending' ? '¡No tienes tareas pendientes!' : 'Sin tareas archivadas'}
                </h4>
                <p className="text-xs text-[#8E8E93] mt-1 max-w-xs">
                  {activeTab === 'pending'
                    ? 'Todo está al día. Puedes relajarte o programar nuevos compromisos con el botón de arriba.'
                    : 'Las tareas que marques como completadas se guardarán aquí.'}
                </p>
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const linkedSubject = subjects.find((s) => s.id === task.subjectId);

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-[22px] bg-[#242426] border transition-all flex items-start gap-3.5 group ${
                    task.completed
                      ? 'border-white/5 opacity-60'
                      : 'border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  {/* Interactive Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black transition-all shrink-0 mt-0.5 fitness-press ${
                      task.completed
                        ? 'bg-[#A1F524] border-[#A1F524] text-black shadow-[0_0_8px_#A1F524]'
                        : 'border-white/20 hover:border-[#A1F524] bg-[#2C2C2E]'
                    }`}
                  >
                    {task.completed ? '✓' : ''}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-black tracking-tight truncate ${
                          task.completed
                            ? 'line-through text-[#8E8E93]'
                            : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Priority Tag */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                          task.priority === 'high'
                            ? 'bg-[#FA114F]/15 text-[#FA114F]'
                            : task.priority === 'medium'
                            ? 'bg-[#FFD60A]/15 text-[#FFD60A]'
                            : 'bg-[#A1F524]/15 text-[#A1F524]'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* Subject Link & Due Date */}
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E8E93] flex-wrap">
                      {linkedSubject && (
                        <span
                          style={{ color: linkedSubject.color }}
                          className="flex items-center gap-1 font-extrabold"
                        >
                          <span>{linkedSubject.emoji}</span>
                          <span>{linkedSubject.name}</span>
                        </span>
                      )}

                      <span>•</span>
                      <span>Entrega: {task.dueDate || 'Sin fecha'}</span>
                      {task.dueTime && <span>({task.dueTime})</span>}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#8E8E93] pt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons (Edit / Delete) */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTask(task)}
                      className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-xs text-[#8E8E93] hover:text-white fitness-press"
                      title="Editar tarea"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="w-7 h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-xs text-[#8E8E93] hover:text-[#FA114F] fitness-press"
                      title="Eliminar tarea"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </BottomModal>
  );
};
