'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useRecompStore } from '@/stores/useRecompStore';
import { askCoachWithGemini } from '@/lib/gemini';
import { calculateDailyNutrition } from '@/lib/nutritionEngine';
import { getTodayKey } from '@/lib/date';
import { IconSparkles, IconSend, IconTrash } from '../common/Icons';

export const AICoachModal: React.FC = () => {
  const { geminiApiKey, showToast } = useHubStore();
  const { coachMessages, addCoachMessage, clearCoachChat, meals, targetCalories, targetProtein, targetCarbs, trainingLogs } = useRecompStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const todayKey = getTodayKey();
  const nutrition = calculateDailyNutrition(meals, todayKey, targetCalories, targetCarbs);
  const lastWorkout = trainingLogs[0]?.title;

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    addCoachMessage('user', userText);
    setIsLoading(true);

    try {
      // Build history for Gemini
      const history = coachMessages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }],
      }));

      const reply = await askCoachWithGemini(
        geminiApiKey,
        history,
        userText,
        {
          caloriesConsumed: nutrition.consumedCalories,
          targetCalories,
          proteinConsumed: nutrition.consumedProtein,
          targetProtein,
          lastWorkoutTitle: lastWorkout,
        }
      );

      addCoachMessage('coach', reply);
    } catch (err: any) {
      console.error('Coach AI chat error:', err);
      addCoachMessage(
        'coach',
        'Disculpa, hubo un problema al procesar tu solicitud. Por favor intenta nuevamente.'
      );
      showToast(err?.message || 'Error en el chat de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-210px)] pb-12 animate-fade-in">
      {/* Coach Header */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#34C759] to-[#0A84FF] flex items-center justify-center text-white shadow-md">
            <IconSparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#F5F5F7]">Recomp Coach AI</h3>
            <p className="text-[11px] text-[#34C759] font-semibold">Gemini 2.0 Flash Activo</p>
          </div>
        </div>

        <button
          onClick={clearCoachChat}
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] hover:text-[#E8505B] transition-colors"
          title="Limpiar Conversación"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 no-scrollbar mb-3">
        {coachMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#34C759] text-black font-semibold rounded-br-none shadow-md'
                    : 'bg-[#1C1C1E] text-[#F5F5F7] border border-white/10 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1C1C1E] border border-white/10 text-[#8E8E93] text-xs px-3.5 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-2 animate-pulse">
              <IconSparkles className="w-3.5 h-3.5 text-[#34C759]" />
              <span>El Coach está escribiendo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#1C1C1E] border border-white/10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Pregunta sobre tu dieta, déficit o rutina..."
          disabled={isLoading}
          className="flex-1 bg-transparent text-xs text-[#F5F5F7] px-2 placeholder-[#8E8E93] focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="w-9 h-9 rounded-xl bg-[#34C759] text-black flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shadow"
        >
          <IconSend className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
