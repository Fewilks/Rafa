import React, { useState } from 'react';
import { useVetContext } from '../context/VetContext';
import { Consultation, Pet, Client } from '../types';
import { Printer, X, FileText, Pill, Copy, Check, Download, ShieldAlert } from 'lucide-react';

export type PrintDocType = 'prescription' | 'consultation_soap' | 'patient_file';

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: PrintDocType;
  consultationId?: string;
  petId?: string;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  onClose,
  docType: initialDocType,
  consultationId,
  petId: initialPetId,
}) => {
  const {
    settings,
    consultations,
    pets,
    clients,
    getConsultationsByPetId,
    getRemindersByPetId,
  } = useVetContext();

  const [docType, setDocType] = useState<PrintDocType>(initialDocType);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  // Resolve consultation if passed
  const consultation: Consultation | undefined = consultationId
    ? consultations.find((c) => c.id === consultationId)
    : undefined;

  // Resolve pet
  const petId = consultation ? consultation.petId : initialPetId;
  const pet: Pet | undefined = pets.find((p) => p.id === petId);

  // Resolve client / tutor
  const clientId = consultation ? consultation.clientId : pet?.clientId;
  const client: Client | undefined = clients.find((c) => c.id === clientId);

  const activeConsultations = pet ? getConsultationsByPetId(pet.id) : [];
  const activeReminders = pet ? getRemindersByPetId(pet.id) : [];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPrescriptionText = () => {
    if (!pet || !client) return;

    let text = `📋 RECEITUÁRIO VETERINÁRIO - ${settings.clinicName.toUpperCase()}\n`;
    text += `Médico Veterinário: ${settings.doctorName} (${settings.crmv})\n`;
    text += `-----------------------------------------------\n`;
    text += `Paciente: ${pet.name} (${pet.species} - ${pet.breed})\n`;
    text += `Tutor: ${client.name} | Tel: ${client.phone}\n`;
    text += `Data: ${consultation ? consultation.date.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR')}\n`;
    text += `-----------------------------------------------\n\n`;

    if (consultation && consultation.prescribedMeds.length > 0) {
      consultation.prescribedMeds.forEach((pm, i) => {
        text += `${i + 1}. ${pm.medicationName}\n`;
        text += `   Uso: ${pm.dosageText}\n\n`;
      });
    } else {
      text += `Nenhum medicamento específico registrado nesta receita.\n\n`;
    }

    if (consultation?.soapPlan) {
      text += `Recomendações Clínicas:\n${consultation.soapPlan}\n\n`;
    }

    text += `-----------------------------------------------\n`;
    text += `${settings.address} - Tel: ${settings.phone}\n`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const formattedDate = consultation
    ? consultation.date.split('-').reverse().join('/')
    : new Date().toLocaleDateString('pt-BR');

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[94vh] border border-slate-200">
        {/* Top Control Header (Hidden on Print) */}
        <div className="p-4 bg-slate-900 text-white rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Impressão & Geração de PDF
              </h3>
              <p className="text-xs text-slate-300">
                Selecione o tipo de documento e clique em Imprimir para salvar em PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Document Switcher */}
            {consultation && (
              <div className="bg-slate-800 p-1 rounded-xl flex items-center space-x-1 text-xs">
                <button
                  onClick={() => setDocType('prescription')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    docType === 'prescription'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Receituário
                </button>
                <button
                  onClick={() => setDocType('consultation_soap')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    docType === 'consultation_soap'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Prontuário SOAP
                </button>
              </div>
            )}

            <button
              onClick={handleCopyPrescriptionText}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-slate-700 flex items-center space-x-1.5 transition-all"
              title="Copiar texto para WhatsApp"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              id="btn-trigger-print-pdf"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md flex items-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet View */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
          <div className="printable-document bg-white text-slate-900 w-full max-w-[720px] p-8 sm:p-12 shadow-lg rounded-xl border border-slate-200 flex flex-col justify-between space-y-8 min-h-[840px] text-xs leading-relaxed">
            
            {/* Clinic Letterhead Header */}
            <div>
              <div className="flex items-start justify-between pb-6 border-b-2 border-emerald-800 gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-emerald-950 tracking-tight uppercase">
                    {settings.clinicName}
                  </h1>
                  <p className="text-sm font-bold text-emerald-800 mt-0.5">
                    {settings.doctorName} <span className="text-slate-600 font-normal">• {settings.crmv}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Medicina Veterinária de Alta Performance & Atendimento Especializado
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-600 space-y-0.5 shrink-0">
                  <p className="font-semibold text-slate-800">{settings.phone}</p>
                  <p>{settings.address}</p>
                  <p className="text-emerald-800 font-medium">{formattedDate}</p>
                </div>
              </div>

              {/* Patient & Tutor Info Box */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Dados do Paciente (Pet)
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{pet?.name || 'Paciente'}</p>
                  <p className="text-[11px] text-slate-600">
                    Espécie: <strong>{pet?.species}</strong> • Raça: <strong>{pet?.breed}</strong>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Sexo: <strong>{pet?.gender}</strong> • Peso: <strong>{pet?.weightKg} kg</strong>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Dados do Tutor Responsável
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{client?.name || 'Tutor'}</p>
                  <p className="text-[11px] text-slate-600">Telefone / WhatsApp: <strong>{client?.phone}</strong></p>
                  <p className="text-[11px] text-slate-600">CPF: <strong>{client?.cpf || 'Não informado'}</strong></p>
                </div>
              </div>
            </div>

            {/* DOCUMENT CONTENT AREA BASED ON DOC TYPE */}
            <div className="flex-1 space-y-6">
              
              {/* 1. RECEITUÁRIO VETERINÁRIO */}
              {docType === 'prescription' && (
                <div className="space-y-6">
                  <div className="text-center py-2 border-b border-dashed border-slate-300">
                    <h2 className="text-base font-extrabold uppercase text-slate-800 tracking-wider">
                      RECEITUÁRIO VETERINÁRIO
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {consultation && consultation.prescribedMeds.length > 0 ? (
                      consultation.prescribedMeds.map((med, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {idx + 1}. {med.medicationName}
                            </span>
                            <span className="font-bold text-slate-600 text-xs">
                              Qtd: {med.quantity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium pt-1">
                            <strong>Posologia / Modo de Uso:</strong> {med.dosageText}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-xl text-slate-500 italic text-center">
                        Nenhum medicamento formulado nesta receita.
                      </div>
                    )}
                  </div>

                  {consultation?.soapPlan && (
                    <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-1">
                      <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider block">
                        Recomendações Médicas & Orientações Gerais
                      </span>
                      <p className="text-xs text-slate-800 whitespace-pre-wrap">
                        {consultation.soapPlan}
                      </p>
                    </div>
                  )}

                  {pet?.allergies && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                      <strong>⚠️ Alertas e Alergias Conhecidas:</strong> {pet.allergies}
                    </div>
                  )}
                </div>
              )}

              {/* 2. PRONTUÁRIO CLÍNICO (SOAP) */}
              {docType === 'consultation_soap' && (
                <div className="space-y-5">
                  <div className="text-center py-2 border-b border-dashed border-slate-300">
                    <h2 className="text-base font-extrabold uppercase text-slate-800 tracking-wider">
                      FICHA DE ATENDIMENTO CLÍNICO - SOAP
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Motivo: <strong>{consultation?.reason || 'Atendimento Clínico Geral'}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block mb-1">
                        S - SUBJETIVO (Anamnese & Histórico)
                      </span>
                      <p className="text-slate-700 whitespace-pre-wrap">
                        {consultation?.soapSubjective || 'Sem alterações relatadas.'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block mb-1">
                        O - OBJETIVO (Exame Físico & Parâmetros)
                      </span>
                      <p className="text-slate-700 whitespace-pre-wrap">
                        {consultation?.soapObjective || 'Parâmetros fisiológicos dentro da normalidade.'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block mb-1">
                        A - AVALIAÇÃO (Hipótese / Diagnóstico)
                      </span>
                      <p className="text-slate-700 whitespace-pre-wrap font-semibold">
                        {consultation?.soapAssessment || 'Diagnóstico em acompanhamento.'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block mb-1">
                        P - PLANO TERAPÊUTICO & TRATAMENTO
                      </span>
                      <p className="text-slate-700 whitespace-pre-wrap">
                        {consultation?.soapPlan || 'Orientado tutor quanto ao protocolo.'}
                      </p>
                    </div>

                    {consultation?.requestedExams && (
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                        <span className="font-bold text-purple-950 text-xs block mb-1">
                          EXAMES SOLICITADOS / NECESSÁRIOS
                        </span>
                        <p className="text-purple-900 whitespace-pre-wrap font-semibold">
                          {consultation.requestedExams}
                        </p>
                      </div>
                    )}
                  </div>

                  {consultation && consultation.costBreakdown && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs font-bold text-emerald-950">
                      <span>Valor Total do Atendimento:</span>
                      <span className="text-sm">R$ {consultation.costBreakdown.finalChargedPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 3. FICHA CADASTRAL DO PACIENTE & HISTÓRICO COMPLETO */}
              {docType === 'patient_file' && (
                <div className="space-y-5">
                  <div className="text-center py-2 border-b border-dashed border-slate-300">
                    <h2 className="text-base font-extrabold uppercase text-slate-800 tracking-wider">
                      FICHA CADASTRAL E HISTÓRICO MÉDICO DO PACIENTE
                    </h2>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Resumo Clínico do Paciente
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <p>Status Vacinal: <strong className="text-emerald-700">{pet?.vaccinationStatus}</strong></p>
                      <p>Microchip: <strong>{pet?.microchip || 'Não cadastrado'}</strong></p>
                      <p>Alergias: <strong>{pet?.allergies || 'Nenhuma registrada'}</strong></p>
                      <p>Total de Atendimentos: <strong>{activeConsultations.length} consultas</strong></p>
                    </div>
                  </div>

                  {/* Consultations Summary */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                      Histórico de Atendimentos Registrados
                    </h3>
                    {activeConsultations.length === 0 ? (
                      <p className="text-slate-400 italic">Nenhum atendimento registrado no sistema.</p>
                    ) : (
                      activeConsultations.map((c) => (
                        <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{c.reason}</span>
                            <span className="text-slate-500 font-normal">{c.date.split('-').reverse().join('/')}</span>
                          </div>
                          {c.soapAssessment && (
                            <p className="text-slate-600 text-[11px]">
                              <strong>Diagnóstico:</strong> {c.soapAssessment}
                            </p>
                          )}
                          {c.requestedExams && (
                            <p className="text-purple-900 text-[11px] font-semibold">
                              <strong>Exames:</strong> {c.requestedExams}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reminders & Vaccines */}
                  <div className="space-y-2 pt-2">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                      Lembretes e Imunizações Programadas
                    </h3>
                    {activeReminders.length === 0 ? (
                      <p className="text-slate-400 italic">Nenhum agendamento pendente.</p>
                    ) : (
                      activeReminders.map((r) => (
                        <div key={r.id} className="flex justify-between p-2 bg-slate-50 rounded border text-[11px]">
                          <span>{r.title} ({r.type})</span>
                          <span className="font-bold text-emerald-800">{r.date.split('-').reverse().join('/')}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Signature & Stamp Line at Bottom of Document */}
            <div className="pt-10 border-t border-slate-300 flex flex-col items-center justify-center text-center space-y-1">
              <div className="w-64 border-b border-slate-800 mb-2"></div>
              <p className="font-extrabold text-slate-900 text-sm">
                {settings.doctorName}
              </p>
              <p className="text-slate-600 text-xs font-semibold">
                Médico Veterinário • {settings.crmv}
              </p>
              <p className="text-slate-400 text-[10px]">
                {settings.clinicName} • Assinatura e Carimbo Profissional
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
