'use client';

import React, { useState } from 'react';
import { BottomModal } from '../common/BottomModal';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { useSubsStore } from '@/stores/useSubsStore';
import { requestNotificationPermissions, sendLocalNotification } from '@/lib/notifications';
import { IconSparkles, IconCheck, IconBell, IconShield, IconRefresh, IconTrash, IconInfo } from '../common/Icons';

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
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveGeneral = () => {
    setGeminiApiKey(tempApiKey.trim());
    setUserName(tempName.trim());
    setCurrency(tempCurrency.trim().toUpperCase());
    setIsSaved(true);
    showToast('Ajustes guardados correctamente.');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermissions();
    if (granted || true) {
      await sendLocalNotification(
        999,
        '🚀 HUBos: Notificaciones Nativas Activas',
        'Tu sistema de recordatorios para RecompAI y Suscripciones está funcionando al 100% en iOS.'
      );
      showToast('Notificación de prueba enviada.');
    } else {
      showToast('Permiso de notificaciones denegado.');
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0.0',
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
    showToast('Copia de seguridad descargada.');
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
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <BottomModal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      title="Ajustes de HUBos"
      subtitle="Configuración del ecosistema modular y motor de IA"
    >
      <div className="space-y-6 pb-8">
        {/* User & AI Settings Card */}
        <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            <IconSparkles className="w-4 h-4 text-[#34C759]" />
            <span>Perfil & Motor de Inteligencia Artificial</span>
          </div>

          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">Nombre de Usuario</label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full bg-[#242426] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#34C759]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">Moneda Principal</label>
            <input
              type="text"
              value={tempCurrency}
              onChange={(e) => setTempCurrency(e.target.value)}
              placeholder="COP, USD, EUR..."
              className="w-full bg-[#242426] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#34C759]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">Google Gemini API Key</label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="AIzaSy... o clave de Gemini"
              className="w-full bg-[#242426] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F7] font-mono focus:outline-none focus:border-[#34C759]"
            />
            <p className="text-[11px] text-[#8E8E93] mt-1">
              Utilizada para reconocimiento visual de comidas, rutinas de entrenamiento Symmetry y análisis de suscripciones.
            </p>
          </div>

          <button
            onClick={handleSaveGeneral}
            className="w-full py-2.5 rounded-xl bg-[#34C759] text-black font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md"
          >
            {isSaved ? <IconCheck className="w-4 h-4 stroke-[3]" /> : null}
            <span>{isSaved ? '¡Guardado con Éxito!' : 'Guardar Cambios'}</span>
          </button>
        </div>

        {/* Notifications & System Card */}
        <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            <IconBell className="w-4 h-4 text-[#0A84FF]" />
            <span>Notificaciones Nativas iOS</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-[#F5F5F7]">Alertas de Vencimiento</p>
              <p className="text-xs text-[#8E8E93]">Avisa 3 días antes, 1 día antes y el día de cobro</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                notificationsEnabled ? 'bg-[#34C759]' : 'bg-[#2A2A2C]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleTestNotification}
            className="w-full py-2 rounded-xl bg-[#242426] border border-white/10 text-xs font-semibold text-[#F5F5F7] hover:bg-white/5 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <IconBell className="w-3.5 h-3.5 text-[#0A84FF]" />
            <span>Probar Notificación Nativa</span>
          </button>
        </div>

        {/* SideStore / AltStore Super-App Bypass Card */}
        <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            <IconShield className="w-4 h-4 text-[#BF5AF2]" />
            <span>SideStore / AltStore 3-App Bypass</span>
          </div>
          <p className="text-xs text-[#8E8E93] leading-relaxed">
            HUBos consolida múltiples apps completas (Nutrición/Fitness + Finanzas/Suscripciones) en un solo archivo <code className="text-[#F5F5F7] bg-white/10 px-1.5 py-0.5 rounded">HUBos.ipa</code>. Esto te permite tener todo tu ecosistema ocupando <strong>únicamente 1 de los 3 slots</strong> de SideStore en tu iPhone.
          </p>
        </div>

        {/* Data Management & Backups */}
        <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#8E8E93]">
            <IconRefresh className="w-4 h-4 text-[#FF9500]" />
            <span>Copias de Seguridad & Datos</span>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 rounded-xl bg-[#242426] border border-white/10 text-xs font-semibold text-[#F5F5F7] hover:bg-white/5 active:scale-98 transition-all"
          >
            Descargar Respaldo Completo (JSON)
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleResetData('recomp')}
              className="py-2 rounded-xl bg-[#E8505B]/10 border border-[#E8505B]/20 text-[#E8505B] text-xs font-bold active:scale-95 transition-transform"
            >
              Reset RecompAI
            </button>
            <button
              onClick={() => handleResetData('subs')}
              className="py-2 rounded-xl bg-[#E8505B]/10 border border-[#E8505B]/20 text-[#E8505B] text-xs font-bold active:scale-95 transition-transform"
            >
              Reset Suscripciones
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-[#636366]">HUBos Super-App Container v1.0.0 • iOS Native</p>
        </div>
      </div>
    </BottomModal>
  );
};
