import React, { useState } from 'react';
import { VetProvider, useVetContext } from './context/VetContext';
import { Header, TabType } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ClientPetRegistry } from './components/ClientPetRegistry';
import { MedicationManager } from './components/MedicationManager';
import { EquipmentManager } from './components/EquipmentManager';
import { RemindersSystem } from './components/RemindersSystem';
import { ServicePriceCalculator } from './components/ServicePriceCalculator';
import { FinancialProjections } from './components/FinancialProjections';
import { ClinicalConsultationModal } from './components/ClinicalConsultationModal';
import { GeminiVetAssistantModal } from './components/GeminiVetAssistantModal';
import { Heart, Stethoscope } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [consultationPreSelectedPetId, setConsultationPreSelectedPetId] = useState<
    string | undefined
  >(undefined);

  const { settings } = useVetContext();

  const handleStartConsultationForPet = (petId: string) => {
    setConsultationPreSelectedPetId(petId);
    setIsConsultationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewConsultation={() => {
          setConsultationPreSelectedPetId(undefined);
          setIsConsultationModalOpen(true);
        }}
        onOpenGeminiAssistant={() => setIsGeminiModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            setActiveTab={setActiveTab}
            onOpenNewConsultation={() => {
              setConsultationPreSelectedPetId(undefined);
              setIsConsultationModalOpen(true);
            }}
            onOpenConsultationDetail={(id) => {
              setActiveTab('clients');
            }}
          />
        )}

        {activeTab === 'clients' && (
          <ClientPetRegistry
            onStartConsultationForPet={handleStartConsultationForPet}
            onViewConsultationDetail={() => {}}
          />
        )}

        {activeTab === 'medications' && <MedicationManager />}

        {activeTab === 'equipamentos' && <EquipmentManager />}

        {activeTab === 'reminders' && <RemindersSystem />}

        {activeTab === 'calculator' && <ServicePriceCalculator />}

        {activeTab === 'financial' && <FinancialProjections />}
      </main>

      {/* Footer */}
      <footer className="bg-white text-slate-500 border-t border-slate-200 py-4 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-100">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{settings.doctorName} • {settings.crmv}</p>
              <p className="text-[11px] text-emerald-700 font-medium">{settings.clinicName}</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            {settings.address} • Tel: {settings.phone}
          </div>

          <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Sistema Veterinário • Dr. Rafael Bastazini</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ClinicalConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        preSelectedPetId={consultationPreSelectedPetId}
      />

      <GeminiVetAssistantModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <VetProvider>
      <DashboardContent />
    </VetProvider>
  );
}
