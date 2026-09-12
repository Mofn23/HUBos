'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useScheduleStore, SubjectItem, TaskItem, ClassSlot } from '@/stores/useScheduleStore';
import { ScheduleHeader } from './ScheduleHeader';
import { ScheduleHeroCards } from './ScheduleHeroCards';
import { ScheduleGrid } from './ScheduleGrid';
import { ScheduleFabMenu } from './ScheduleFabMenu';
import { AddClassModal } from './AddClassModal';
import { AddTaskModal } from './AddTaskModal';
import { TasksModal } from './TasksModal';
import { ClassDetailModal } from './ClassDetailModal';
import { ScheduleAiImportModal } from './ScheduleAiImportModal';
import { ScheduleSettingsModal } from './ScheduleSettingsModal';
import {
  findCurrentOrNextClass,
  scheduleClassNotifications,
  NextClassStatus,
} from '@/lib/scheduleNotifications';

export const ScheduleView: React.FC = () => {
  const {
    subjects,
    tasks,
    activeProfileId,
    notifyBeforeMinutes,
  } = useScheduleStore();

  // Modals state
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false);
  const [isAiImportOpen, setIsAiImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot | undefined>(undefined);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [defaultTaskSubjectId, setDefaultTaskSubjectId] = useState<string | undefined>(undefined);

  // Filter subjects by active profile
  const filteredSubjects = useMemo(() => {
    if (activeProfileId === 'all') return subjects;
    return subjects.filter((s) => s.profileId === activeProfileId);
  }, [subjects, activeProfileId]);

  // Real-time Next/Live Class Status (refreshes every 30s)
  const [nextClassStatus, setNextClassStatus] = useState<NextClassStatus>({ type: 'none' });

  useEffect(() => {
    const updateStatus = () => {
      const status = findCurrentOrNextClass(filteredSubjects);
      setNextClassStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [filteredSubjects]);

  // Trigger notification scheduling on subjects change
  useEffect(() => {
    if (subjects.length > 0) {
      scheduleClassNotifications(subjects, notifyBeforeMinutes);
    }
  }, [subjects, notifyBeforeMinutes]);

  // Handlers
  const handleSelectSubject = (subj: SubjectItem, slot?: ClassSlot) => {
    setSelectedSubject(subj);
    setSelectedSlot(slot);
    setIsClassDetailOpen(true);
  };

  const handleOpenAddClass = () => {
    setEditingSubject(null);
    setIsAddClassOpen(true);
  };

  const handleEditSubject = (subj: SubjectItem) => {
    setEditingSubject(subj);
    setIsAddClassOpen(true);
  };

  const handleOpenAddTask = (subjectId?: string) => {
    setEditingTask(null);
    setDefaultTaskSubjectId(subjectId);
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setIsAddTaskOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full px-4 pt-14 pb-4 overflow-hidden animate-fade-in space-y-3 relative">
      {/* Ambient Radial Glowing Orbs for Frosted Glass Depth */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-[#0A84FF]/10 blur-[90px]" />
        <div className="absolute top-1/2 -left-16 w-80 h-80 rounded-full bg-[#BF5AF2]/10 blur-[100px]" />
        <div className="absolute -bottom-10 right-1/4 w-72 h-72 rounded-full bg-[#34C759]/10 blur-[90px]" />
      </div>

      {/* 1. Header (Date pill, Hub return, Settings, Profiles) */}
      <ScheduleHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAiImport={() => setIsAiImportOpen(true)}
      />

      {/* 2. Hero Cards ("Siguiente Clase" & "PENDIENTES") */}
      <ScheduleHeroCards
        nextClassStatus={nextClassStatus}
        tasks={tasks}
        onOpenTasks={() => setIsTasksModalOpen(true)}
        onSelectSubject={handleSelectSubject}
        onOpenAddClass={handleOpenAddClass}
      />

      {/* 3. Schedule 2D Matrix (Days horizontal + Hours vertical) */}
      <ScheduleGrid
        subjects={filteredSubjects}
        onSelectSubject={handleSelectSubject}
      />

      {/* 4. Bottom-Right FAB (+) with dimmed overlay */}
      <ScheduleFabMenu
        onAddClass={handleOpenAddClass}
        onAddTask={() => handleOpenAddTask()}
        onAiScan={() => setIsAiImportOpen(true)}
      />

      {/* 5. Modals & Sheets */}
      {/* Add / Edit Class */}
      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        editingSubject={editingSubject}
      />

      {/* Add / Edit Task */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        defaultSubjectId={defaultTaskSubjectId}
        editingTask={editingTask}
      />

      {/* Tasks Manager Sheet (Triggered by Pendientes card) */}
      <TasksModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        onAddNewTask={() => handleOpenAddTask()}
        onEditTask={handleEditTask}
      />

      {/* Class Detail Modal (Triggered by tapping a card) */}
      <ClassDetailModal
        isOpen={isClassDetailOpen}
        onClose={() => setIsClassDetailOpen(false)}
        subject={selectedSubject}
        activeSlot={selectedSlot}
        onEditSubject={handleEditSubject}
        onAddTaskForSubject={(subId) => handleOpenAddTask(subId)}
      />

      {/* AI Schedule Scanner Modal */}
      <ScheduleAiImportModal
        isOpen={isAiImportOpen}
        onClose={() => setIsAiImportOpen(false)}
      />

      {/* Schedule & Notification Settings Modal */}
      <ScheduleSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
