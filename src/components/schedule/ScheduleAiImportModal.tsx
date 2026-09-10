'use client';

import React, { useState } from 'react';
import { useHubStore } from '@/stores/useHubStore';
import { useScheduleStore } from '@/stores/useScheduleStore';
import { BottomModal } from '../common/BottomModal';
import { parseScheduleWithAi, ParsedAiSubject } from '@/lib/scheduleAiParser';

interface ScheduleAiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ScheduleAiImportModal: React.FC<ScheduleAiImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { geminiApiKey } = useHubStore();
  const { addSubject, activeProfileId } = useScheduleStore();

  const [inputText, setInputText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedSubjects, setParsedSubjects] = useState<ParsedAiSubject[] | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !imageBase64) {
      setErrorMsg('Por favor ingresa un texto o sube una imagen de tu horario.');
      return;
    }

    if (!geminiApiKey) {
      setErrorMsg('Configura tu API Key de Gemini en los Ajustes del HUB para usar esta función.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const results = await parseScheduleWithAi(geminiApiKey, {
        text: inputText,
        base64Image: imageBase64 || undefined,
      });

      if (results.length === 0) {
        setErrorMsg('No se detectaron materias. Intenta describir el horario con mayor claridad.');
      } else {
        setParsedSubjects(results);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al conectar con Gemini IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedSubjects) return;

    parsedSubjects.forEach((sub) => {
      const profile = activeProfileId === 'all' ? 'uni' : activeProfileId;
      addSubject({
        profileId: profile,
        name: sub.name,
        shortInfo: sub.shortInfo || '',
        instructor: sub.instructor || '',
        color: sub.color,
        emoji: sub.emoji,
        slots: sub.slots.map((s) => {
          const [h, m] = s.startHour.split(':').map(Number);
          const [endH, endM] = s.endHour.split(':').map(Number);
          const startMins = h * 60 + m;
          const endMins = endH * 60 + endM;
          const duration = Math.max(60, endMins - startMins);

          return {
            id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            subjectId: '',
            dayOfWeek: s.dayOfWeek,
            startHour: s.startHour,
            endHour: s.endHour,
            startMinutes: startMins,
            durationMinutes: duration,
            room: s.room || sub.shortInfo,
          };
        }),
      });
    });

    setParsedSubjects(null);
    setInputText('');
    setImageBase64(null);
    onClose();
  };

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Escanear Horario con Gemini IA ✨"
      subtitle="Sube una foto o pega el texto de tu autoescuela o universidad"
      maxHeightClass="h-[calc(100vh-50px)] max-h-[90vh]"
    >
      <div className="space-y-4 pb-6">
        {/* Step 1: Input stage */}
        {!parsedSubjects ? (
          <div className="space-y-4">
            {/* Image Upload Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
                Foto o Captura de Pantalla
              </label>

              {imageBase64 ? (
                <div className="relative rounded-[22px] overflow-hidden border border-white/10 max-h-48 bg-black flex items-center justify-center">
                  <img src={imageBase64} alt="Horario" className="max-h-48 object-contain" />
                  <button
                    onClick={() => setImageBase64(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-[22px] bg-[#1C1C1E] hover:border-[#34C759]/50 cursor-pointer transition-colors group">
                  <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📷</span>
                  <span className="text-xs font-black text-[#F5F5F7]">
                    Toca para subir foto o captura
                  </span>
                  <span className="text-[10px] text-[#8E8E93] mt-0.5">
                    JPG, PNG o foto de tu horario impreso
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Text Input Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#8E8E93]">
                O Pega el Texto del Horario / WhatsApp
              </label>
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ej: Conducción los martes y jueves de 7 a 9 AM con el profesor Carlos en Pista Norte..."
                className="w-full bg-[#242426] border border-white/10 rounded-[18px] p-3 text-xs text-[#F5F5F7] font-medium focus:outline-none focus:border-[#34C759] resize-none"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FF453A]/15 border border-[#FF453A]/30 text-xs text-[#FF453A] font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Submit Action */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || (!inputText.trim() && !imageBase64)}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#BF5AF2] text-white font-black text-sm shadow-card disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Procesando con Gemini IA...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Analizar y Estructurar Horario</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Step 2: Confirmation stage */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-[#34C759] uppercase tracking-wider">
                ✓ Clases Detectadas ({parsedSubjects.length})
              </h4>
              <button
                onClick={() => setParsedSubjects(null)}
                className="text-xs font-bold text-[#8E8E93] hover:text-white"
              >
                Volver a escanear
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {parsedSubjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[18px] bg-[#1C1C1E] border border-white/10 flex items-center justify-between"
                  style={{ borderLeft: `6px solid ${sub.color}` }}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>{sub.emoji}</span>
                      <h5 className="text-xs font-black text-[#F5F5F7]">{sub.name}</h5>
                    </div>
                    <p className="text-[10px] font-bold text-[#8E8E93] mt-0.5">
                      {sub.slots
                        .map((s) => `${DAY_NAMES[s.dayOfWeek]} (${s.startHour}-${s.endHour})`)
                        .join(', ')}
                    </p>
                    {sub.shortInfo && (
                      <p className="text-[10px] text-[#636366]">📍 {sub.shortInfo}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirmImport}
              className="w-full py-4 rounded-full bg-[#34C759] text-black font-black text-sm shadow-glowGreen active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>Guardar Todo en mi Horario</span>
            </button>
          </div>
        )}
      </div>
    </BottomModal>
  );
};
