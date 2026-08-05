import React, { useState } from 'react';
import { useVetContext } from '../context/VetContext';
import {
  TrendingUp,
  DollarSign,
  Users,
  Pill,
  CalendarCheck,
  Stethoscope,
  ChevronRight,
  AlertTriangle,
  Send,
  PlusCircle,
  Calculator,
  Clock,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { TabType } from './Header';
import { PrintDocumentModal } from './PrintDocumentModal';

interface DashboardOverviewProps {
  setActiveTab: (tab: TabType) => void;
  onOpenNewConsultation: () => void;
  onOpenConsultationDetail: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  setActiveTab,
  onOpenNewConsultation,
  onOpenConsultationDetail,
}) => {
  const {
    clients,
    pets,
    medications,
    consultations,
    reminders,
    transactions,
    getPetById,
    getClientById,
  } = useVetContext();

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printConsultationId, setPrintConsultationId] = useState<string | undefined>(undefined);

  const handlePrintConsultation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPrintConsultationId(id);
    setIsPrintModalOpen(true);
  };

  // Financial calculations
  const totalRevenue = transactions
    .filter((t) => t.type === 'Receita')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'Despesa')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Alerts & Today
  const lowStockMeds = medications.filter(
    (m) => m.stockQuantity <= m.minStockAlert
  );

  const pendingReminders = reminders.filter((r) => r.status === 'Pendente');

  const todayStr = new Date().toISOString().split('T')[0];

  const todayReminders = reminders.filter((r) => r.date === todayStr);

  const recentConsultations = [...consultations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleSendWhatsAppReminder = (r: typeof reminders[0]) => {
    const pet = getPetById(r.petId);
    const client = getClientById(r.clientId);

    if (!client) return;

    const message = `Olá, ${client.name}! Lembrete da Clínica do Dr. Rafael Bastazini: O pet ${
      pet?.name || 'seu pet'
    } possui um agendamento de ${r.type} (${r.title}) marcado para o dia ${
      r.date.split('-').reverse().join('/')
    } às ${r.time}. Qualquer dúvida estamos à disposição!`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-[#f8fafc] space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-lg border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-emerald-700/60">
            Painel do Médico Veterinário
          </span>
          <h2 className="text-2xl font-bold text-white mt-2 tracking-tight">
            Bem-vindo, Dr. Rafael Bastazini
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl font-medium">
            Acompanhe a ficha de pacientes, controle de farmácia, lembretes de consultas e a precificação inteligente dos seus atendimentos clínicos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-quick-new-consultation"
            onClick={onOpenNewConsultation}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-bold text-xs shadow-md shadow-emerald-900/40 transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Atendimento</span>
          </button>
          <button
            id="btn-quick-price-calc"
            onClick={() => setActiveTab('calculator')}
            className="px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 font-semibold text-xs border border-white/15 transition-all flex items-center space-x-2"
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            <span>Calcular Preço</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Receita Total
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
              <span>{transactions.filter((t) => t.type === 'Receita').length} lançamentos efetuados</span>
            </p>
          </div>
        </div>

        {/* Expenses & Costs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Gastos & Custos
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              Despesas operacionais e insumos
            </p>
          </div>
        </div>

        {/* Projected Net Profit */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lucro Líquido
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p
              className={`text-3xl font-bold tracking-tight ${
                netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Margem de Lucro: <strong className="text-emerald-700">{profitMargin.toFixed(1)}%</strong>
            </p>
          </div>
        </div>

        {/* Registered Patients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tutores & Pets
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {pets.length} <span className="text-sm font-semibold text-slate-400">Pets</span>
            </p>
            <p className="text-xs text-indigo-600 font-semibold mt-1">
              {clients.length} tutores cadastrados
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Consultations History & Urgent Reminders / Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Consultations & SOAP Records */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Atendimentos Clínicos Recentes
                </h3>
              </div>
              <button
                id="btn-view-all-clients"
                onClick={() => setActiveTab('clients')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Ver Todos Pacientes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentConsultations.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  Nenhum atendimento registrado recentemente.
                </div>
              ) : (
                recentConsultations.map((cons) => {
                  const pet = getPetById(cons.petId);
                  const client = getClientById(cons.clientId);
                  return (
                    <div
                      key={cons.id}
                      onClick={() => onOpenConsultationDetail(cons.id)}
                      className="py-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {pet?.name || 'Pet'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {pet?.species} ({pet?.breed})
                          </span>
                          <span className="text-xs text-slate-400">
                            • Tutor: {client?.name}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600">
                          <strong>Motivo:</strong> {cons.reason}
                        </p>
                        {cons.soapAssessment && (
                          <p className="text-xs text-slate-500 line-clamp-1 italic">
                            Diagnóstico: {cons.soapAssessment}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center text-right shrink-0 gap-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handlePrintConsultation(e, cons.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Imprimir Receituário / Prontuário PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            R$ {cons.costBreakdown.finalChargedPrice.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {cons.date.split('-').reverse().join('/')} às {cons.time}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Pricing Tool Teaser */}
          <div className="bg-emerald-900 p-5 rounded-2xl shadow-lg border border-emerald-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full inline-block">
                Ferramenta Exclusiva de Gestão
              </span>
              <h4 className="text-base font-bold text-white mt-1">
                Precificação Sugerida por Atendimento
              </h4>
              <p className="text-xs text-emerald-100 font-medium">
                Calcule o valor ideal da consulta ou cirurgia somando o tempo do Dr. Rafael, insumos gastáveis, medicamentos aplicados e margem de lucro desejada.
              </p>
            </div>
            <button
              id="btn-goto-calculator"
              onClick={() => setActiveTab('calculator')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md shrink-0 flex items-center justify-center space-x-2 transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>Abrir Calculadora</span>
            </button>
          </div>
        </div>

        {/* Right Column (1 Col): Reminders & Stock Alerts */}
        <div className="space-y-6">
          {/* Reminders Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Próximos Lembretes
                </h3>
              </div>
              <button
                id="btn-view-all-reminders"
                onClick={() => setActiveTab('reminders')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Ver Agenda
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {pendingReminders.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Nenhum lembrete pendente para hoje.
                </div>
              ) : (
                pendingReminders.slice(0, 4).map((rem) => {
                  const pet = getPetById(rem.petId);
                  const client = getClientById(rem.clientId);
                  const isToday = rem.date === todayStr;

                  return (
                    <div
                      key={rem.id}
                      className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                        isToday
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase ${
                            rem.type === 'Vacinação'
                              ? 'bg-purple-100 text-purple-800'
                              : rem.type === 'Cirurgia'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {rem.type}
                        </span>
                        <span className="text-slate-500 font-semibold text-[11px]">
                          {rem.date.split('-').reverse().join('/')} às {rem.time}
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {pet?.name || 'Pet'} ({pet?.species})
                        </p>
                        <p className="text-slate-600 font-medium">{rem.title}</p>
                        <p className="text-slate-400 text-[11px]">Tutor: {client?.name}</p>
                      </div>

                      <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
                        <button
                          id={`btn-wa-${rem.id}`}
                          onClick={() => handleSendWhatsAppReminder(rem)}
                          className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-bold text-[11px]"
                        >
                          <Send className="w-3 h-3 text-emerald-600" />
                          <span>Notificar WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pharmacy Low Stock Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Estoque de Medicamentos
                </h3>
              </div>
              <button
                id="btn-goto-meds"
                onClick={() => setActiveTab('medications')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Gerenciar
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {lowStockMeds.length === 0 ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Todos os medicamentos estão com estoque regular.</span>
                </div>
              ) : (
                lowStockMeds.map((med) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{med.name}</p>
                      <p className="text-slate-500 text-[11px]">{med.activeIngredient}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                        {med.stockQuantity} {med.unit}(s)
                      </span>
                      <p className="text-[10px] text-amber-700 mt-0.5">
                        Mínimo: {med.minStockAlert}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <PrintDocumentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        docType="prescription"
        consultationId={printConsultationId}
      />
    </div>
  );
};
