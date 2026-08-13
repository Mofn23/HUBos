'use client';

import React, { useState } from 'react';
import { BottomModal } from '../common/BottomModal';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { useSubsStore } from '@/stores/useSubsStore';
import { parseQuickActionWithGemini, parseMealWithGemini, parseSubscriptionWithGemini } from '@/lib/gemini';
import { IconSparkles, IconSend, IconDumbbell, IconCreditCard } from '../common/Icons';

export const HubQuickPromptSheet: React.FC = () => {
  const { isQuickAiPromptOpen, setIsQuickAiPromptOpen, geminiApiKey, showToast, setCurrentApp } = useHubStore();
  const { addMeal } = useRecompStore();
  const { addSubscription } = useSubsStore();

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const samplePrompts = [
    '🥗 Me comí 200g de pechuga de pollo con 1 taza de arroz y aguacate',
    '💳 Suscripción a Netflix Premium por $44.900 al mes el día 20',
    '🍳 Desayuno 3 huevos revueltos con arepa y café con leche',
    '🤖 ChatGPT Plus $85.000 mensual cobro día 18',
  ];

  const handleExecutePrompt = async (textToProcess?: string) => {
    const text = textToProcess || prompt;
    if (!text.trim()) return;

    setIsLoading(true);
    setStatusText('Procesando con Gemini 2.0 Flash...');

    try {
      // First quick classification
      const decision = await parseQuickActionWithGemini(geminiApiKey, text);

      if (decision.targetApp === 'recomp') {
        setStatusText('Analizando macros y calorías con IA...');
        const mealData = await parseMealWithGemini(geminiApiKey, { text });
        const todayStr = new Date().toISOString().split('T')[0];

        addMeal({
          name: mealData.name,
          calories: mealData.calories,
          protein: mealData.protein,
          carbs: mealData.carbs,
          fat: mealData.fat,
          date: todayStr,
          category: (['desayuno', 'almuerzo', 'cena', 'snack'].includes(mealData.mealType)
            ? mealData.mealType
            : 'almuerzo') as any,
          notes: mealData.notes,
          isAiGenerated: true,
        });

        showToast(`🥗 Comida guardada en RecompAI: ${mealData.name} (${mealData.calories} kcal)`);
        setPrompt('');
        setIsQuickAiPromptOpen(false);
        setCurrentApp('recomp');
      } else if (decision.targetApp === 'subs') {
        setStatusText('Estructurando suscripción...');
        const subData = await parseSubscriptionWithGemini(geminiApiKey, text);

        addSubscription({
          name: subData.name,
          emoji: subData.emoji || '💳',
          amount: subData.amount,
          frequency: subData.frequency || 'monthly',
          billingDay: subData.billingDay || 1,
          category: subData.category || 'Servicios',
          provider: subData.provider || subData.name,
          cancelUrl: subData.cancelUrl,
          cancelSteps: subData.cancelSteps,
          notes: subData.notes,
          reminderDays: 3,
          status: 'active',
          tags: ['#ia-prompt'],
        });

        showToast(`💳 Suscripción añadida: ${subData.name} ($${subData.amount.toLocaleString('es-CO')})`);
        setPrompt('');
        setIsQuickAiPromptOpen(false);
        setCurrentApp('subs');
      } else {
        showToast(decision.message || 'Comando procesado.');
        setPrompt('');
        setIsQuickAiPromptOpen(false);
      }
    } catch (err: any) {
      console.error('Quick AI error:', err);
      showToast(err?.message || 'Error al procesar el comando con IA.');
    } finally {
      setIsLoading(false);
      setStatusText(null);
    }
  };

  return (
    <BottomModal
      isOpen={isQuickAiPromptOpen}
      onClose={() => {
        if (!isLoading) setIsQuickAiPromptOpen(false);
      }}
      title="Comando Inteligente HUBos"
      subtitle="Escribe en lenguaje natural lo que deseas registrar"
    >
      <div className="space-y-4 pb-6">
        {/* Input Box */}
        <div className="relative bg-[#242426] rounded-2xl border border-white/10 p-3 focus-within:border-[#34C759] transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Me comí 250g de carne con ensalada / Pagué YouTube Premium $20.900..."
            rows={3}
            disabled={isLoading}
            className="w-full bg-transparent text-sm text-[#F5F5F7] placeholder-[#8E8E93] focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
              <IconSparkles className="w-3.5 h-3.5 text-[#34C759]" />
              <span>Gemini 2.0 Flash</span>
            </div>

            <button
              onClick={() => handleExecutePrompt()}
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-1.5 rounded-full bg-[#34C759] text-black font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 active:scale-95 transition-all shadow-md"
            >
              {isLoading ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <span>Ejecutar</span>
                  <IconSend className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>

        {statusText && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center animate-pulse">
            <p className="text-xs text-[#34C759] font-medium">{statusText}</p>
          </div>
        )}

        {/* Suggested Prompts */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E93] mb-2">
            Ejemplos rápidos
          </p>
          <div className="space-y-2">
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(sample);
                  handleExecutePrompt(sample);
                }}
                disabled={isLoading}
                className="w-full text-left p-3 rounded-xl bg-[#1C1C1E] border border-white/5 hover:border-white/20 text-xs text-[#F5F5F7] transition-all active:scale-[0.98] flex items-center justify-between"
              >
                <span className="truncate pr-2">{sample}</span>
                <IconSparkles className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomModal>
  );
};
