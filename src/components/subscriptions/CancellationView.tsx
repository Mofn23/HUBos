'use client';

import React from 'react';
import { useSubsStore } from '@/stores/useSubsStore';
import { IconExternalLink, IconShield } from '../common/Icons';

export const CancellationView: React.FC = () => {
  const { subscriptions } = useSubsStore();

  const activeSubsWithCancel = subscriptions.filter((s) => s.cancelUrl || s.cancelSteps);

  const defaultGuides = [
    {
      name: 'Apple Subscriptions (iOS)',
      url: 'https://appleid.apple.com',
      steps: 'Ajustes en tu iPhone > Toca tu Nombre > Suscripciones > Selecciona y pulsa Cancelar',
    },
    {
      name: 'Google Play & YouTube',
      url: 'https://play.google.com/store/account/subscriptions',
      steps: 'Play Store > Pagos y suscripciones > Suscripciones > Cancelar suscripción',
    },
    {
      name: 'Amazon Prime',
      url: 'https://www.amazon.com/mc/manage',
      steps: 'Mi Cuenta > Membresía Prime > Administrar membresía > Finalizar membresía',
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <div className="bg-[#1C1C1E] border border-white/5 p-4.5 rounded-[24px] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] border border-white/5 text-[#DC2626] flex items-center justify-center shrink-0">
          <IconShield className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <h3 className="font-bold text-[#F5F5F7]">Guías de Cancelación Instantánea</h3>
          <p className="text-[#8E8E93] mt-0.5 text-[11px]">
            Enlaces directos a los portales oficiales para evitar cobros sorpresa.
          </p>
        </div>
      </div>

      {/* User Subscriptions with Direct Cancel Links */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93] px-1">
          Tus Suscripciones Activas ({activeSubsWithCancel.length})
        </h3>

        {activeSubsWithCancel.map((sub) => (
          <div
            key={sub.id}
            className="bg-[#1C1C1E] border border-white/5 p-4.5 rounded-[24px] space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{sub.emoji}</span>
                <span className="text-sm font-bold text-[#F5F5F7]">{sub.name}</span>
              </div>

              {sub.cancelUrl && (
                <a
                  href={sub.cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#2C2C2E] border border-white/5 px-3 py-1 text-[#DC2626] text-xs font-bold flex items-center gap-1 hover:brightness-110 active:scale-95 transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF45] cursor-pointer"
                >
                  <span>Portal Oficial</span>
                  <IconExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {sub.cancelSteps && (
              <p className="text-xs text-[#8E8E93] bg-[#2C2C2E] border border-white/5 p-3">
                <strong className="text-[#F5F5F7]">Pasos: </strong>
                {sub.cancelSteps}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Global Store Guides */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8E8E93] px-1">
          Portales Generales de Tiendas de Apps
        </h3>

        {defaultGuides.map((g, i) => (
          <div key={i} className="bg-[#1C1C1E] border border-white/5 p-4.5 rounded-[24px] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F5F7]">{g.name}</span>
              <a
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2C2C2E] border border-white/5 px-3 py-1 text-xs font-bold text-[#FF375F] flex items-center gap-1 hover:brightness-110 active:scale-95 transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF45] cursor-pointer"
              >
                <span>Abrir</span>
                <IconExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-[#8E8E93] bg-[#2C2C2E] border border-white/5 p-3">
              {g.steps}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
