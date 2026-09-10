import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ScheduleProfile {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ClassSlot {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 1: Lunes, 2: Martes, 3: Miércoles, 4: Jueves, 5: Viernes, 6: Sábado, 7: Domingo
  startHour: string; // "07:00"
  endHour: string; // "09:00"
  startMinutes: number; // e.g., 420 (7 * 60)
  durationMinutes: number; // e.g., 120 (2 hours)
  room?: string;
}

export interface SubjectItem {
  id: string;
  profileId: string;
  name: string;
  shortInfo?: string; // "Aula 304", "Pista Norte - Auto 04"
  instructor?: string;
  color: string; // Hex color tag
  emoji: string;
  notes?: string;
  
  // Attendance Shield (Asistencias & Faltas)
  targetSessions?: number; // e.g., 15 for driving academy
  attendedSessions?: number; // classes completed
  maxAbsences?: number; // e.g., 3 for university
  absencesCount?: number; // absences logged
  
  slots: ClassSlot[];
  createdAt: string;
}

export interface TaskItem {
  id: string;
  subjectId?: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export interface ScheduleState {
  // Profiles
  profiles: ScheduleProfile[];
  activeProfileId: string; // 'all' or specific profileId
  setActiveProfileId: (id: string) => void;
  addProfile: (profile: Omit<ScheduleProfile, 'id'>) => void;
  deleteProfile: (id: string) => void;

  // Subjects & Slots
  subjects: SubjectItem[];
  addSubject: (subject: Omit<SubjectItem, 'id' | 'createdAt'>) => string;
  updateSubject: (id: string, subject: Partial<SubjectItem>) => void;
  deleteSubject: (id: string) => void;

  // Attendance Shield actions
  logAttendance: (subjectId: string, attended: boolean) => void;
  resetAttendance: (subjectId: string) => void;

  // Tasks (Pendientes)
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<TaskItem>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Notification settings
  notifyBeforeMinutes: number; // 30 by default
  setNotifyBeforeMinutes: (min: number) => void;
  nightlyAlertEnabled: boolean;
  setNightlyAlertEnabled: (enabled: boolean) => void;

  // Quick live focus notes
  quickNotes: Record<string, string>; // subjectId -> note text
  setQuickNote: (subjectId: string, note: string) => void;
}

const DEFAULT_PROFILES: ScheduleProfile[] = [
  { id: 'all', name: 'Todos los Horarios', icon: '🗓️', color: '#34C759' },
  { id: 'uni', name: 'Universidad', icon: '🎓', color: '#0A84FF' },
  { id: 'driving', name: 'Conducción', icon: '🚗', color: '#FF9500' },
  { id: 'routine', name: 'Rutinas & Gym', icon: '💪', color: '#BF5AF2' },
];

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      profiles: DEFAULT_PROFILES,
      activeProfileId: 'all',
      setActiveProfileId: (id) => set({ activeProfileId: id }),
      
      addProfile: (profile) =>
        set((state) => ({
          profiles: [...state.profiles, { ...profile, id: `prof_${Date.now()}` }],
        })),

      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? 'all' : state.activeProfileId,
        })),

      // Empty as strictly requested by user (no pre-loaded items)
      subjects: [],

      addSubject: (subData) => {
        const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newSubject: SubjectItem = {
          ...subData,
          id,
          createdAt: new Date().toISOString(),
          attendedSessions: subData.attendedSessions || 0,
          absencesCount: subData.absencesCount || 0,
          slots: subData.slots.map((s) => ({
            ...s,
            id: s.id || `slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            subjectId: id,
          })),
        };

        set((state) => ({ subjects: [...state.subjects, newSubject] }));
        return id;
      },

      updateSubject: (id, updated) =>
        set((state) => ({
          subjects: state.subjects.map((sub) => {
            if (sub.id !== id) return sub;
            const merged = { ...sub, ...updated };
            if (updated.slots) {
              merged.slots = updated.slots.map((s) => ({
                ...s,
                id: s.id || `slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                subjectId: id,
              }));
            }
            return merged;
          }),
        })),

      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((sub) => sub.id !== id),
          tasks: state.tasks.filter((t) => t.subjectId !== id),
        })),

      logAttendance: (subjectId, attended) =>
        set((state) => ({
          subjects: state.subjects.map((sub) => {
            if (sub.id !== subjectId) return sub;
            if (attended) {
              return { ...sub, attendedSessions: (sub.attendedSessions || 0) + 1 };
            } else {
              return { ...sub, absencesCount: (sub.absencesCount || 0) + 1 };
            }
          }),
        })),

      resetAttendance: (subjectId) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, attendedSessions: 0, absencesCount: 0 }
              : sub
          ),
        })),

      // Empty tasks list
      tasks: [],

      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, updated) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      notifyBeforeMinutes: 30,
      setNotifyBeforeMinutes: (min) => set({ notifyBeforeMinutes: min }),
      nightlyAlertEnabled: true,
      setNightlyAlertEnabled: (enabled) => set({ nightlyAlertEnabled: enabled }),

      quickNotes: {},
      setQuickNote: (subjectId, note) =>
        set((state) => ({
          quickNotes: { ...state.quickNotes, [subjectId]: note },
        })),
    }),
    {
      name: 'hubos_schedule_store_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
