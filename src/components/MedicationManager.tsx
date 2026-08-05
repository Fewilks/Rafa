import React, { useState } from 'react';
import { useVetContext } from '../context/VetContext';
import {
  Pill,
  Plus,
  AlertTriangle,
  Search,
  FileText,
  Printer,
  X,
  CheckCircle2,
  Trash2,
  Calculator,
  Download,
  Calendar,
  Pencil,
  Clock,
} from 'lucide-react';
import { Medication, MedicationCategory } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const MedicationManager: React.FC = () => {
  const {
    medications,
    pets,
    clients,
    addMedication,
    updateMedication,
    adjustMedicationStock,
    deleteMedication,
    settings,
  } = useVetContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  // Safety Confirmation Delete Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: '',
    name: '',
  });

  // New / Edit Med Form State
  const [medForm, setMedForm] = useState({
    name: '',
    activeIngredient: '',
    category: 'Anti-inflamatório' as MedicationCategory,
    stockQuantity: 20,
    unit: 'comprimido' as 'frasco' | 'comprimido' | 'ampola' | 'caixa' | 'ml' | 'dose',
    minStockAlert: 5,
    unitCost: 5.0,
    salePrice: 12.0,
    dosageMgPerKg: 0.1,
    batchNumber: '',
    expirationDate: '',
  });

  // Prescription Generator State
  const [prescPetId, setPrescPetId] = useState<string>(pets[0]?.id || '');
  const [selectedMedsForPrescription, setSelectedMedsForPrescription] = useState<
    { medId: string; dosageInstructions: string; qty: number }[]
  >([]);

  const handleOpenAddModal = () => {
    setEditingMedId(null);
    setMedForm({
      name: '',
      activeIngredient: '',
      category: 'Anti-inflamatório',
      stockQuantity: 20,
      unit: 'comprimido',
      minStockAlert: 5,
      unitCost: 5.0,
      salePrice: 12.0,
      dosageMgPerKg: 0.1,
      batchNumber: '',
      expirationDate: '',
    });
    setIsAddMedModalOpen(true);
  };

  const handleOpenEditModal = (med: Medication) => {
    setEditingMedId(med.id);
    setMedForm({
      name: med.name,
      activeIngredient: med.activeIngredient,
      category: med.category,
      stockQuantity: med.stockQuantity,
      unit: med.unit,
      minStockAlert: med.minStockAlert,
      unitCost: med.unitCost,
      salePrice: med.salePrice,
      dosageMgPerKg: med.dosageMgPerKg || 0,
      batchNumber: med.batchNumber || '',
      expirationDate: med.expirationDate || '',
    });
    setIsAddMedModalOpen(true);
  };

  // Filtered meds
  const filteredMeds = medications.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat =
      selectedCategory === 'todas' || m.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.name || !medForm.activeIngredient) return;

    if (editingMedId) {
      updateMedication(editingMedId, medForm);
    } else {
      addMedication(medForm);
    }

    setMedForm({
      name: '',
      activeIngredient: '',
      category: 'Anti-inflamatório',
      stockQuantity: 20,
      unit: 'comprimido',
      minStockAlert: 5,
      unitCost: 5.0,
      salePrice: 12.0,
      dosageMgPerKg: 0.1,
      batchNumber: '',
      expirationDate: '',
    });
    setEditingMedId(null);
    setIsAddMedModalOpen(false);
  };

  const handleAddMedToPrescription = (med: Medication) => {
    const targetPet = pets.find((p) => p.id === prescPetId);
    let calculatedDosage = '';

    if (targetPet && med.dosageMgPerKg) {
      const totalMg = (targetPet.weightKg * med.dosageMgPerKg).toFixed(1);
      calculatedDosage = `Dosagem sugerida (${targetPet.weightKg}kg): ${totalMg}mg a cada 12/24h.`;
    } else {
      calculatedDosage = 'Administrar conforme orientação médica.';
    }

    setSelectedMedsForPrescription((prev) => [
      ...prev,
      {
        medId: med.id,
        dosageInstructions: calculatedDosage,
        qty: 1,
      },
    ]);
  };

  const activePrescPet = pets.find((p) => p.id === prescPetId);
  const activePrescClient = activePrescPet
    ? clients.find((c) => c.id === activePrescPet.clientId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Pill className="w-5 h-5 text-emerald-700" />
            <span>Farmácia Veterinaria & Medicamentos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle de estoque, alerta de nível mínimo e emissão rápida de receitas com cálculo de dosagem por peso (mg/kg).
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="btn-open-prescription-generator"
            onClick={() => setIsPrescriptionModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Receita Digital</span>
          </button>
          <button
            id="btn-open-add-med-modal"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Medicamento</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="input-search-medications"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do medicamento ou princípio ativo..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <select
          id="select-category-meds"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
        >
          <option value="todas">Todas Categorias</option>
          <option value="Antibiótico">Antibióticos</option>
          <option value="Anti-inflamatório">Anti-inflamatórios</option>
          <option value="Analgésico">Analgésicos</option>
          <option value="Antiparasitário">Antiparasitários</option>
          <option value="Anestésico">Anestésicos</option>
          <option value="Vacina/Biológico">Vacinas / Biológicos</option>
          <option value="Insumo/Outros">Insumos & Outros</option>
        </select>
      </div>

      {/* Inventory Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Medicamento / Princípio Ativo</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Estoque Atual</th>
                <th className="py-3 px-4">Data de Validade / Lote</th>
                <th className="py-3 px-4">Dosagem</th>
                <th className="py-3 px-4">Custo / Venda</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredMeds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum medicamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredMeds.map((med) => {
                  const isLowStock = med.stockQuantity <= med.minStockAlert;
                  
                  // Check expiration status
                  let expBadge = null;
                  if (med.expirationDate) {
                    const expDate = new Date(med.expirationDate);
                    const today = new Date();
                    const daysUntilExp = Math.ceil(
                      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (daysUntilExp < 0) {
                      expBadge = (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>VENCIDO ({med.expirationDate})</span>
                        </span>
                      );
                    } else if (daysUntilExp <= 60) {
                      expBadge = (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Vence em {daysUntilExp}d ({med.expirationDate})</span>
                        </span>
                      );
                    } else {
                      expBadge = (
                        <span className="text-slate-600 text-[11px] font-semibold">
                          {new Date(med.expirationDate).toLocaleDateString('pt-BR')}
                        </span>
                      );
                    }
                  }

                  return (
                    <tr
                      key={med.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isLowStock ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{med.name}</p>
                        <p className="text-slate-400 text-[11px]">{med.activeIngredient}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {med.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-black px-2.5 py-0.5 rounded-lg text-xs ${
                              isLowStock
                                ? 'bg-amber-200/80 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {med.stockQuantity} {med.unit}(s)
                          </span>
                          {isLowStock && (
                            <span
                              className="text-amber-600 flex items-center"
                              title="Estoque abaixo do mínimo!"
                            >
                              <AlertTriangle className="w-4 h-4 animate-bounce" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        {expBadge || <span className="text-slate-400 text-[11px]">Sem data</span>}
                        {med.batchNumber && (
                          <p className="text-[10px] text-slate-400">
                            Lote: <span className="font-mono text-slate-600">{med.batchNumber}</span>
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {med.dosageMgPerKg ? `${med.dosageMgPerKg} mg/kg` : 'N/D'}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-slate-900 font-bold">
                          R$ {med.salePrice.toFixed(2)}
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          Custo: R$ {med.unitCost.toFixed(2)}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          id={`btn-edit-med-${med.id}`}
                          onClick={() => handleOpenEditModal(med)}
                          className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Editar medicamento"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-stock-minus-${med.id}`}
                          onClick={() => adjustMedicationStock(med.id, -1)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                          title="Remover 1 unidade do estoque"
                        >
                          -
                        </button>
                        <button
                          id={`btn-stock-plus-${med.id}`}
                          onClick={() => adjustMedicationStock(med.id, 1)}
                          className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 font-bold text-emerald-800"
                          title="Adicionar 1 unidade ao estoque"
                        >
                          +
                        </button>
                        <button
                          id={`btn-delete-med-${med.id}`}
                          onClick={() => {
                            setDeleteConfirmState({
                              isOpen: true,
                              id: med.id,
                              name: med.name,
                            });
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          title="Excluir medicamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Medication */}
      {isAddMedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editingMedId ? 'Editar Medicamento' : 'Novo Medicamento no Estoque'}
              </h3>
              <button
                onClick={() => setIsAddMedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMed} className="space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Comercial *</label>
                <input
                  type="text"
                  required
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  placeholder="Ex: Meloxicam 2.0mg"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Princípio Ativo *</label>
                <input
                  type="text"
                  required
                  value={medForm.activeIngredient}
                  onChange={(e) =>
                    setMedForm({ ...medForm, activeIngredient: e.target.value })
                  }
                  placeholder="Ex: Meloxicam"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={medForm.category}
                    onChange={(e) =>
                      setMedForm({
                        ...medForm,
                        category: e.target.value as MedicationCategory,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Anti-inflamatório">Anti-inflamatório</option>
                    <option value="Antibiótico">Antibiótico</option>
                    <option value="Analgésico">Analgésico</option>
                    <option value="Antiparasitário">Antiparasitário</option>
                    <option value="Anestésico">Anestésico</option>
                    <option value="Vacina/Biológico">Vacina/Biológico</option>
                    <option value="Insumo/Outros">Insumo/Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={medForm.unit}
                    onChange={(e) =>
                      setMedForm({ ...medForm, unit: e.target.value as any })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="comprimido">Comprimido</option>
                    <option value="frasco">Frasco</option>
                    <option value="ampola">Ampola</option>
                    <option value="dose">Dose</option>
                    <option value="ml">ml</option>
                    <option value="caixa">Caixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Validade *</label>
                  <input
                    type="date"
                    required
                    value={medForm.expirationDate}
                    onChange={(e) =>
                      setMedForm({ ...medForm, expirationDate: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número do Lote</label>
                  <input
                    type="text"
                    value={medForm.batchNumber}
                    onChange={(e) =>
                      setMedForm({ ...medForm, batchNumber: e.target.value })
                    }
                    placeholder="Ex: L2026-X"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qtd Estoque</label>
                  <input
                    type="number"
                    value={medForm.stockQuantity}
                    onChange={(e) =>
                      setMedForm({ ...medForm, stockQuantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alerta Mínimo</label>
                  <input
                    type="number"
                    value={medForm.minStockAlert}
                    onChange={(e) =>
                      setMedForm({ ...medForm, minStockAlert: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosagem (mg/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={medForm.dosageMgPerKg}
                    onChange={(e) =>
                      setMedForm({ ...medForm, dosageMgPerKg: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={medForm.unitCost}
                    onChange={(e) =>
                      setMedForm({ ...medForm, unitCost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={medForm.salePrice}
                    onChange={(e) =>
                      setMedForm({ ...medForm, salePrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddMedModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  {editingMedId ? 'Salvar Alterações' : 'Salvar no Estoque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Prescription Generator */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-700" />
                <h3 className="text-lg font-bold text-slate-800">
                  Gerador de Receita Veterinária Digital
                </h3>
              </div>
              <button
                onClick={() => setIsPrescriptionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select Patient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Selecione o Paciente *</label>
                <select
                  value={prescPetId}
                  onChange={(e) => setPrescPetId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-purple-500"
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

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <p className="font-bold text-purple-900">
                  Paciente: {activePrescPet?.name} ({activePrescPet?.weightKg} kg)
                </p>
                <p className="text-purple-700 text-[11px]">
                  Tutor: {activePrescClient?.name} • {activePrescClient?.phone}
                </p>
              </div>
            </div>

            {/* Select Meds to Add */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">
                Adicionar Medicamento do Estoque à Receita:
              </label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border">
                {medications.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleAddMedToPrescription(med)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-400 font-semibold text-slate-800 shadow-2xs hover:bg-purple-50 transition-all text-left"
                  >
                    + {med.name} ({med.activeIngredient})
                  </button>
                ))}
              </div>
            </div>

            {/* Prescription Preview Sheet */}
            <div id="printable-prescription" className="p-6 bg-slate-50 rounded-2xl border border-slate-300 space-y-4">
              <div className="text-center border-b border-slate-300 pb-3">
                <h4 className="text-base font-black text-slate-900 uppercase tracking-wide">
                  {settings.doctorName} - {settings.crmv}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">{settings.clinicName}</p>
                <p className="text-[10px] text-slate-400">{settings.address} • Tel: {settings.phone}</p>
              </div>

              <div className="text-xs space-y-1 font-semibold text-slate-700">
                <p>
                  <strong>PACIENTE:</strong> {activePrescPet?.name} ({activePrescPet?.species},{' '}
                  {activePrescPet?.breed}, {activePrescPet?.weightKg}kg)
                </p>
                <p>
                  <strong>TUTOR:</strong> {activePrescClient?.name}
                </p>
                <p>
                  <strong>DATA:</strong> {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                  PRESCRIÇÃO MÉDICA VETERINÁRIA
                </p>

                {selectedMedsForPrescription.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum medicamento adicionado ainda. Clique nos medicamentos acima para adicionar.
                  </p>
                ) : (
                  selectedMedsForPrescription.map((item, idx) => {
                    const med = medications.find((m) => m.id === item.medId);
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>
                            {idx + 1}. {med?.name} ({med?.activeIngredient})
                          </span>
                          <button
                            onClick={() =>
                              setSelectedMedsForPrescription((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.dosageInstructions}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedMedsForPrescription((prev) =>
                              prev.map((p, i) =>
                                i === idx ? { ...p, dosageInstructions: val } : p
                              )
                            );
                          }}
                          placeholder="Instruções de uso..."
                          className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none"
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-6 text-center text-[10px] text-slate-400 border-t border-slate-300">
                _______________________________________________________<br />
                Assinatura & Carimbo do Médico Veterinário
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPrescriptionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Receita</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Safety Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmState.isOpen}
        title="Excluir Medicamento do Estoque"
        itemName={deleteConfirmState.name}
        description="Tem certeza de que deseja remover este medicamento da farmácia? O registro será excluído do controle de estoque."
        onConfirm={() => {
          deleteMedication(deleteConfirmState.id);
          setDeleteConfirmState({ isOpen: false, id: '', name: '' });
        }}
        onCancel={() => setDeleteConfirmState({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
