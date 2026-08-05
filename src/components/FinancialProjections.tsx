import React, { useState } from 'react';
import { useVetContext } from '../context/VetContext';
import {
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Filter,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react';
import { TransactionType, TransactionCategory } from '../types';

export const FinancialProjections: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useVetContext();

  const [filterType, setFilterType] = useState<string>('todos');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);

  // New Tx Form State
  const [txForm, setTxForm] = useState({
    type: 'Receita' as TransactionType,
    category: 'Consulta Clinica' as TransactionCategory,
    description: '',
    amount: 150.0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Pix' as 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Boleto',
  });

  const handleSaveTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.description || txForm.amount <= 0) return;

    addTransaction(txForm);
    setTxForm({
      type: 'Receita',
      category: 'Consulta Clinica',
      description: '',
      amount: 150.0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Pix',
    });
    setIsAddTxModalOpen(false);
  };

  // Metrics
  const totalRevenue = transactions
    .filter((t) => t.type === 'Receita')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'Despesa')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMarginPercent =
    totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Filtered list
  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'todos') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>Controle Financeiro & Projeção de Lucro</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe receitas de atendimentos, controle despesas de insumos e projete a lucratividade da clínica do Dr. Rafael Bastazini.
          </p>
        </div>

        <button
          id="btn-open-add-transaction-modal"
          onClick={() => setIsAddTxModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento Financeiro</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Receita Bruta</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Despesas & Insumos</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Lucro Líquido Projetado</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p
            className={`text-2xl font-black mt-2 ${
              netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Margem Líquida Realizada: <span className="text-emerald-700">{profitMarginPercent.toFixed(1)}%</span>
          </p>
        </div>
      </div>

      {/* Visual Revenue vs Expense Ratio Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">Composição Financeira (Receita vs Despesa)</span>
          <span className="text-emerald-700">{profitMarginPercent.toFixed(1)}% Lucro</span>
        </div>

        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{
              width: `${
                totalRevenue > 0
                  ? Math.min(100, (netProfit / totalRevenue) * 100)
                  : 0
              }%`,
            }}
            className="bg-emerald-500 h-full"
            title="Lucro"
          />
          <div
            style={{
              width: `${
                totalRevenue > 0
                  ? Math.min(100, (totalExpenses / totalRevenue) * 100)
                  : 100
              }%`,
            }}
            className="bg-rose-500 h-full"
            title="Despesas"
          />
        </div>

        <div className="flex items-center space-x-6 text-[11px] text-slate-500 font-semibold pt-1">
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>Lucro Líquido</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span>Despesas Operacionais</span>
          </span>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">
            Extrato de Lançamentos
          </h3>

          <div className="flex items-center space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos Lançamentos</option>
              <option value="Receita">Apenas Receitas</option>
              <option value="Despesa">Apenas Despesas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Descrição</th>
                <th className="py-2.5 px-3">Forma PGTO</th>
                <th className="py-2.5 px-3 text-right">Valor</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum lançamento financeiro gravado.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-500">
                      {tx.date.split('-').reverse().join('/')}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          tx.type === 'Receita'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-800 font-bold">
                      {tx.category}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {tx.description}
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {tx.paymentMethod || 'Pix'}
                    </td>

                    <td
                      className={`py-3 px-3 text-right font-black ${
                        tx.type === 'Receita' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'Receita' ? '+' : '-'} R${' '}
                      {tx.amount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Excluir este lançamento financeiro?')) deleteTransaction(tx.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Financial Transaction */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Novo Lançamento Financeiro</h3>
              <button
                onClick={() => setIsAddTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo *</label>
                  <select
                    value={txForm.type}
                    onChange={(e) =>
                      setTxForm({ ...txForm, type: e.target.value as TransactionType })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Receita">Receita (+ Entrou)</option>
                    <option value="Despesa">Despesa (- Saiu)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={txForm.category}
                    onChange={(e) =>
                      setTxForm({
                        ...txForm,
                        category: e.target.value as TransactionCategory,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Consulta Clinica">Consulta Clínica</option>
                    <option value="Cirurgia">Cirurgia</option>
                    <option value="Venda Medicamento">Venda Medicamento</option>
                    <option value="Exame Laboratorial">Exame Laboratorial</option>
                    <option value="Aluguel e Utilidades">Aluguel e Utilidades</option>
                    <option value="Insumos Veterinários">Insumos Veterinários</option>
                    <option value="Equipamentos">Equipamentos</option>
                    <option value="Marketing e Outros">Marketing e Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  placeholder="Ex: Compra de seringas e agulhas estéreis"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txForm.amount}
                    onChange={(e) =>
                      setTxForm({ ...txForm, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Forma de Pagamento</label>
                <select
                  value={txForm.paymentMethod}
                  onChange={(e) =>
                    setTxForm({ ...txForm, paymentMethod: e.target.value as any })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
