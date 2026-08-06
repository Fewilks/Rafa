import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Client,
  Pet,
  Medication,
  EquipmentItem,
  Consultation,
  Reminder,
  FinancialTransaction,
  ClinicSettings,
  CostBreakdown,
} from '../types';
import {
  initialClients,
  initialPets,
  initialMedications,
  initialEquipments,
  initialConsultations,
  initialReminders,
  initialTransactions,
  initialClinicSettings,
} from '../data/initialData';

interface VetContextType {
  settings: ClinicSettings;
  updateSettings: (newSettings: Partial<ClinicSettings>) => void;

  clients: Client[];
  pets: Pet[];
  medications: Medication[];
  equipments: EquipmentItem[];
  consultations: Consultation[];
  reminders: Reminder[];
  transactions: FinancialTransaction[];

  // Client & Pet methods
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  archiveClient: (id: string) => void;
  unarchiveClient: (id: string) => void;
  addPet: (pet: Omit<Pet, 'id'>) => Pet;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  archivePet: (id: string) => void;
  unarchivePet: (id: string) => void;

  // Medication methods
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, med: Partial<Medication>) => void;
  adjustMedicationStock: (id: string, amount: number) => void;
  deleteMedication: (id: string) => void;

  // Equipment methods
  addEquipment: (item: Omit<EquipmentItem, 'id'>) => void;
  updateEquipment: (id: string, item: Partial<EquipmentItem>) => void;
  adjustEquipmentStock: (id: string, amount: number) => void;
  deleteEquipment: (id: string) => void;

  // Consultation methods
  addConsultation: (consultation: Omit<Consultation, 'id' | 'createdAt'>) => Consultation;
  updateConsultation: (id: string, consultation: Partial<Consultation>) => void;
  deleteConsultation: (id: string) => void;

  // Reminder methods
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  toggleReminderNotified: (id: string) => void;
  deleteReminder: (id: string) => void;

  // Financial methods
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Pricing Calculation Utility
  calculateSuggestedPrice: (params: {
    doctorTimeMinutes: number;
    doctorHourlyRate?: number;
    consumablesCost: number;
    medsCost: number;
    labCost: number;
    overheadPercent?: number;
    targetProfitMarginPercent?: number;
  }) => CostBreakdown;

  // Helper getters
  getClientById: (id: string) => Client | undefined;
  getPetById: (id: string) => Pet | undefined;
  getPetsByClientId: (clientId: string) => Pet[];
  getConsultationsByPetId: (petId: string) => Consultation[];
  getRemindersByPetId: (petId: string) => Reminder[];

  // Reset to initial data or clear all data manually
  resetAllData: () => void;
  clearAllData: () => void;

  // Backup & Restore
  exportBackup: () => void;
  restoreBackup: (jsonString: string) => { success: boolean; message: string };
}

const VetContext = createContext<VetContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vet_bastazini_dashboard_v3_clean';

