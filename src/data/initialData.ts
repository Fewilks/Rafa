import {
  Client,
  Pet,
  Medication,
  EquipmentItem,
  Consultation,
  Reminder,
  FinancialTransaction,
  ClinicSettings,
} from '../types';

export const initialClinicSettings: ClinicSettings = {
  doctorName: 'Dr. Rafael Bastazini',
  crmv: 'CRMV-SP 42.890',
  clinicName: 'Bastazini Medicina Veterinária & Centro Diagnóstico',
  phone: '(11) 98765-4321',
  address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
  defaultHourlyRate: 180,
  defaultOverheadPercent: 15,
  defaultTargetMarginPercent: 40,
  googleDriveConnected: true,
  googleDriveEmail: 'dra.rafaela.bastazini@gmail.com',
  dailyBackupEnabled: true,
  dailyBackupTime: '20:00',
  lastDriveBackupAt: new Date().toISOString(),
};

export const initialClients: Client[] = [];
export const initialPets: Pet[] = [];
export const initialMedications: Medication[] = [];
export const initialConsultations: Consultation[] = [];
export const initialReminders: Reminder[] = [];
export const initialTransactions: FinancialTransaction[] = [];
export const initialEquipments: EquipmentItem[] = [];
