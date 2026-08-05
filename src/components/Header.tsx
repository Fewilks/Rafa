import React, { useState } from 'react';
import {
  Stethoscope,
  Users,
  Pill,
  Syringe,
  CalendarCheck,
  Calculator,
  TrendingUp,
  PlusCircle,
  AlertTriangle,
  Bell,
  Database,
  ShieldCheck,
  Settings,
  CloudUpload,
} from 'lucide-react';
import { useVetContext } from '../context/VetContext';
import { BackupModal } from './BackupModal';

export type TabType =
  | 'dashboard'
  | 'clients'
  | 'medications'
  | 'equipment'
  | 'reminders'
  | 'calculator'
  | 'financial';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewConsultation: () => void;
  onOpenGeminiAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewConsultation,
}) => {
  const { settings, medications, equipments, reminders } = useVetContext();
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [modalDefaultTab, setModalDefaultTab] = useState<'backup' | 'settings'>('backup');

  const lowStockMeds = medications.filter(
    (m) => m.stockQuantity <= m.minStockAlert
  ).length;

  const lowStockEq = equipments.filter(
    (e) => e.stockQuantity <= e.minStockAlert
  ).length;

  const lowStockCount = lowStockMeds + lowStockEq;

  const pendingRemindersCount = reminders.filter(
    (r) => r.status === 'Pendente'
  ).length;

  return (
    <header className="bg-white text-slate-800 shadow-sm border-b border-slate-200 sticky top-0 z-30">
      {/* Top Banner with Doctor Branding & Action Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Doctor Info */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {settings.doctorName}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {settings.crmv}
              </span>
            </div>
            <p className="text-sm text-emerald-700 font-medium mt-0.5">
              {settings.clinicName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Alert Badges */}
          {lowStockCount > 0 && (
            <button
              id="btn-low-stock-alert"
              onClick={() => setActiveTab('medications')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100/80 transition-colors"
              title={`${lowStockCount} item(ns) com estoque baixo`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{lowStockCount} Alerta de Estoque</span>
            </button>
          )}

          {pendingRemindersCount > 0 && (
            <button
              id="btn-pending-reminders"
              onClick={() => setActiveTab('reminders')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/80 transition-colors"
              title={`${pendingRemindersCount} lembrete(s) pendente(s)`}
            >
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              <span>{pendingRemindersCount} Lembrete(s)</span>
            </button>
          )}

          {/* Backup & Security (Google Drive + Download JSON) */}
          <button
            id="btn-open-backup-modal"
            onClick={() => {
              setModalDefaultTab('backup');
              setIsBackupModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80 hover:bg-sky-100 transition-colors"
            title="Backup Diário no Google Drive e Download Imediato em JSON"
          >
            <CloudUpload className="w-3.5 h-3.5 text-sky-600" />
            <span>Backup Diário & Drive</span>
          </button>

          {/* Configurações Button */}
          <button
            id="btn-open-settings-modal"
            onClick={() => {
              setModalDefaultTab('settings');
              setIsBackupModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/80 transition-colors"
            title="Configurações do Médico Veterinário e da Clínica"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Configurações</span>
          </button>

          {/* Start New Consultation */}
          <button
            id="btn-new-consultation"
            onClick={onOpenNewConsultation}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Atendimento</span>
          </button>
        </div>
      </div>

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        defaultTab={modalDefaultTab}
      />

      {/* Navigation Tabs */}
      <div className="bg-slate-50/90 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1.5 overflow-x-auto no-scrollbar py-1.5">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Visão Geral</span>
          </button>

          <button
            id="nav-tab-clients"
            onClick={() => setActiveTab('clients')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'clients'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ficha Cadastral (Clientes/Pets)</span>
          </button>

          <button
            id="nav-tab-medications"
            onClick={() => setActiveTab('medications')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'medications'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Medicamentos & Receitas</span>
            {lowStockMeds > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                {lowStockMeds}
              </span>
            )}
          </button>

          <button
            id="nav-tab-equipment"
            onClick={() => setActiveTab('equipment')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'equipment'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Syringe className="w-4 h-4" />
            <span>Equipamentos & Insumos</span>
            {lowStockEq > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                {lowStockEq}
              </span>
            )}
          </button>

          <button
            id="nav-tab-reminders"
            onClick={() => setActiveTab('reminders')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'reminders'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Lembretes & Agenda</span>
            {pendingRemindersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white">
                {pendingRemindersCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-calculator"
            onClick={() => setActiveTab('calculator')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora de Preço Sugerido</span>
          </button>

          <button
            id="nav-tab-financial"
            onClick={() => setActiveTab('financial')}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'financial'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Controle Financeiro & Lucro</span>
          </button>
        </div>
      </div>
    </header>
  );
};
