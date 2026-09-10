'use client';

import React, { useState } from 'react';
import { useScheduleStore } from '@/stores/useScheduleStore';
import { useHubStore } from '@/stores/useHubStore';
import { BottomModal } from '../common/BottomModal';
import { downloadIcsFile } from '@/lib/calendarExport';

interface ScheduleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTIFY_MINUTES_OPTIONS = [15, 30, 45, 60];

export const ScheduleSettingsModal: React.FC<ScheduleSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useHubStore();
  const {
    subjects,
    notifyBeforeMinutes,
    setNotifyBeforeMinutes,
    nightlyAlertEnabled,
    setNightlyAlertEnabled,
    profiles,
    addProfile,
    deleteProfile,
  } = useScheduleStore();

  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileIcon, setNewProfileIcon] = useState('🚗');

  const handleExportIcs = () => {
    if (subjects.length === 0) {
      showToast('No tienes materias registradas para exportar.');
      return;
    }
    downloadIcsFile(subjects);
    showToast('Calendario (.ics) generado con éxito.');
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    addProfile({
      name: newProfileName.trim(),
      icon: newProfileIcon,
      color: '#0A84FF',
    });
    setNewProfileName('');
    showToast(`Perfil "${newProfileName}" creado.`);
  };

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajustes de Horario & Notificaciones"
      subtitle="Personaliza alertas previas, perfiles y exportación nativa"
      maxHeightClass="h-[calc(100vh-50px)] max-h-[88vh]"
    >
      <div className="space-y-4 pb-6">
        {/* 1. Notifications Lead Time */}
        <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-[#F5F5F7]">Anticipación de Alerta de Clase</h4>
              <p className="text-[10px] font-bold text-[#8E8E93]">
                Te avisaremos antes de que comience tu clase
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#34C759]/20 text-[#34C759] text-xs font-black">
              {notifyBeforeMinutes} min
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {NOTIFY_MINUTES_OPTIONS.map((mins) => (
              <button
                key={mins}
                onClick={() => setNotifyBeforeMinutes(mins)}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  notifyBeforeMinutes === mins
                    ? 'bg-[#34C759] text-black shadow-glowGreen'
                    : 'bg-[#242426] text-[#8E8E93] hover:text-white border border-white/5'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        {/* 2. Nightly Task Prep Alert */}
        <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-[#F5F5F7]">Alerta Nocturna de Preparación</h4>
            <p className="text-[10px] font-bold text-[#8E8E93]">
              Resumen a las 8:30 PM con tus clases y tareas de mañana
            </p>
          </div>

          <button
            onClick={() => setNightlyAlertEnabled(!nightlyAlertEnabled)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              nightlyAlertEnabled ? 'bg-[#34C759]' : 'bg-[#2A2A2C]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                nightlyAlertEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* 3. Export to Apple Calendar */}
        <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📲</span>
            <div>
              <h4 className="text-xs font-black text-[#F5F5F7]">Exportar a Calendario iOS (.ics)</h4>
              <p className="text-[10px] font-bold text-[#8E8E93]">
                Sincroniza tus clases con la app de Calendario de tu iPhone/iPad
              </p>
            </div>
          </div>

          <button
            onClick={handleExportIcs}
            className="w-full py-3 rounded-full bg-[#242426] border border-white/10 text-xs font-black text-[#F5F5F7] hover:bg-[#2A2A2C] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>📥</span>
            <span>Descargar Archivo .ics para iOS</span>
          </button>
        </div>

        {/* 4. Schedule Profiles Management */}
        <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 space-y-3">
          <h4 className="text-xs font-black text-[#F5F5F7]">Gestión de Perfiles</h4>

          <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-[#242426] border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs font-black text-[#F5F5F7]">{p.name}</span>
                </div>
                {p.id !== 'all' && (
                  <button
                    onClick={() => deleteProfile(p.id)}
                    className="text-xs text-[#FF453A] hover:opacity-80 px-2"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Profile Form */}
          <form onSubmit={handleCreateProfile} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newProfileIcon}
              onChange={(e) => setNewProfileIcon(e.target.value)}
              className="w-10 bg-[#28282C] border border-white/10 rounded-xl py-2 text-center text-sm"
              title="Emoji del perfil"
            />
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Nuevo perfil (ej. Inglés)"
              className="flex-1 bg-[#28282C] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] font-bold focus:outline-none focus:border-[#34C759]"
            />
            <button
              type="submit"
              disabled={!newProfileName.trim()}
              className="px-4 py-2 rounded-xl bg-[#34C759] disabled:opacity-50 text-black text-xs font-black"
            >
              + Crear
            </button>
          </form>
        </div>
      </div>
    </BottomModal>
  );
};
