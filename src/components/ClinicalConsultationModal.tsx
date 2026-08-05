import React, { useState, useEffect } from 'react';
import { useVetContext } from '../context/VetContext';
import {
  Stethoscope,
  X,
  Plus,
  Trash2,
  Calculator,
  CheckCircle2,
  Pill,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PrescribedMedication } from '../types';

interface ClinicalConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPetId?: string;
}

export const ClinicalConsultationModal: React.FC<ClinicalConsultationModalProps> = ({
  isOpen,
  onClose,
  preSelectedPetId,
}) => {
  const {
    pets,
    clients,
    medications,
    settings,
    addConsultation,
    calculateSuggestedPrice,
    getPetById,
    getClientById,
  } = useVetContext();

  const [selectedPetId, setSelectedPetId] = useState<string>(
    preSelectedPetId || pets[0]?.id || ''
  );

  useEffect(() => {
    if (preSelectedPetId) setSelectedPetId(preSelectedPetId);
  }, [preSelectedPetId]);

  const activePet = getPetById(selectedPetId);
  const activeClient = activePet ? getClientById(activePet.clientId) : null;

  // Consultation Details Form
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [reason, setReason] = useState('Consulta Clínica Geral');

  // SOAP
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');

  // Prescribed & Administered Meds
  const [prescribedMeds, setPrescribedMeds] = useState<PrescribedMedication[]>([]);
  const [selectedMedIdToAdd, setSelectedMedIdToAdd] = useState<string>(
    medications[0]?.id || ''
  );

  // Pricing inputs
  const [doctorTimeMinutes, setDoctorTimeMinutes] = useState<number>(45);
  const [consumablesCost, setConsumablesCost] = useState<number>(18.0);
  const [labCost, setLabCost] = useState<number>(0);
  const [finalChargedPrice, setFinalChargedPrice] = useState<number>(0);

  // Calculated meds cost
  const medsCost = prescribedMeds.reduce(
    (acc, m) => acc + m.unitPriceCost * m.quantity,
    0
  );

  const priceBreakdown = calculateSuggestedPrice({
    doctorTimeMinutes,
    doctorHourlyRate: settings.defaultHourlyRate,
    consumablesCost,
    medsCost,
    labCost,
    overheadPercent: settings.defaultOverheadPercent,
    targetProfitMarginPercent: settings.defaultTargetMarginPercent,
  });

  // Auto set suggested price when parameters change if final charged price wasn't manually edited
  useEffect(() => {
    setFinalChargedPrice(priceBreakdown.suggestedFinalPrice);
  }, [priceBreakdown.suggestedFinalPrice]);

  const handleAddMedication = () => {
    const med = medications.find((m) => m.id === selectedMedIdToAdd);
    if (!med) return;

    let autoDosage = '';
    if (activePet && med.dosageMgPerKg) {
      const mg = (activePet.weightKg * med.dosageMgPerKg).toFixed(1);
      autoDosage = `Dosagem (${activePet.weightKg}kg): ${mg}mg a cada 12h.`;
    } else {
      autoDosage = 'Administrar conforme prescrição.';
    }

    setPrescribedMeds((prev) => [
      ...prev,
      {
        medicationId: med.id,
        medicationName: med.name,
        quantity: 1,
        dosageText: autoDosage,
        unitPriceCost: med.unitCost,
        unitPriceCharged: med.salePrice,
      },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setPrescribedMeds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !activePet) return;

    addConsultation({
      petId: selectedPetId,
      clientId: activePet.clientId,
      date,
      time,
      reason,
      soapSubjective,
      soapObjective,
      soapAssessment,
      soapPlan,
      prescribedMeds,
      costBreakdown: {
        ...priceBreakdown,
        finalChargedPrice,
      },
      status: 'Concluída',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Novo Atendimento Clínico Veterinário
              </h3>
              <p className="text-xs text-slate-500">
                Dr. Rafael Bastazini • Prontuário SOAP e Custo Sugerido
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveConsultation} className="space-y-6 text-xs">
          {/* Patient Selection & Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Paciente *</label>
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500"
              >
                {pets.map((p) => {
                  const tutor = clients.find((c) => c.id === p.clientId);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} - {p.weightKg}kg) • Tutor: {tutor?.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Motivo do Atendimento *</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Dermatite, Check-up, Vacinação..."
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hora</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* SOAP Clinical Records Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 border-b pb-1">
              Prontuário Médico (Estrutura SOAP)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  S - Subjetivo (Histórico relatado pelo tutor)
                </label>
                <textarea
                  rows={3}
                  value={soapSubjective}
                  onChange={(e) => setSoapSubjective(e.target.value)}
                  placeholder="Relato de sintomas, apetite, comportamento do pet..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  O - Objetivo (Exame físico, FC, FR, Temperatura, Ausculta)
                </label>
                <textarea
                  rows={3}
                  value={soapObjective}
                  onChange={(e) => setSoapObjective(e.target.value)}
                  placeholder="Temp: 38.5°C, FC: 100 bpm, Mucosas rosadas..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  A - Avaliação (Hipótese diagnóstica)
                </label>
                <textarea
                  rows={2}
                  value={soapAssessment}
                  onChange={(e) => setSoapAssessment(e.target.value)}
                  placeholder="Diagnóstico provável ou conclusivo..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  P - Plano de Tratamento & Recomendações
                </label>
                <textarea
                  rows={2}
                  value={soapPlan}
                  onChange={(e) => setSoapPlan(e.target.value)}
                  placeholder="Conduta terapêutica, exames solicitados, cuidados..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Prescribed Medications Section */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                <Pill className="w-4 h-4 text-emerald-700" />
                <span>Medicamentos Prescritos / Aplicados no Atendimento</span>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedMedIdToAdd}
                onChange={(e) => setSelectedMedIdToAdd(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              >
                {medications.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.activeIngredient}) - Estoque: {m.stockQuantity}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddMedication}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            {prescribedMeds.length > 0 && (
              <div className="space-y-2 pt-2">
                {prescribedMeds.map((pm, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{pm.medicationName}</p>
                      <p className="text-[11px] text-slate-500">{pm.dosageText}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-emerald-800">
                        Custo: R$ {(pm.unitPriceCost * pm.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(i)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Suggestion Engine Block */}
          <div className="p-5 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-2xl space-y-4 shadow-lg border border-emerald-800">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-emerald-300" />
                <span>Calculadora de Preço Sugerido para este Atendimento</span>
              </span>
              <span className="text-[10px] bg-emerald-800 px-2.5 py-0.5 rounded-full text-emerald-200">
                Margem Padrão {settings.defaultTargetMarginPercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-emerald-200 font-medium mb-1">
                  Tempo Dedicado (Minutos)
                </label>
                <input
                  type="number"
                  value={doctorTimeMinutes}
                  onChange={(e) => setDoctorTimeMinutes(parseInt(e.target.value) || 15)}
                  className="w-full p-2 rounded-xl bg-emerald-900 border border-emerald-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-emerald-200 font-medium mb-1">
                  Insumos Descartáveis (R$)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={consumablesCost}
                  onChange={(e) => setConsumablesCost(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl bg-emerald-900 border border-emerald-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-emerald-200 font-medium mb-1">
                  Exames / Laboratório (R$)
                </label>
                <input
                  type="number"
                  step="1"
                  value={labCost}
                  onChange={(e) => setLabCost(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl bg-emerald-900 border border-emerald-700 text-white font-bold"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-emerald-900/90 rounded-xl border border-emerald-700 gap-4">
              <div>
                <p className="text-[11px] text-emerald-300 uppercase font-bold">
                  Custo Total Calculado do Atendimento:
                </p>
                <p className="text-lg font-black text-rose-300">
                  R$ {priceBreakdown.calculatedCostPrice.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-emerald-300 uppercase font-bold">
                  VALOR SUGERIDO AO TUTOR:
                </p>
                <p className="text-2xl font-black text-emerald-300">
                  R$ {priceBreakdown.suggestedFinalPrice.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-[11px] text-emerald-200 uppercase font-bold mb-1">
                  Valor Efetivamente Cobrado (R$)
                </label>
                <input
                  type="number"
                  step="1"
                  value={finalChargedPrice}
                  onChange={(e) => setFinalChargedPrice(parseFloat(e.target.value) || 0)}
                  className="p-2 rounded-xl bg-emerald-950 border border-emerald-500 font-black text-emerald-300 text-base text-right"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md flex items-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Finalizar & Salvar Atendimento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