export const VetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialClinicSettings;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_clients`);
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pets`);
    return saved ? JSON.parse(saved) : initialPets;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_medications`);
    return saved ? JSON.parse(saved) : initialMedications;
  });

  const [equipments, setEquipments] = useState<EquipmentItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_equipments`);
    return saved ? JSON.parse(saved) : initialEquipments;
  });

  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_consultations`);
    return saved ? JSON.parse(saved) : initialConsultations;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reminders`);
    return saved ? JSON.parse(saved) : initialReminders;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_pets`, JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_medications`, JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_equipments`, JSON.stringify(equipments));
  }, [equipments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_consultations`, JSON.stringify(consultations));
  }, [consultations]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_reminders`, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  // Settings
  const updateSettings = (newFields: Partial<ClinicSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newFields };
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(updated));
      return updated;
    });
  };

  // Clients
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, updatedFields: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setPets((prev) => prev.filter((p) => p.clientId !== id));
  };

  const archiveClient = (id: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: true } : c))
    );
  };

  const unarchiveClient = (id: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: false } : c))
    );
  };

  // Pets
  const addPet = (petData: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...petData,
      id: `pet-${Date.now()}`,
    };
    setPets((prev) => [newPet, ...prev]);
    return newPet;
  };

  const updatePet = (id: string, updatedFields: Partial<Pet>) => {
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deletePet = (id: string) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
  };

  const archivePet = (id: string) => {
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: true } : p))
    );
  };

  const unarchivePet = (id: string) => {
    setPets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: false } : p))
    );
  };

  // Medications
  const addMedication = (medData: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}`,
    };
    setMedications((prev) => [newMed, ...prev]);
  };

  const updateMedication = (id: string, updatedFields: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m))
    );
  };

  const adjustMedicationStock = (id: string, delta: number) => {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, stockQuantity: Math.max(0, m.stockQuantity + delta) }
          : m
      )
    );
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // Equipment methods
  const addEquipment = (itemData: Omit<EquipmentItem, 'id'>) => {
    const newItem: EquipmentItem = {
      ...itemData,
      id: `eq-${Date.now()}`,
    };
    setEquipments((prev) => [newItem, ...prev]);
  };

  const updateEquipment = (id: string, updatedFields: Partial<EquipmentItem>) => {
    setEquipments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    );
  };

  const adjustEquipmentStock = (id: string, delta: number) => {
    setEquipments((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, stockQuantity: Math.max(0, e.stockQuantity + delta) }
          : e
      )
    );
  };

  const deleteEquipment = (id: string) => {
    setEquipments((prev) => prev.filter((e) => e.id !== id));
  };

  // Pricing Calculation Function
  const calculateSuggestedPrice = ({
    doctorTimeMinutes,
    doctorHourlyRate = settings.defaultHourlyRate,
    consumablesCost,
    medsCost,
    labCost,
    overheadPercent = settings.defaultOverheadPercent,
    targetProfitMarginPercent = settings.defaultTargetMarginPercent,
  }: {
    doctorTimeMinutes: number;
    doctorHourlyRate?: number;
    consumablesCost: number;
    medsCost: number;
    labCost: number;
    overheadPercent?: number;
    targetProfitMarginPercent?: number;
  }): CostBreakdown => {
    // Doctor labor cost = (minutes / 60) * hourlyRate
    const doctorLaborCost = (doctorTimeMinutes / 60) * doctorHourlyRate;

    // Direct Cost = Doctor Labor + Consumables + Medications Cost + Lab Fees
    const directCost = doctorLaborCost + consumablesCost + medsCost + labCost;

    // Overhead Cost = Direct Cost * (overheadPercent / 100)
    const overheadCost = directCost * (overheadPercent / 100);

    // Total Cost Price
    const calculatedCostPrice = directCost + overheadCost;

    // Suggested Price = Cost / (1 - (targetProfitMarginPercent / 100))
    const marginFraction = Math.min(0.9, Math.max(0.05, targetProfitMarginPercent / 100));
    const suggestedFinalPrice = calculatedCostPrice / (1 - marginFraction);

    return {
      doctorTimeMinutes,
      doctorHourlyRate,
      consumablesCost,
      medsCost,
      labCost,
      overheadPercent,
      targetProfitMarginPercent,
      calculatedCostPrice: Math.round(calculatedCostPrice * 100) / 100,
      suggestedFinalPrice: Math.round(suggestedFinalPrice * 100) / 100,
      finalChargedPrice: Math.round(suggestedFinalPrice * 100) / 100,
    };
  };

  // Consultations
  const addConsultation = (
    consultationData: Omit<Consultation, 'id' | 'createdAt'>
  ) => {
    const newConsultation: Consultation = {
      ...consultationData,
      id: `cons-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setConsultations((prev) => [newConsultation, ...prev]);

    // Automatically deduct medication stock used in consultation
    consultationData.prescribedMeds.forEach((item) => {
      adjustMedicationStock(item.medicationId, -item.quantity);
    });

    // Automatically record revenue transaction if completed or charged
    if (consultationData.costBreakdown.finalChargedPrice > 0) {
      const pet = pets.find((p) => p.id === consultationData.petId);
      const client = clients.find((c) => c.id === consultationData.clientId);
      addTransaction({
        type: 'Receita',
        category: 'Consulta Clinica',
        description: `Atendimento ${pet ? pet.name : 'Pet'} - ${
          client ? client.name : 'Cliente'
        }`,
        amount: consultationData.costBreakdown.finalChargedPrice,
        date: consultationData.date,
        relatedConsultationId: newConsultation.id,
        paymentMethod: 'Pix',
      });
    }

    return newConsultation;
  };

  const updateConsultation = (id: string, updatedFields: Partial<Consultation>) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteConsultation = (id: string) => {
    setConsultations((prev) => prev.filter((c) => c.id !== id));
  };

  // Reminders
  const addReminder = (reminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: `rem-${Date.now()}`,
    };
    setReminders((prev) => [newReminder, ...prev]);
  };

  const updateReminder = (id: string, updatedFields: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    );
  };

  const toggleReminderNotified = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, tutorNotified: !r.tutorNotified } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Transactions
  const addTransaction = (txData: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Getters
  const getClientById = (id: string) => clients.find((c) => c.id === id);
  const getPetById = (id: string) => pets.find((p) => p.id === id);
  const getPetsByClientId = (clientId: string) =>
    pets.filter((p) => p.clientId === clientId);
  const getConsultationsByPetId = (petId: string) =>
    consultations.filter((c) => c.petId === petId);
  const getRemindersByPetId = (petId: string) =>
    reminders.filter((r) => r.petId === petId);

  // Reset & Clear
  const resetAllData = () => {
    setSettings(initialClinicSettings);
    setClients(initialClients);
    setPets(initialPets);
    setMedications(initialMedications);
    setEquipments(initialEquipments);
    setConsultations(initialConsultations);
    setReminders(initialReminders);
    setTransactions(initialTransactions);
    localStorage.clear();
  };

  const clearAllData = () => {
    setClients([]);
    setPets([]);
    setMedications([]);
    setEquipments([]);
    setConsultations([]);
    setReminders([]);
    setTransactions([]);
    localStorage.clear();
  };

  const exportBackup = () => {
    const backupData = {
      version: '1.0',
      appName: 'Sistema Veterinário Dra. Rafaela Bastazini',
      exportedAt: new Date().toISOString(),
      data: {
        settings,
        clients,
        pets,
        medications,
        equipments,
        consultations,
        reminders,
        transactions,
      },
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateFormatted = new Date().toISOString().split('T')[0];

    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_vet_bastazini_${dateFormatted}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const restoreBackup = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      const content = parsed.data || parsed; // Support both wrapped format and direct object format

      if (!content || typeof content !== 'object') {
        return { success: false, message: 'Arquivo de backup inválido ou corrompido.' };
      }

      let restoredCount = 0;
      if (content.settings) {
        setSettings(content.settings);
        restoredCount++;
      }
      if (Array.isArray(content.clients)) {
        setClients(content.clients);
        restoredCount++;
      }
      if (Array.isArray(content.pets)) {
        setPets(content.pets);
        restoredCount++;
      }
      if (Array.isArray(content.medications)) {
        setMedications(content.medications);
        restoredCount++;
      }
      if (Array.isArray(content.equipments)) {
        setEquipments(content.equipments);
        restoredCount++;
      }
      if (Array.isArray(content.consultations)) {
        setConsultations(content.consultations);
        restoredCount++;
      }
      if (Array.isArray(content.reminders)) {
        setReminders(content.reminders);
        restoredCount++;
      }
      if (Array.isArray(content.transactions)) {
        setTransactions(content.transactions);
        restoredCount++;
      }

      if (restoredCount === 0) {
        return { success: false, message: 'Nenhum dado válido foi encontrado no arquivo de backup.' };
      }

      return {
        success: true,
        message: 'Backup restaurado com sucesso! Os dados foram carregados com segurança.',
      };
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return { success: false, message: 'Falha ao ler o arquivo JSON. Certifique-se de selecionar um arquivo .json de backup válido.' };
    }
  };

  return (
    <VetContext.Provider
      value={{
        settings,
        updateSettings,
        clients,
        pets,
        medications,
        equipments,
        consultations,
        reminders,
        transactions,
        addClient,
        updateClient,
        deleteClient,
        archiveClient,
        unarchiveClient,
        addPet,
        updatePet,
        deletePet,
        archivePet,
        unarchivePet,
        addMedication,
        updateMedication,
        adjustMedicationStock,
        deleteMedication,
        addEquipment,
        updateEquipment,
        adjustEquipmentStock,
        deleteEquipment,
        addConsultation,
        updateConsultation,
        deleteConsultation,
        addReminder,
        updateReminder,
        toggleReminderNotified,
        deleteReminder,
        addTransaction,
        deleteTransaction,
        calculateSuggestedPrice,
        getClientById,
        getPetById,
        getPetsByClientId,
        getConsultationsByPetId,
        getRemindersByPetId,
        resetAllData,
        clearAllData,
        exportBackup,
        restoreBackup,
      }}
    >
      {children}
    </VetContext.Provider>
  );
};

export const useVetContext = () => {
  const context = useContext(VetContext);
  if (!context) {
    throw new Error('useVetContext deve ser usado dentro de um VetProvider');
  }
  return context;
};
