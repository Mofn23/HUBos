'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { requestNotificationPermissions, sendLocalNotification } from '@/lib/notifications';
import { nativeStorage, exportAllHubosData } from '@/lib/nativeStorage';
import { IconSparkles, IconTrash, IconX } from '../common/Icons';

export const HubSettingsSheet: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    geminiApiKey,
    setGeminiApiKey,
    userName,
    setUserName,
    currency,
    setCurrency,
    showToast,
  } = useHubStore();

  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);
  const [tempName, setTempName] = useState(userName);
  const [tempCurrency, setTempCurrency] = useState(currency);

  if (!isSettingsOpen) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(tempApiKey.trim());
    setUserName(tempName.trim() || 'Samuel');
    setCurrency(tempCurrency.trim().toUpperCase() || 'COP');
    showToast('✅ Ajustes guardados correctamente.');
    setIsSettingsOpen(false);
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermissions();
    if (granted || true) {
      await sendLocalNotification(
        999,
        '🚀 HUBos: Notificación Nativa Activa',
        'Tu sistema de recordatorios de comidas y suscripciones está operando al 100% en iOS.'
      );
      showToast('🔔 Notificación de prueba enviada.');
    } else {
      showToast('Permiso de notificaciones denegado.');
    }
  };

  const handleExportBackup = async () => {
    const backupData = {
      version: '2.8.0',
      exportedAt: new Date().toISOString(),
      data: await exportAllHubosData(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HUBos_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📦 Copia de seguridad exportada.');
  };

  const handleResetData = async (target: 'all' | 'recomp' | 'subs') => {
    if (confirm(`¿Estás seguro de que deseas restablecer los datos de ${target}? Esta acción no se puede deshacer.`)) {
      if (target === 'recomp' || target === 'all') {
        await nativeStorage.removeItem('hubos_recomp_v1');
      }
      if (target === 'subs' || target === 'all') {
        await nativeStorage.removeItem('hubos_subs_v1');
      }
      if (target === 'all') {
        await nativeStorage.removeItem('hubos_main_v1');
        await nativeStorage.removeItem('hubos_schedule_store_v1');
        await nativeStorage.removeItem('hubos_aesthetix_v1');
      }
      showToast('Datos restablecidos. Reiniciando...');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsSettingsOpen(false)}
      />

      {/* Apple Fitness Settings Sheet */}
      <div
        className="relative w-full max-w-lg bg-[#1C1C1E] border-t border-white/10 rounded-t-[32px] p-6 pb-16 z-20 animate-slide-up space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="pt-1 pb-2 flex justify-center cursor-pointer" onClick={() => setIsSettingsOpen(false)}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Ajustes de HUBos</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Configuración del ecosistema y motor de IA
            </p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-white active:scale-95 transition-all fitness-press"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-4 pt-1">
          {/* Card 1: User & Currency */}
          <div className="p-4 rounded-2xl bg-[#242426] border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span>👤</span>
              <span>Perfil y Moneda</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#8E8E93]">Nombre</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-[#2C2C2E] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold w-full text-white outline-none focus:ring-1 focus:ring-[#A1F524]/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-[#8E8E93]">Moneda</label>
                <select
                  value={tempCurrency}
                  onChange={(e) => setTempCurrency(e.target.value)}
                  className="bg-[#2C2C2E] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold w-full text-white outline-none focus:ring-1 focus:ring-[#A1F524]/50"
                >
                  <option value="COP" className="bg-[#1C1C1E] text-white">COP ($)</option>
                  <option value="USD" className="bg-[#1C1C1E] text-white">USD ($)</option>
                  <option value="EUR" className="bg-[#1C1C1E] text-white">EUR (€)</option>
                  <option value="MXN" className="bg-[#1C1C1E] text-white">MXN ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Gemini API Key */}
          <div className="p-4 rounded-2xl bg-[#242426] border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <IconSparkles className="w-4 h-4 text-[#A1F524]" />
                <span>API Key de Gemini</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  tempApiKey
                    ? 'bg-[#A1F524]/15 text-[#A1F524] border border-[#A1F524]/30'
                    : 'bg-[#FA114F]/15 text-[#FA114F] border border-[#FA114F]/30'
                }`}
              >
                {tempApiKey ? 'Activo' : 'Pendiente'}
              </span>
            </div>

            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="AQ.Ab8..."
              className="bg-[#2C2C2E] border border-white/10 rounded-xl px-3.5 py-2.5 tracking-widest text-xs w-full text-white outline-none focus:ring-1 focus:ring-[#A1F524]/50"
            />
          </div>

          {/* Card 3: Notificaciones */}
          <div className="p-4 rounded-2xl bg-[#242426] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2C2C2E] flex items-center justify-center text-base">
                🔔
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Notificaciones Nativas</h4>
                <p className="text-[11px] text-[#8E8E93]">Recordatorios y cobros de iOS</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestNotification}
              className="px-3.5 py-1.5 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] text-xs font-bold text-[#A1F524] active:scale-95 transition-transform fitness-press"
            >
              Probar
            </button>
          </div>

          {/* Card 4: Backup y Limpieza */}
          <div className="p-4 rounded-2xl bg-[#242426] border border-white/5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span>📦</span>
              <span>Copias de Seguridad & Datos</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="py-2.5 px-3 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all fitness-press"
              >
                <span>📤</span>
                <span>Exportar</span>
              </button>

              <button
                type="button"
                onClick={() => handleResetData('all')}
                className="py-2.5 px-3 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] text-xs font-bold text-[#FA114F] flex items-center justify-center gap-1.5 active:scale-95 transition-all fitness-press"
              >
                <IconTrash className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            </div>
          </div>

          {/* Save Button (Apple Fitness Vibrant Lime Pill) */}
          <div className="pt-2 pb-6">
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#A1F524] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(161,245,36,0.35)] active:scale-[0.98] transition-all fitness-press cursor-pointer"
            >
              <span>✓</span>
              <span>Guardar Ajustes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
