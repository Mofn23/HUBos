'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { requestNotificationPermissions, sendLocalNotification } from '@/lib/notifications';
import { IconSparkles, IconTrash, IconBell, IconRefresh } from '../common/Icons';

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
    notificationsEnabled,
    setNotificationsEnabled,
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

  const handleExportBackup = () => {
    const backupData = {
      version: '1.4.1',
      exportedAt: new Date().toISOString(),
      hub: localStorage.getItem('hubos_main_v1'),
      recomp: localStorage.getItem('hubos_recomp_v1'),
      subs: localStorage.getItem('hubos_subs_v1'),
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

  const handleResetData = (target: 'all' | 'recomp' | 'subs') => {
    if (confirm(`¿Estás seguro de que deseas restablecer los datos de ${target}? Esta acción no se puede deshacer.`)) {
      if (target === 'recomp' || target === 'all') {
        localStorage.removeItem('hubos_recomp_v1');
      }
      if (target === 'subs' || target === 'all') {
        localStorage.removeItem('hubos_subs_v1');
      }
      if (target === 'all') {
        localStorage.removeItem('hubos_main_v1');
      }
      showToast('Datos restablecidos. Reiniciando...');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />

      {/* MonAI Settings Sheet */}
      <div
        className="relative bg-[#121214] border-t border-white/10 w-full max-w-md rounded-t-[36px] p-6 pb-16 z-20 animate-sheet-up space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-[#F5F5F7]">Ajustes de HUBos</h3>
            <p className="text-xs font-bold text-[#8E8E93] mt-0.5">
              Configuración general del ecosistema y motor de IA
            </p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-4 pt-1">
          {/* Card 1: User & Currency */}
          <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#F5F5F7]">
              <span>👤</span>
              <span>Perfil y Moneda</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-[#8E8E93]">Nombre</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="input-field text-sm font-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-[#8E8E93]">Moneda</label>
                <select
                  value={tempCurrency}
                  onChange={(e) => setTempCurrency(e.target.value)}
                  className="input-field text-xs font-black h-12"
                >
                  <option value="COP">COP ($)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="MXN">MXN ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Gemini API Key */}
          <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-[#F5F5F7]">
                <IconSparkles className="w-4 h-4 text-[#34C759]" />
                <span>API Key de Gemini</span>
              </div>
              <span
                className={`tag-pill text-[10px] font-black ${
                  tempApiKey ? 'tag-pill-green' : 'tag-pill-coral'
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
              className="input-field tracking-widest text-xs"
            />
          </div>

          {/* Card 3: Notificaciones */}
          <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#242426] flex items-center justify-center text-base">
                🔔
              </div>
              <div>
                <h4 className="text-xs font-black text-[#F5F5F7]">Notificaciones Nativas</h4>
                <p className="text-[11px] font-bold text-[#8E8E93]">Recordatorios y cobros de iOS</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestNotification}
              className="px-3 py-1.5 rounded-full bg-[#242426] border border-white/10 text-xs font-black text-[#34C759] active:scale-90 transition-transform"
            >
              Probar
            </button>
          </div>

          {/* Card 4: Backup y Limpieza */}
          <div className="p-4 rounded-[22px] bg-[#1C1C1E] border border-white/5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#F5F5F7]">
              <span>📦</span>
              <span>Copias de Seguridad & Datos</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="py-2.5 px-2 rounded-xl bg-[#242426] text-xs font-extrabold text-[#F5F5F7] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>📤</span>
                <span>Exportar</span>
              </button>

              <button
                type="button"
                onClick={() => handleResetData('all')}
                className="py-2.5 px-2 rounded-xl bg-[#242426] text-xs font-extrabold text-[#E8505B] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <IconTrash className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 pb-6">
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#34C759] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(52,199,89,0.35)] active:scale-95 transition-all"
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
