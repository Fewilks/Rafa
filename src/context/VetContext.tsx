import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Client,
  Pet,
  Medication,
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
  initialConsultations,
  initialReminders,
  initialTransactions,
  initialClinicSettings,
} from '../data/initialData';

interface VetContextType {
  settings: ClinicSettings;
  updateSettings: (newSettings: ClinicSettings) => void;

  clients: Client[];
  pets: Pet[];
  medications: Medication[];
  consultations: Consultation[];
  reminders: Reminder[];
  transactions: FinancialTransaction[];

  // Client & Pet methods
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addPet: (pet: Omit<Pet, 'id'>) => Pet;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;

  // Medication methods
  addMedication: (med: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, med: Partial<Medication>) => void;
  adjustMedicationStock: (id: string, amount: number) => void;
  deleteMedication: (id: string) => void;

  // Consultation methods
  addConsultation: (consultation: Omit<Consultation, 'id' | 'createdAt'>) => Consultation;
  updateConsultation: (id: string, consultation: Partial<Consultation>) => void;

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

  // Reset to initial data
  resetAllData: () => void;
}

const VetContext = createContext<VetContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vet_bastazini_dashboard_data_v1';

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
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_consultations`, JSON.stringify(consultations));
  }, [consultations]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_reminders`, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  // Settings
  const updateSettings = (newSettings: ClinicSettings) => setSettings(newSettings);

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

  // Reset
  const resetAllData = () => {
    setSettings(initialClinicSettings);
    setClients(initialClients);
    setPets(initialPets);
    setMedications(initialMedications);
    setConsultations(initialConsultations);
    setReminders(initialReminders);
    setTransactions(initialTransactions);
    localStorage.clear();
  };

  return (
    <VetContext.Provider
      value={{
        settings,
        updateSettings,
        clients,
        pets,
        medications,
        consultations,
        reminders,
        transactions,
        addClient,
        updateClient,
        deleteClient,
        addPet,
        updatePet,
        deletePet,
        addMedication,
        updateMedication,
        adjustMedicationStock,
        deleteMedication,
        addConsultation,
        updateConsultation,
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
