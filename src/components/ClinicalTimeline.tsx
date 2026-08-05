import React, { useState } from 'react';
import { useVetContext } from '../context/VetContext';
import {
  Stethoscope,
  FileText,
  Pill,
  Microscope,
  Calendar,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Plus,
  Activity,
  AlertCircle,
  Syringe,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Consultation, Reminder, Pet } from '../types';

interface ClinicalTimelineProps {
  consultations: Consultation[];
  reminders: Reminder[];
  pet: Pet;
  onPrintConsultationDoc: (consultationId: string) => void;
  onStartConsultationForPet: (petId: string) => void;
}

type TimelineFilter =
  | 'todos'
  | 'consultas'
  | 'diagnosticos'
  | 'tratamentos'
  | 'exames'
  | 'lembretes';

export const ClinicalTimeline: React.FC<ClinicalTimelineProps> = ({
  consultations,
  reminders,
  pet,
  onPrintConsultationDoc,
  onStartConsultationForPet,
}) => {
  const { deleteConsultation } = useVetContext();
  const [filter, setFilter] = useState<TimelineFilter>('todos');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Build combined list of timeline events
  type TimelineEvent = {
    id: string;
    type: 'consultation' | 'reminder';
    date: string; // YYYY-MM-DD
    time: string;
    title: string;
    category: string;
    consultationData?: Consultation;
    reminderData?: Reminder;
  };

  const consultationEvents: TimelineEvent[] = consultations.map((cons) => ({
    id: `cons-${cons.id}`,
    type: 'consultation',
    date: cons.date,
    time: cons.time,
    title: cons.reason,
    category: 'Consulta Clínica',
    consultationData: cons,
  }));

  const reminderEvents: TimelineEvent[] = reminders.map((rem) => ({
    id: `rem-${rem.id}`,
    type: 'reminder',
    date: rem.date,
    time: rem.time,
    title: rem.title,
    category: rem.type === 'Vacinação' ? 'Vacinação' : 'Lembrete / Retorno',
    reminderData: rem,
  }));

  let allEvents = [...consultationEvents, ...reminderEvents];

  // Sort events chronologically
  allEvents.sort((a, b) => {
    const dateTimeA = `${a.date}T${a.time || '00:00'}`;
    const dateTimeB = `${b.date}T${b.time || '00:00'}`;
    if (sortOrder === 'desc') {
      return dateTimeB.localeCompare(dateTimeA);
    } else {
      return dateTimeA.localeCompare(dateTimeB);
    }
  });

  // Filter events
  if (filter === 'consultas') {
    allEvents = allEvents.filter((e) => e.type === 'consultation');
  } else if (filter === 'diagnosticos') {
    allEvents = allEvents.filter(
      (e) => e.consultationData && !!e.consultationData.soapAssessment
    );
  } else if (filter === 'tratamentos') {
    allEvents = allEvents.filter(
      (e) => e.consultationData && e.consultationData.prescribedMeds.length > 0
    );
  } else if (filter === 'exames') {
    allEvents = allEvents.filter(
      (e) => e.consultationData && !!e.consultationData.requestedExams
    );
  } else if (filter === 'lembretes') {
    allEvents = allEvents.filter((e) => e.type === 'reminder');
  }

  return (
    <div className="space-y-4">
      {/* Timeline Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-700" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Linha do Tempo Clínica ({allEvents.length} eventos)
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Filter Pills */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as TimelineFilter)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="todos">Todos os Eventos</option>
            <option value="consultas">Consultas Clínicas</option>
            <option value="diagnosticos">Com Diagnósticos</option>
            <option value="tratamentos">Com Prescrições</option>
            <option value="exames">Exames Solicitados</option>
            <option value="lembretes">Vacinas & Lembretes</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5 transition-colors"
            title="Alternar ordem cronológica"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'desc' ? 'Mais recentes primeiro' : 'Mais antigos primeiro'}</span>
          </button>

          {/* New Consultation CTA */}
          <button
            onClick={() => onStartConsultationForPet(pet.id)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center space-x-1 shadow-sm transition-all ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Atendimento</span>
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      {allEvents.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
          <Clock className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-semibold text-slate-600">
            Nenhum registro clínico encontrado para o filtro selecionado.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {allEvents.map((event) => {
            const isExpanded = expandedItems[event.id] ?? true; // Default expanded for rich preview
            const formattedDate = event.date.split('-').reverse().join('/');

            if (event.type === 'consultation' && event.consultationData) {
              const cons = event.consultationData;

              return (
                <div key={event.id} className="relative group">
                  {/* Node Circle */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-sm flex items-center justify-center text-white z-10">
                    <Stethoscope className="w-3 h-3" />
                  </div>

                  {/* Card Container */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all overflow-hidden">
                    {/* Header bar */}
                    <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Consulta SOAP
                        </span>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {cons.reason}
                        </h5>
                      </div>

                      <div className="flex items-center space-x-3 text-xs">
                        <span className="font-semibold text-slate-500 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate} às {cons.time}</span>
                        </span>

                        <button
                          onClick={() => toggleExpand(event.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                          title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Main Content Body */}
                    <div className="p-4 space-y-3">
                      {/* Diagnosis / Assessment */}
                      {cons.soapAssessment && (
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 space-y-1">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Diagnóstico / Hipótese Diagnóstica</span>
                          </span>
                          <p className="text-xs font-semibold text-amber-950">
                            {cons.soapAssessment}
                          </p>
                        </div>
                      )}

                      {/* Requested Exams Section */}
                      {cons.requestedExams && (
                        <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/70 space-y-1">
                          <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider flex items-center space-x-1">
                            <Microscope className="w-3.5 h-3.5 text-purple-600" />
                            <span>Exames Necessários / Solicitados</span>
                          </span>
                          <p className="text-xs font-semibold text-purple-950 whitespace-pre-wrap">
                            {cons.requestedExams}
                          </p>
                        </div>
                      )}

                      {/* Prescribed Medications */}
                      {cons.prescribedMeds && cons.prescribedMeds.length > 0 && (
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 space-y-2">
                          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center space-x-1">
                            <Pill className="w-3.5 h-3.5 text-blue-600" />
                            <span>Tratamento & Medicamentos Administrados / Prescritos ({cons.prescribedMeds.length})</span>
                          </span>

                          <div className="space-y-1.5">
                            {cons.prescribedMeds.map((med, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2 rounded-lg border border-blue-100 text-xs"
                              >
                                <div className="font-semibold text-slate-800">
                                  <span>{med.medicationName}</span>
                                  <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[9px]">
                                    Qtd: {med.quantity}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {med.dosageText || 'Conforme receita médica'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Collapsible Expanded SOAP Details */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                          {cons.soapSubjective && (
                            <div>
                              <strong className="text-slate-800">Anamnese / Histórico:</strong>{' '}
                              <span>{cons.soapSubjective}</span>
                            </div>
                          )}

                          {cons.soapObjective && (
                            <div>
                              <strong className="text-slate-800">Exame Físico / Sinais Vitais:</strong>{' '}
                              <span>{cons.soapObjective}</span>
                            </div>
                          )}

                          {cons.soapPlan && (
                            <div>
                              <strong className="text-slate-800">Conduta & Plano Terapêutico:</strong>{' '}
                              <span>{cons.soapPlan}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer Actions & Pricing */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <button
                            id={`btn-timeline-print-${cons.id}`}
                            onClick={() => onPrintConsultationDoc(cons.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 font-bold flex items-center space-x-1.5 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Imprimir Receita / Prontuário</span>
                          </button>

                          <button
                            id={`btn-timeline-delete-cons-${cons.id}`}
                            onClick={() => {
                              if (confirm('Deseja realmente excluir este registro de consulta do prontuário?')) {
                                deleteConsultation(cons.id);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-500 font-semibold flex items-center space-x-1 transition-colors"
                            title="Excluir este atendimento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Excluir</span>
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 mr-1.5">Total do Atendimento:</span>
                          <span className="font-black text-slate-900 text-sm">
                            R$ {cons.costBreakdown?.finalChargedPrice ? cons.costBreakdown.finalChargedPrice.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Reminder / Vaccination Event
            if (event.type === 'reminder' && event.reminderData) {
              const rem = event.reminderData;
              const isVaccine = rem.type === 'Vacinação';

              return (
                <div key={event.id} className="relative group">
                  {/* Node Circle */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white z-10 ${
                      isVaccine ? 'bg-purple-600' : 'bg-blue-600'
                    }`}
                  >
                    {isVaccine ? <Syringe className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  </div>

                  {/* Card Container */}
                  <div className="bg-purple-50/50 rounded-2xl border border-purple-200 p-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isVaccine
                              ? 'bg-purple-200/80 text-purple-900'
                              : 'bg-blue-200/80 text-blue-900'
                          }`}
                        >
                          {rem.type}
                        </span>
                        <h5 className="font-bold text-slate-900 text-xs">{rem.title}</h5>
                      </div>
                      {rem.notes && (
                        <p className="text-xs text-slate-600 font-medium">{rem.notes}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center space-x-1 font-bold text-purple-900 text-xs bg-white px-2.5 py-1 rounded-xl border border-purple-200 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>{formattedDate} às {rem.time}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};
