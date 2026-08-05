export type PetSpecies = 'Cão' | 'Gato' | 'Ave' | 'Exótico' | 'Outro';
export type PetGender = 'Macho' | 'Fêmea';

export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  clientId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  weightKg: number;
  birthDate: string;
  microchip?: string;
  allergies?: string;
  vaccinationStatus: 'Em Dia' | 'Pendente' | 'Atrasada';
  photoUrl?: string;
}

export type EquipmentCategory =
  | 'Material Descartável'
  | 'Insumo Cirúrgico'
  | 'Proteção e Higiene'
  | 'Equipamento Clínico'
  | 'Outros';

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  stockQuantity: number;
  unit: 'unidade' | 'caixa' | 'pacote' | 'rolo' | 'par';
  minStockAlert: number;
  unitCost: number; // Cost price in R$
  supplier?: string;
  notes?: string;
  expirationDate?: string;
}

export type MedicationCategory =
  | 'Antibiótico'
  | 'Anti-inflamatório'
  | 'Analgésico'
  | 'Antiparasitário'
  | 'Anestésico'
  | 'Vacina/Biológico'
  | 'Insumo/Outros';

export interface Medication {
  id: string;
  name: string;
  activeIngredient: string;
  category: MedicationCategory;
  stockQuantity: number;
  unit: 'frasco' | 'comprimido' | 'ampola' | 'caixa' | 'ml' | 'dose';
  minStockAlert: number;
  unitCost: number; // Cost price per unit (R$)
  salePrice: number; // Standard sale price per unit (R$)
  dosageMgPerKg?: number;
  batchNumber?: string;
  expirationDate: string;
}

export interface PrescribedMedication {
  medicationId: string;
  medicationName: string;
  quantity: number;
  dosageText: string; // e.g. "1 comprimido a cada 12h por 5 dias"
  unitPriceCost: number;
  unitPriceCharged: number;
}

export interface CostBreakdown {
  doctorTimeMinutes: number;
  doctorHourlyRate: number; // e.g. R$ 180/h
  consumablesCost: number; // syringes, gloves, etc.
  medsCost: number; // sum of meds cost
  labCost: number; // blood tests, x-rays, etc.
  overheadPercent: number; // e.g. 15% for clinic rent/energy
  targetProfitMarginPercent: number; // e.g. 40%
  calculatedCostPrice: number; // Total cost to clinic
  suggestedFinalPrice: number; // Suggested price charged to client
  finalChargedPrice: number; // Actual price charged
}

export type ConsultationStatus = 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada';

export interface Consultation {
  id: string;
  petId: string;
  clientId: string;
  date: string;
  time: string;
  reason: string;
  soapSubjective: string; // Tutor description, symptoms
  soapObjective: string; // Physical exam findings, temp, heart rate
  soapAssessment: string; // Diagnosis / Hypothesis
  soapPlan: string; // Treatment plan
  requestedExams?: string; // Required / requested laboratory & imaging exams
  prescribedMeds: PrescribedMedication[];
  costBreakdown: CostBreakdown;
  status: ConsultationStatus;
  createdAt: string;
}

export type ReminderType = 'Consulta' | 'Retorno' | 'Vacinação' | 'Exame' | 'Vermifugação' | 'Cirurgia';
export type ReminderStatus = 'Pendente' | 'Concluído' | 'Cancelado';

export interface Reminder {
  id: string;
  petId: string;
  clientId: string;
  type: ReminderType;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  status: ReminderStatus;
  tutorNotified: boolean;
}

export type TransactionType = 'Receita' | 'Despesa';
export type TransactionCategory =
  | 'Consulta Clinica'
  | 'Cirurgia'
  | 'Venda Medicamento'
  | 'Exame Laboratorial'
  | 'Aluguel e Utilidades'
  | 'Insumos Veterinários'
  | 'Equipamentos'
  | 'Marketing e Outros';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  relatedConsultationId?: string;
  paymentMethod?: 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Boleto';
}

export interface ClinicSettings {
  doctorName: string;
  crmv: string;
  clinicName: string;
  phone: string;
  address: string;
  defaultHourlyRate: number; // R$/hour
  defaultOverheadPercent: number; // %
  defaultTargetMarginPercent: number; // %
}
