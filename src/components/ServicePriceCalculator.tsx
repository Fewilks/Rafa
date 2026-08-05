import React, { useState } from 'react';
import { useVetContext } from '../context/VetContext';
import {
  Calculator,
  Clock,
  Pill,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const ServicePriceCalculator: React.FC = () => {
  const { settings, medications, calculateSuggestedPrice, updateSettings } = useVetContext();

  // Inputs
  const [doctorTimeMinutes, setDoctorTimeMinutes] = useState<number>(45);
  const [doctorHourlyRate, setDoctorHourlyRate] = useState<number>(
    settings.defaultHourlyRate
  );

  // Consumables list
  const [consumables, setConsumables] = useState<
    { id: string; name: string; cost: number }[]
  >([
    { id: '1', name: 'Seringa + Agulha Descartável', cost: 2.5 },
    { id: '2', name: 'Par de Luvas Cirúrgicas Estéreis', cost: 4.0 },
    { id: '3', name: 'Solução Anti-séptica e Gaze (kit)', cost: 6.0 },
  ]);

  const [newConsumableName, setNewConsumableName] = useState('');
  const [newConsumableCost, setNewConsumableCost] = useState<number>(5.0);

  // Medications used
  const [selectedMeds, setSelectedMeds] = useState<
    { medId: string; qty: number }[]
  >([{ medId: medications[0]?.id || '', qty: 1 }]);

  // Lab costs
  const [labCost, setLabCost] = useState<number>(0);

  // Percentages
  const [overheadPercent, setOverheadPercent] = useState<number>(
    settings.defaultOverheadPercent
  );
  const [targetProfitMarginPercent, setTargetProfitMarginPercent] =
    useState<number>(settings.defaultTargetMarginPercent);

  // Add Consumable
  const handleAddConsumable = () => {
    if (!newConsumableName) return;
    setConsumables((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newConsumableName, cost: newConsumableCost },
    ]);
    setNewConsumableName('');
    setNewConsumableCost(5.0);
  };

  const handleRemoveConsumable = (id: string) => {
    setConsumables((prev) => prev.filter((c) => c.id !== id));
  };

  // Calculate costs
  const totalConsumablesCost = consumables.reduce((acc, c) => acc + c.cost, 0);

  const totalMedsCost = selectedMeds.reduce((acc, item) => {
    const med = medications.find((m) => m.id === item.medId);
    return acc + (med ? med.unitCost * item.qty : 0);
  }, 0);

  const costResult = calculateSuggestedPrice({
    doctorTimeMinutes,
    doctorHourlyRate,
    consumablesCost: totalConsumablesCost,
    medsCost: totalMedsCost,
    labCost,
    overheadPercent,
    targetProfitMarginPercent,
  });

  const doctorLaborCost = (doctorTimeMinutes / 60) * doctorHourlyRate;
  const netProfitAmount =
    costResult.suggestedFinalPrice - costResult.calculatedCostPrice;

  // Save defaults
  const handleSaveDefaultSettings = () => {
    updateSettings({
      ...settings,
      defaultHourlyRate: doctorHourlyRate,
      defaultOverheadPercent: overheadPercent,
      defaultTargetMarginPercent: targetProfitMarginPercent,
    });
    alert('Parâmetros de precificação salvos como padrão do Dr. Rafael Bastazini!');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-6 rounded-2xl shadow-md border border-emerald-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-700/80 px-3 py-1 rounded-full text-emerald-200 border border-emerald-600">
            Módulo Exclusivo de Precificação
          </span>
          <h2 className="text-2xl font-black mt-2 flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-emerald-300" />
            <span>Calculadora de Valor Sugerido para Serviços Atendidos</span>
          </h2>
          <p className="text-xs text-emerald-200 mt-1 max-w-2xl">
            Evite prejuízos em consultas, exames e cirurgias. Calcule a composição exata de custos (tempo do Dr. Rafael, insumos, medicamentos e overhead) e descubra o preço final recomendado.
          </p>
        </div>

        <button
          id="btn-save-default-pricing"
          onClick={handleSaveDefaultSettings}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md shrink-0 transition-all"
        >
          Salvar Parâmetros Padrão
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (7 cols): Cost Composition Parameters */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Doctor Time & Rate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>1. Honorários & Tempo do Médico Veterinário</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tempo Estimado do Atendimento (Minutos): <strong className="text-emerald-700">{doctorTimeMinutes} min</strong>
                </label>
                <input
                  type="range"
                  min="15"
                  max="240"
                  step="15"
                  value={doctorTimeMinutes}
                  onChange={(e) => setDoctorTimeMinutes(parseInt(e.target.value) || 15)}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>15 min</span>
                  <span>60 min (1h)</span>
                  <span>120 min (2h)</span>
                  <span>240 min (4h)</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Valor / Hora do Doutor (R$/h)
                </label>
                <input
                  type="number"
                  value={doctorHourlyRate}
                  onChange={(e) => setDoctorHourlyRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Custo tempo nesta consulta: <strong>R$ {doctorLaborCost.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 2. Consumables & Surgical Supplies */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>2. Insumos Descartáveis & Materiais Utilizados</span>
            </h3>

            <div className="space-y-2 text-xs">
              {consumables.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80"
                >
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900">R$ {c.cost.toFixed(2)}</span>
                    <button
                      onClick={() => handleRemoveConsumable(c.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Consumable Row */}
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Novo insumo (ex: Agulha, Campo)..."
                  value={newConsumableName}
                  onChange={(e) => setNewConsumableName(e.target.value)}
                  className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Custo R$"
                  value={newConsumableCost}
                  onChange={(e) => setNewConsumableCost(parseFloat(e.target.value) || 0)}
                  className="w-24 p-2 rounded-xl border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddConsumable}
                  className="px-3 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Medications & Lab Fees */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b">
              <Pill className="w-4 h-4 text-emerald-700" />
              <span>3. Medicamentos Administrados & Taxa de Exames</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Medicamentos Aplicados na Consulta
                </label>
                {selectedMeds.map((sm, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mb-2">
                    <select
                      value={sm.medId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedMeds((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, medId: val } : item))
                        );
                      }}
                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs font-medium"
                    >
                      {medications.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} (Custo R$ {m.unitCost.toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={sm.qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setSelectedMeds((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, qty: val } : item))
                        );
                      }}
                      className="w-16 p-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMeds((prev) => [
                      ...prev,
                      { medId: medications[0]?.id || '', qty: 1 },
                    ])
                  }
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  + Adicionar Medicamento
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Exames Laboratoriais / Parceiros (Custo R$)
                </label>
                <input
                  type="number"
                  value={labCost}
                  onChange={(e) => setLabCost(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: Hemograma R$ 60"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* 4. Overhead & Profit Margin Sliders */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>4. Custos Fixos (Overhead) & Margem de Lucro Desejada</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Custo Fixo Rateado (Aluguel/Energia): <strong className="text-emerald-700">{overheadPercent}%</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={overheadPercent}
                  onChange={(e) => setOverheadPercent(parseInt(e.target.value) || 5)}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Margem de Lucro Desejada: <strong className="text-emerald-700">{targetProfitMarginPercent}%</strong>
                </label>
                <input
                  type="range"
                  min="15"
                  max="70"
                  value={targetProfitMarginPercent}
                  onChange={(e) => setTargetProfitMarginPercent(parseInt(e.target.value) || 15)}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (5 cols): Live Suggested Price Output Card */}
        <div className="lg:col-span-5">
          <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800 space-y-6 sticky top-20">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Resultado da Precificação
              </span>
              <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>

            {/* Price Highlight */}
            <div className="p-5 bg-emerald-900/80 rounded-2xl border border-emerald-700/80 text-center space-y-1">
              <span className="text-xs text-emerald-300 font-semibold uppercase">
                Valor Sugerido de Cobrança ao Tutor
              </span>
              <p className="text-4xl font-black text-emerald-300 tracking-tight">
                R$ {costResult.suggestedFinalPrice.toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-200/80">
                Garante margem líquida de {targetProfitMarginPercent}% para a clínica.
              </p>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 text-xs divide-y divide-emerald-800/60 font-medium">
              <div className="flex justify-between py-1.5 text-emerald-100">
                <span>Honorários Dr. Rafael ({doctorTimeMinutes} min):</span>
                <span>R$ {doctorLaborCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1.5 text-emerald-100">
                <span>Insumos Descartáveis:</span>
                <span>R$ {totalConsumablesCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1.5 text-emerald-100">
                <span>Medicamentos Aplicados:</span>
                <span>R$ {totalMedsCost.toFixed(2)}</span>
              </div>

              {labCost > 0 && (
                <div className="flex justify-between py-1.5 text-emerald-100">
                  <span>Exames / Laboratório:</span>
                  <span>R$ {labCost.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 text-emerald-200">
                <span>Custo Fixo / Overhead ({overheadPercent}%):</span>
                <span>R$ {(costResult.calculatedCostPrice - (doctorLaborCost + totalConsumablesCost + totalMedsCost + labCost)).toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 text-rose-300 font-bold border-t border-emerald-700">
                <span>CUSTO TOTAL DO ATENDIMENTO:</span>
                <span>R$ {costResult.calculatedCostPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 text-emerald-300 font-bold">
                <span>LUCRO LÍQUIDO GERADO:</span>
                <span>R$ {netProfitAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-900/50 rounded-xl text-[11px] text-emerald-300/90 leading-relaxed border border-emerald-800">
              💡 <strong>Dica do Dr. Rafael:</strong> Esse valor sugerido pode ser aplicado diretamente no prontuário do paciente na hora do atendimento clínico!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
