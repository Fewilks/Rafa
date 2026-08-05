import React, { useState } from 'react';
import { useVetContext } from '../context/VetContext';
import {
  Syringe,
  Plus,
  AlertTriangle,
  Search,
  Pencil,
  Trash2,
  X,
  Package,
  Clock,
  Building2,
  DollarSign,
  Boxes,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { EquipmentItem, EquipmentCategory } from '../types';

export const EquipmentManager: React.FC = () => {
  const {
    equipments,
    addEquipment,
    updateEquipment,
    adjustEquipmentStock,
    deleteEquipment,
  } = useVetContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedUsageFilter, setSelectedUsageFilter] = useState<'todas' | 'reutilizavel' | 'descartavel'>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Material Descartável' as EquipmentCategory,
    stockQuantity: 50,
    unit: 'unidade' as 'unidade' | 'caixa' | 'pacote' | 'rolo' | 'par' | 'ampola' | 'frasco',
    minStockAlert: 10,
    unitCost: 1.5,
    salePrice: 0.0,
    isReusable: false,
    supplier: '',
    notes: '',
    batchNumber: '',
    expirationDate: '',
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      category: 'Material Descartável',
      stockQuantity: 50,
      unit: 'unidade',
      minStockAlert: 10,
      unitCost: 1.5,
      salePrice: 0.0,
      isReusable: false,
      supplier: '',
      notes: '',
      batchNumber: '',
      expirationDate: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EquipmentItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      stockQuantity: item.stockQuantity,
      unit: item.unit,
      minStockAlert: item.minStockAlert,
      unitCost: item.unitCost,
      salePrice: item.salePrice || 0.0,
      isReusable: !!item.isReusable,
      supplier: item.supplier || '',
      notes: item.notes || '',
      batchNumber: item.batchNumber || '',
      expirationDate: item.expirationDate || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    if (editingId) {
      updateEquipment(editingId, form);
    } else {
      addEquipment(form);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredItems = equipments.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.batchNumber && item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'todas' || item.category === selectedCategory;

    const matchesUsage =
      selectedUsageFilter === 'todas' ||
      (selectedUsageFilter === 'reutilizavel' && item.isReusable) ||
      (selectedUsageFilter === 'descartavel' && !item.isReusable);

    return matchesSearch && matchesCategory && matchesUsage;
  });

  // Calculate statistics
  const totalItemsCount = equipments.length;
  const reusableCount = equipments.filter((e) => e.isReusable).length;
  const disposableCount = equipments.filter((e) => !e.isReusable).length;
  const lowStockCount = equipments.filter((e) => e.stockQuantity <= e.minStockAlert).length;
  const totalValuation = equipments.reduce((acc, item) => acc + item.stockQuantity * item.unitCost, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Syringe className="w-5 h-5 text-emerald-700" />
            <span>Gestão de Insumos, Materiais & Equipamentos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro completo de materiais descartáveis e reutilizáveis, controle rigoroso de estoque, custos, lotes e fornecedores.
          </p>
        </div>

        <button
          id="btn-add-equipment"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm flex items-center justify-center space-x-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Insumo / Equipamento</span>
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Insumos Cadastrados</p>
            <p className="text-lg font-black text-slate-900">{totalItemsCount} itens</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Tipo de Uso</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              <span className="text-teal-700">{reusableCount} Reutilizáveis</span> •{' '}
              <span className="text-slate-600">{disposableCount} Descartáveis</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Alertas de Reposição</p>
            <p className="text-lg font-black text-amber-900">{lowStockCount} itens críticos</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Valor em Insumos (Estoque)</p>
            <p className="text-lg font-black text-slate-900">
              R$ {totalValuation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="input-search-equipment"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, lote, garrote, seringa, cateter, fornecedor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Usage Type Filter */}
          <select
            id="select-usage-filter"
            value={selectedUsageFilter}
            onChange={(e) => setSelectedUsageFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todas">Todos os Tipos de Uso</option>
            <option value="reutilizavel">Somente Reutilizáveis</option>
            <option value="descartavel">Somente Descartáveis</option>
          </select>

          {/* Category Filter */}
          <select
            id="select-category-equipment"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todas">Todas as Categorias</option>
            <option value="Material Descartável">Material Descartável</option>
            <option value="Insumo Cirúrgico">Insumo Cirúrgico</option>
            <option value="Proteção e Higiene">Proteção e Higiene</option>
            <option value="Equipamento Clínico">Equipamento Clínico</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Insumo / Material</th>
                <th className="py-3 px-4">Tipo de Uso</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Estoque Atual</th>
                <th className="py-3 px-4">Validade / Lote</th>
                <th className="py-3 px-4">Custo / Venda</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum insumo ou material encontrado.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock = item.stockQuantity <= item.minStockAlert;

                  let expBadge = null;
                  if (item.expirationDate) {
                    const expDate = new Date(item.expirationDate);
                    const today = new Date();
                    const daysUntilExp = Math.ceil(
                      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (daysUntilExp < 0) {
                      expBadge = (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>VENCIDO ({item.expirationDate})</span>
                        </span>
                      );
                    } else if (daysUntilExp <= 60) {
                      expBadge = (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Vence em {daysUntilExp}d</span>
                        </span>
                      );
                    } else {
                      expBadge = (
                        <span className="text-slate-600 text-[11px] font-semibold">
                          {new Date(item.expirationDate).toLocaleDateString('pt-BR')}
                        </span>
                      );
                    }
                  }

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isLowStock ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                        {item.supplier && (
                          <p className="text-slate-400 text-[11px] flex items-center space-x-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{item.supplier}</span>
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-slate-500 text-[10px] italic mt-0.5">
                            {item.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {item.isReusable ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[10px]">
                            <RotateCcw className="w-3 h-3 text-teal-600" />
                            <span>Reutilizável</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px]">
                            <Sparkles className="w-3 h-3 text-slate-500" />
                            <span>Descartável</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {item.category}
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
                            {item.stockQuantity} {item.unit}(s)
                          </span>
                          {isLowStock && (
                            <span
                              className="text-amber-600 flex items-center"
                              title="Estoque abaixo do alerta mínimo!"
                            >
                              <AlertTriangle className="w-4 h-4 animate-bounce" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        {expBadge || <span className="text-slate-400 text-[11px]">Sem data</span>}
                        {item.batchNumber && (
                          <p className="text-[10px] text-slate-400">
                            Lote: <span className="font-mono text-slate-600">{item.batchNumber}</span>
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">
                          R$ {item.unitCost.toFixed(2)}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">(Custo)</span>
                        </p>
                        {item.salePrice ? (
                          <p className="text-emerald-700 font-bold text-[11px]">
                            R$ {item.salePrice.toFixed(2)}{' '}
                            <span className="text-[9px] text-emerald-600 font-normal">(Repasse)</span>
                          </p>
                        ) : null}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          id={`btn-edit-eq-${item.id}`}
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Editar insumo/material"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-eq-minus-${item.id}`}
                          onClick={() => adjustEquipmentStock(item.id, -1)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                          title="Remover 1 do estoque"
                        >
                          -
                        </button>
                        <button
                          id={`btn-eq-plus-${item.id}`}
                          onClick={() => adjustEquipmentStock(item.id, 1)}
                          className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 font-bold text-emerald-800"
                          title="Adicionar 1 ao estoque"
                        >
                          +
                        </button>
                        <button
                          id={`btn-delete-eq-${item.id}`}
                          onClick={() => {
                            if (confirm(`Excluir ${item.name} da lista?`)) {
                              deleteEquipment(item.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
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

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Editar Insumo / Equipamento' : 'Novo Insumo / Equipamento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Insumo / Material *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Garrote Sem Látex, Seringa 3ml, Agulha 25x7..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Reusability Selection Radio Box */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tipo de Uso / Durabilidade *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isReusable: false })}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                      !form.isReusable
                        ? 'bg-slate-100 border-slate-400 font-bold text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <p className="text-xs leading-tight">Descartável</p>
                      <p className="text-[10px] text-slate-400 font-normal">Uso único no atendimento</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isReusable: true })}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                      form.isReusable
                        ? 'bg-teal-50 border-teal-500 font-bold text-teal-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs leading-tight">Reutilizável</p>
                      <p className="text-[10px] text-teal-600/80 font-normal">Lavável / Esterilizável</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as EquipmentCategory,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Material Descartável">Material Descartável</option>
                    <option value="Insumo Cirúrgico">Insumo Cirúrgico</option>
                    <option value="Proteção e Higiene">Proteção e Higiene</option>
                    <option value="Equipamento Clínico">Equipamento Clínico</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={form.unit}
                    onChange={(e) =>
                      setForm({ ...form, unit: e.target.value as any })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="unidade">Unidade</option>
                    <option value="caixa">Caixa</option>
                    <option value="pacote">Pacote</option>
                    <option value="rolo">Rolo</option>
                    <option value="par">Par</option>
                    <option value="ampola">Ampola</option>
                    <option value="frasco">Frasco</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qtd em Estoque</label>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) =>
                      setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alerta Mínimo</label>
                  <input
                    type="number"
                    value={form.minStockAlert}
                    onChange={(e) =>
                      setForm({ ...form, minStockAlert: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.unitCost}
                    onChange={(e) =>
                      setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preço de Repasse (opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.salePrice}
                    onChange={(e) =>
                      setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número do Lote</label>
                  <input
                    type="text"
                    value={form.batchNumber}
                    onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                    placeholder="Ex: L2026-B"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Validade (opcional)</label>
                  <input
                    type="date"
                    value={form.expirationDate}
                    onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fornecedor / Distribuidora</label>
                <input
                  type="text"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  placeholder="Ex: MedVet Distribuidora"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações / Especificações</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ex: Luer Lock, estéril, tamanho 22G..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  {editingId ? 'Salvar Alterações' : 'Salvar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

