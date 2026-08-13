'use client';

import React, { useState } from 'react';
import { useRecompStore, BodyMeasurementEntry } from '@/stores/useRecompStore';
import { useHubStore } from '@/stores/useHubStore';
import { getTodayKey } from '@/lib/date';
import { IconActivity, IconPlus, IconTrendingDown, IconTrash } from '../common/Icons';

export const ProgressSection: React.FC = () => {
  const { measurements, addMeasurement, deleteMeasurement, achievements } = useRecompStore();
  const { showToast } = useHubStore();

  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSaveMeasurement = () => {
    if (!weight) {
      showToast('Por favor introduce tu peso actual.');
      return;
    }

    addMeasurement({
      date: getTodayKey(),
      weightKg: Number(weight),
      bodyFatPercentage: bodyFat ? Number(bodyFat) : undefined,
      waistCm: waist ? Number(waist) : undefined,
      armsCm: arms ? Number(arms) : undefined,
    });

    showToast('Medida física registrada con éxito.');
    setWeight('');
    setBodyFat('');
    setWaist('');
    setArms('');
    setIsAddOpen(false);
  };

  const latest = measurements[0];

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Latest Metrics Hero */}
      <div className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#34C759]">
            Composición Corporal
          </span>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3 py-1 rounded-full bg-[#34C759] text-black font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>Registrar Peso</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 text-center">
            <p className="text-[10px] text-[#8E8E93] font-bold">Peso Actual</p>
            <p className="text-lg font-black text-[#F5F5F7] mt-0.5">
              {latest?.weightKg ? `${latest.weightKg} kg` : '—'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 text-center">
            <p className="text-[10px] text-[#8E8E93] font-bold">% Grasa</p>
            <p className="text-lg font-black text-[#34C759] mt-0.5">
              {latest?.bodyFatPercentage ? `${latest.bodyFatPercentage}%` : '—'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141416] border border-white/5 text-center">
            <p className="text-[10px] text-[#8E8E93] font-bold">Cintura</p>
            <p className="text-lg font-black text-[#0A84FF] mt-0.5">
              {latest?.waistCm ? `${latest.waistCm} cm` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* History Log */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93] px-1">
          Historial de Evolución
        </h3>

        {measurements.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-extrabold text-[#F5F5F7]">{m.weightKg} kg</p>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">
                {m.date} {m.bodyFatPercentage ? `• ${m.bodyFatPercentage}% Grasa` : ''}{' '}
                {m.waistCm ? `• Cintura: ${m.waistCm}cm` : ''}
              </p>
            </div>

            <button
              onClick={() => deleteMeasurement(m.id)}
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] hover:text-[#E8505B] transition-colors"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Achievements Showcase */}
      <div className="p-5 rounded-[28px] bg-[#1C1C1E] border border-white/10 shadow-xl space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
          Logros Desbloqueados
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="p-3 rounded-2xl bg-[#141416] border border-white/5 flex items-center gap-2.5"
            >
              <span className="text-2xl">{ach.icon}</span>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#F5F5F7] truncate">{ach.title}</p>
                <p className="text-[10px] text-[#8E8E93] line-clamp-1">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Measurement Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
            onClick={() => setIsAddOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#18181A] rounded-t-[36px] border-t border-white/10 shadow-2xl p-6 h-auto max-h-[90vh] z-10 space-y-4 animate-slide-up">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />
            <h2 className="text-lg font-black text-[#F5F5F7]">Nueva Medida Corporal</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8E8E93] mb-1 font-bold">Peso (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej: 75.5"
                  className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#34C759]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8E8E93] mb-1 font-bold">% Grasa Corporal</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  placeholder="Ej: 14.0"
                  className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#34C759]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8E8E93] mb-1 font-bold">Cintura (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="Ej: 80"
                  className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#34C759]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8E8E93] mb-1 font-bold">Brazo (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={arms}
                  onChange={(e) => setArms(e.target.value)}
                  placeholder="Ej: 38.5"
                  className="w-full bg-[#242426] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#34C759]"
                />
              </div>
            </div>

            <button
              onClick={handleSaveMeasurement}
              className="w-full py-3 rounded-2xl bg-[#34C759] text-black font-extrabold text-xs active:scale-98 transition-all shadow-lg mt-2"
            >
              Guardar Medición
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
