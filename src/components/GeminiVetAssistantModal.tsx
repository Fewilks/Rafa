import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, Loader2 } from 'lucide-react';
import { useVetContext } from '../context/VetContext';

interface GeminiVetAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiVetAssistantModal: React.FC<GeminiVetAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { pets, clients, medications } = useVetContext();

  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'pricing_analysis' | 'clinical_summary' | 'medication_info'>(
    'pricing_analysis'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/gemini/vet-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type,
          patientData: pets.slice(0, 3),
          serviceData: {
            medicationsCount: medications.length,
          },
        }),
      });

      const data = await res.json();
      if (data.error) {
        setAiResponse(`Erro ao consultar assistente: ${data.error}`);
      } else {
        setAiResponse(data.result);
      }
    } catch (err: any) {
      setAiResponse(`Falha na comunicação com o servidor Gemini: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-emerald-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Assistente Virtual do Dr. Rafael Bastazini (Gemini IA)
              </h3>
              <p className="text-xs text-slate-500">
                Apoio inteligente para precificação, dosagens e resumos clínicos.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcut Quick Prompts */}
        <div className="space-y-1.5 text-xs">
          <span className="font-bold text-slate-600">Sugestões de Perguntas:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setType('pricing_analysis');
                setPrompt(
                  'Como devo precificar uma cirurgia de castração felina de 90 minutos usando anestesia inalatória e medicações no pós-operatório?'
                );
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold"
            >
              💡 Dica de Precificação para Cirurgia
            </button>

            <button
              onClick={() => {
                setType('clinical_summary');
                setPrompt(
                  'Elabore uma explicação simples e reconfortante para o tutor sobre o tratamento de otite eritematosa leve em um Golden Retriever.'
                );
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 font-semibold"
            >
              📄 Carta Explicativa para Tutor
            </button>

            <button
              onClick={() => {
                setType('medication_info');
                setPrompt(
                  'Qual é a faixa segura de dosagem de Meloxicam para um cão de 32kg com problema de otite e sem insuficiência renal?'
                );
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-semibold"
            >
              💊 Dúvida de Dosagem de Medicamento
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAskAI} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Sua pergunta para a Inteligência Artificial:
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite aqui o que deseja consultar com a IA do consultório..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-50 flex items-center space-x-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando Gemini...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Pergunta</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Response Output */}
        {aiResponse && (
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold border-b pb-2">
              <Bot className="w-4 h-4" />
              <span>Resposta da IA do Dr. Rafael:</span>
            </div>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
              {aiResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
