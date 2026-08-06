import React, { useState } from 'react';
import { useVetContext } from '../context/VetContext';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Dog,
  Cat,
  ShieldAlert,
  FileText,
  Calendar,
  Stethoscope,
  Trash2,
  Edit,
  X,
  Printer,
  FileSpreadsheet,
  Archive,
  ArchiveRestore,
  Eye,
} from 'lucide-react';
import { Pet, Client, PetSpecies, PetGender } from '../types';
import { PrintDocumentModal, PrintDocType } from './PrintDocumentModal';
import { ClinicalTimeline } from './ClinicalTimeline';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { calculateAge, formatDateBR } from '../utils/dateUtils';

interface ClientPetRegistryProps {
  onStartConsultationForPet: (petId: string) => void;
  onViewConsultationDetail: (consultationId: string) => void;
}

export const ClientPetRegistry: React.FC<ClientPetRegistryProps> = ({
  onStartConsultationForPet,
  onViewConsultationDetail,
}) => {
  const {
    clients,
    pets,
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
    getConsultationsByPetId,
    getRemindersByPetId,
  } = useVetContext();

  const [activeTab, setActiveTab] = useState<'pets' | 'tutores' | 'arquivados'>('pets');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('todos');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(pets.find((p) => !p.archived) || null);
  const [selectedClientForView, setSelectedClientForView] = useState<Client | null>(null);

  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  // Print PDF Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<PrintDocType>('patient_file');
  const [printConsultationId, setPrintConsultationId] = useState<string | undefined>(undefined);

  // Safety Confirmation Delete Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: 'client' | 'pet' | null;
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: null,
    id: '',
    name: '',
  });

  // Client Form State
  const [clientForm, setClientForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // Pet Form State
  const [petForm, setPetForm] = useState({
    clientId: '',
    name: '',
    species: 'Cão' as PetSpecies,
    breed: '',
    gender: 'Macho' as PetGender,
    weightKg: 5,
    birthDate: '',
    microchip: '',
    allergies: '',
    vaccinationStatus: 'Em Dia' as 'Em Dia' | 'Pendente' | 'Atrasada',
  });

  // Active (non-archived) lists
  const activePetsList = pets.filter((p) => !p.archived);
  const activeClientsList = clients.filter((c) => !c.archived);
  const archivedPetsList = pets.filter((p) => p.archived);
  const archivedClientsList = clients.filter((c) => c.archived);

  // Search & Filter for Pets
  const filteredPets = activePetsList.filter((pet) => {
    const client = clients.find((c) => c.id === pet.clientId);
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client && client.phone.includes(searchTerm));

    const matchesSpecies =
      selectedSpeciesFilter === 'todos' || pet.species === selectedSpeciesFilter;

    return matchesSearch && matchesSpecies;
  });

  // Search & Filter for Clients (Tutores)
  const filteredClients = activeClientsList.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.cpf && client.cpf.includes(searchTerm));

    return matchesSearch;
  });

  // Handlers for Client
  const handleOpenAddClient = () => {
    setEditingClient(null);
    setClientForm({ name: '', cpf: '', phone: '', email: '', address: '', notes: '' });
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name || '',
      cpf: client.cpf || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || '',
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone) return;

    if (editingClient) {
      updateClient(editingClient.id, clientForm);
    } else {
      const created = addClient(clientForm);
      // Prompt to add pet immediately
      setEditingPet(null);
      setPetForm((prev) => ({ ...prev, clientId: created.id, name: '' }));
      setIsPetModalOpen(true);
    }

    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClientClick = (clientId: string, clientName: string) => {
    setDeleteConfirmState({
      isOpen: true,
      type: 'client',
      id: clientId,
      name: clientName,
    });
  };

  const handleDeletePetClick = (petId: string, petName: string) => {
    setDeleteConfirmState({
      isOpen: true,
      type: 'pet',
      id: petId,
      name: petName,
    });
  };

  // Handlers for Pet
  const handleOpenAddPet = () => {
    if (clients.length === 0) {
      alert('Cadastre um tutor primeiro!');
      handleOpenAddClient();
      return;
    }
    setEditingPet(null);
    setPetForm({
      clientId: selectedPet ? selectedPet.clientId : clients[0].id,
      name: '',
      species: 'Cão',
      breed: '',
      gender: 'Macho',
      weightKg: 5,
      birthDate: '',
      microchip: '',
      allergies: '',
      vaccinationStatus: 'Em Dia',
    });
    setIsPetModalOpen(true);
  };

  const handleOpenEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setPetForm({
      clientId: pet.clientId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      weightKg: pet.weightKg,
      birthDate: pet.birthDate || '',
      microchip: pet.microchip || '',
      allergies: pet.allergies || '',
      vaccinationStatus: pet.vaccinationStatus,
    });
    setIsPetModalOpen(true);
  };

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petForm.name || !petForm.clientId) return;

    if (editingPet) {
      updatePet(editingPet.id, petForm);
      setSelectedPet({ ...editingPet, ...petForm });
    } else {
      const createdPet = addPet(petForm);
      setSelectedPet(createdPet);
    }

    setIsPetModalOpen(false);
    setEditingPet(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmState.type === 'client') {
      deleteClient(deleteConfirmState.id);
      if (selectedPet && selectedPet.clientId === deleteConfirmState.id) {
        setSelectedPet(pets.find((p) => p.clientId !== deleteConfirmState.id) || null);
      }
    } else if (deleteConfirmState.type === 'pet') {
      deletePet(deleteConfirmState.id);
      const remaining = pets.filter((p) => p.id !== deleteConfirmState.id);
      setSelectedPet(remaining[0] || null);
    }
    setDeleteConfirmState({ isOpen: false, type: null, id: '', name: '' });
  };

  // Printing Handlers
  const handlePrintPatientFile = () => {
    if (!selectedPet) return;
    setPrintDocType('patient_file');
    setPrintConsultationId(undefined);
    setIsPrintModalOpen(true);
  };

  const handlePrintConsultationDoc = (consultationId: string) => {
    setPrintDocType('prescription');
    setPrintConsultationId(consultationId);
    setIsPrintModalOpen(true);
  };

  const activeClient = selectedPet
    ? clients.find((c) => c.id === selectedPet.clientId)
    : null;

  const activePetConsultations = selectedPet
    ? getConsultationsByPetId(selectedPet.id)
    : [];

  const activePetReminders = selectedPet
    ? getRemindersByPetId(selectedPet.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>Ficha Cadastral de Tutores & Pacientes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre, edite e gerencie o histórico de atendimentos e receitas dos pacientes do consultório.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="btn-add-client-modal"
            onClick={handleOpenAddClient}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 border border-slate-200/80 shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Novo Tutor</span>
          </button>
          <button
            id="btn-add-pet-modal"
            onClick={handleOpenAddPet}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-100 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Pet</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs: Pacientes | Tutores | Arquivados */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('pets')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'pets'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Dog className="w-4 h-4" />
          <span>Pacientes (Pets)</span>
          <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-700/30 text-emerald-100 font-extrabold">
            {activePetsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tutores')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'tutores'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Visualização dos Tutores</span>
          <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold">
            {activeClientsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('arquivados')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'arquivados'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Arquivados ({archivedClientsList.length + archivedPetsList.length})</span>
        </button>
      </div>

      {/* TAB 1: PACIENTES (PETS) VIEW */}
      {activeTab === 'pets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side (5 cols): Search and List of Patients */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-search-patients"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por pet, raça, tutor ou telefone..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Species Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
                {['todos', 'Cão', 'Gato', 'Ave', 'Exótico'].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSelectedSpeciesFilter(sp)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedSpeciesFilter === sp
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sp === 'todos' ? 'Todos' : sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Patients List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredPets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum paciente ativo encontrado.
                </div>
              ) : (
                filteredPets.map((pet) => {
                  const tutor = clients.find((c) => c.id === pet.clientId);
                  const isSelected = selectedPet?.id === pet.id;

                  return (
                    <div
                      key={pet.id}
                      onClick={() => setSelectedPet(pet)}
                      className={`p-4 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            pet.species === 'Gato'
                              ? 'bg-amber-100 text-amber-800'
                              : pet.species === 'Cão'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {pet.species === 'Gato' ? (
                            <Cat className="w-5 h-5" />
                          ) : (
                            <Dog className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-900 text-sm">{pet.name}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {pet.breed}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tutor: <strong className="text-slate-700">{tutor?.name || 'Não informado'}</strong>
                          </p>
                          <p className="text-[11px] font-semibold text-emerald-700 mt-0.5 flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-emerald-600 inline shrink-0" />
                            <span>Idade: {calculateAge(pet.birthDate)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center space-x-2">
                        <div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              pet.vaccinationStatus === 'Em Dia'
                                ? 'bg-emerald-100 text-emerald-800'
                                : pet.vaccinationStatus === 'Pendente'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {pet.vaccinationStatus}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">{pet.weightKg} kg</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side (7 cols): Full Patient Medical File Drawer */}
          <div className="lg:col-span-7">
            {selectedPet ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-20">
                {/* Patient Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner ${
                        selectedPet.species === 'Gato'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {selectedPet.species === 'Gato' ? (
                        <Cat className="w-8 h-8" />
                      ) : (
                        <Dog className="w-8 h-8" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-2xl font-black text-slate-900">
                          {selectedPet.name}
                        </h3>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                          {selectedPet.gender}
                        </span>

                        {/* Edit Pet Button */}
                        <button
                          id="btn-edit-pet"
                          onClick={() => handleOpenEditPet(selectedPet)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                          title="Editar Ficha do Pet"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Archive Pet Button */}
                        <button
                          onClick={() => {
                            archivePet(selectedPet.id);
                            const remaining = activePetsList.filter((p) => p.id !== selectedPet.id);
                            setSelectedPet(remaining[0] || null);
                          }}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                          title="Arquivar Pet"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Pet Button */}
                        <button
                          onClick={() => handleDeletePetClick(selectedPet.id, selectedPet.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Excluir Pet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Espécie: <strong>{selectedPet.species}</strong> • Raça:{' '}
                        <strong>{selectedPet.breed}</strong> • Idade:{' '}
                        <strong className="text-emerald-700 font-bold">{calculateAge(selectedPet.birthDate)}</strong> ({formatDateBR(selectedPet.birthDate)}) • Peso:{' '}
                        <strong>{selectedPet.weightKg} kg</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Print PDF Button */}
                    <button
                      id="btn-print-patient-file"
                      onClick={handlePrintPatientFile}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 border border-slate-200 flex items-center space-x-1.5 transition-all"
                      title="Imprimir Ficha Médica (PDF)"
                    >
                      <Printer className="w-4 h-4 text-emerald-700" />
                      <span>Imprimir Ficha PDF</span>
                    </button>

                    <button
                      id="btn-start-consultation-for-pet"
                      onClick={() => onStartConsultationForPet(selectedPet.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md flex items-center space-x-2 justify-center"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Novo Atendimento</span>
                    </button>
                  </div>
                </div>

                {/* Patient Details & Tutor Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tutor Info Card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Dados do Tutor Responsável
                      </span>
                      {activeClient && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setSelectedClientForView(activeClient)}
                            className="p-1 rounded bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                            title="Ver Ficha do Tutor"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            id="btn-edit-tutor"
                            onClick={() => handleOpenEditClient(activeClient)}
                            className="px-2 py-1 rounded bg-white text-emerald-700 text-[11px] font-bold border border-slate-200 hover:bg-emerald-50 flex items-center space-x-1 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => archiveClient(activeClient.id)}
                            className="p-1 rounded bg-white text-amber-700 border border-slate-200 hover:bg-amber-50 transition-colors"
                            title="Arquivar Tutor"
                          >
                            <Archive className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteClientClick(activeClient.id, activeClient.name)}
                            className="p-1 rounded bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 transition-colors"
                            title="Excluir Tutor"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm font-bold text-slate-800">{activeClient?.name}</p>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{activeClient?.phone}</span>
                      </p>
                      <p className="flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeClient?.email || 'Sem e-mail'}</span>
                      </p>
                      <p className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">{activeClient?.address || 'Sem endereço'}</span>
                      </p>
                      {activeClient?.cpf && (
                        <p className="text-[11px] text-slate-400 pt-0.5">
                          CPF: <strong>{activeClient.cpf}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pet Clinical Alerts Card */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Alertas Clínicos & Alergias</span>
                      </span>
                      <button
                        onClick={() => handleOpenEditPet(selectedPet)}
                        className="text-[11px] font-bold text-amber-900 hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {selectedPet.allergies || 'Nenhuma alergia relatada pelo tutor.'}
                    </p>
                    <div className="text-[11px] text-slate-600 pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Microchip: <strong>{selectedPet.microchip || 'Não informado'}</strong></span>
                      <span>•</span>
                      <span>Nascimento: <strong>{formatDateBR(selectedPet.birthDate)}</strong></span>
                      <span>•</span>
                      <span>Idade Actual: <strong className="text-emerald-800 font-bold">{calculateAge(selectedPet.birthDate)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Chronological Clinical Timeline View */}
                <ClinicalTimeline
                  consultations={activePetConsultations}
                  reminders={activePetReminders}
                  pet={selectedPet}
                  onPrintConsultationDoc={handlePrintConsultationDoc}
                  onStartConsultationForPet={onStartConsultationForPet}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium">Selecione um paciente na lista para visualizar a ficha completa.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TUTORES (CLIENTES) VIEW */}
      {activeTab === 'tutores' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome do tutor, CPF, telefone ou e-mail..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleOpenAddClient}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Tutor</span>
            </button>
          </div>

          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium">Nenhum tutor cadastrado ou encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => {
                const clientPets = activePetsList.filter((p) => p.clientId === client.id);

                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between border-b pb-3 border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm leading-tight">{client.name}</h3>
                            <p className="text-[11px] text-slate-500">
                              CPF: {client.cpf || 'Não cadastrado'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {clientPets.length} pet(s)
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{client.phone}</span>
                        </div>
                        {client.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{client.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Associated Pets */}
                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Pacientes Vínculados:
                        </p>
                        {clientPets.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Nenhum pet cadastrado para este tutor.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {clientPets.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setSelectedPet(p);
                                  setActiveTab('pets');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold flex items-center space-x-1 border border-slate-200 transition-colors"
                              >
                                {p.species === 'Gato' ? (
                                  <Cat className="w-3 h-3 text-amber-600" />
                                ) : (
                                  <Dog className="w-3 h-3 text-emerald-600" />
                                )}
                                <span>{p.name} ({p.breed})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setSelectedClientForView(client)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center space-x-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Ver Ficha</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditClient(client)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                          title="Editar Tutor"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => archiveClient(client.id)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"
                          title="Arquivar Tutor"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClientClick(client.id, client.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="Excluir Tutor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARQUIVADOS VIEW */}
      {activeTab === 'arquivados' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center space-x-3 text-amber-900 text-xs font-medium">
            <Archive className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              Itens arquivados ficam ocultos das buscas principais do consultório. Você pode <strong>Restaurar</strong> qualquer registro a qualquer momento ou <strong>Excluir Definitivamente</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Archived Tutores */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center justify-between border-b pb-3 border-slate-100">
                <span className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Tutores Arquivados</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {archivedClientsList.length}
                </span>
              </h3>

              {archivedClientsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhum tutor arquivado.</p>
              ) : (
                <div className="divide-y divide-slate-100 space-y-3">
                  {archivedClientsList.map((c) => (
                    <div key={c.id} className="pt-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{c.name}</h4>
                        <p className="text-[11px] text-slate-500">{c.phone} • CPF: {c.cpf || 'N/I'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => unarchiveClient(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 flex items-center space-x-1"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restaurar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClientClick(c.id, c.name)}
                          className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="Excluir Definitivamente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Archived Pets */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center justify-between border-b pb-3 border-slate-100">
                <span className="flex items-center space-x-2">
                  <Dog className="w-4 h-4 text-amber-600" />
                  <span>Pacientes (Pets) Arquivados</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {archivedPetsList.length}
                </span>
              </h3>

              {archivedPetsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhum pet arquivado.</p>
              ) : (
                <div className="divide-y divide-slate-100 space-y-3">
                  {archivedPetsList.map((p) => {
                    const tutor = clients.find((c) => c.id === p.clientId);
                    return (
                      <div key={p.id} className="pt-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{p.name} ({p.species} - {p.breed})</h4>
                          <p className="text-[11px] text-slate-500">Tutor: {tutor?.name || 'Não informado'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => unarchivePet(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 flex items-center space-x-1"
                          >
                            <ArchiveRestore className="w-3.5 h-3.5" />
                            <span>Restaurar</span>
                          </button>
                          <button
                            onClick={() => handleDeletePetClick(p.id, p.name)}
                            className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                            title="Excluir Definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutor Detail View Modal */}
      {selectedClientForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedClientForView.name}</h3>
                  <p className="text-xs text-slate-500">Ficha Cadastral do Tutor</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientForView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Telefone / WhatsApp</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedClientForView.phone}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 text-[10px] uppercase">CPF</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedClientForView.cpf || 'Não cadastrado'}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-400 text-[10px] uppercase">E-mail</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{selectedClientForView.email || 'Não informado'}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-400 text-[10px] uppercase">Endereço Residencial</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{selectedClientForView.address || 'Não informado'}</p>
                </div>
                {selectedClientForView.notes && (
                  <div className="col-span-2 border-t pt-2 border-slate-200">
                    <span className="font-bold text-slate-400 text-[10px] uppercase">Observações</span>
                    <p className="text-slate-700 mt-0.5">{selectedClientForView.notes}</p>
                  </div>
                )}
              </div>

              {/* Pets of this client */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">Pacientes Vínculados ({activePetsList.filter((p) => p.clientId === selectedClientForView.id).length})</h4>
                  <button
                    onClick={() => {
                      setSelectedClientForView(null);
                      setEditingPet(null);
                      setPetForm((prev) => ({ ...prev, clientId: selectedClientForView.id, name: '' }));
                      setIsPetModalOpen(true);
                    }}
                    className="text-emerald-700 font-bold hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar Pet</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activePetsList.filter((p) => p.clientId === selectedClientForView.id).length === 0 ? (
                    <p className="text-slate-400 italic py-2">Nenhum pet cadastrado para este tutor ainda.</p>
                  ) : (
                    activePetsList
                      .filter((p) => p.clientId === selectedClientForView.id)
                      .map((p) => (
                        <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            {p.species === 'Gato' ? <Cat className="w-4 h-4 text-amber-600" /> : <Dog className="w-4 h-4 text-emerald-600" />}
                            <div>
                              <p className="font-bold text-slate-800">{p.name} <span className="font-normal text-slate-500">({p.species} • {p.breed})</span></p>
                              <p className="text-[11px] text-slate-400">Idade: {calculateAge(p.birthDate)} • Peso: {p.weightKg} kg</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedClientForView(null);
                              setSelectedPet(p);
                              setActiveTab('pets');
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100"
                          >
                            Ver Ficha
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleOpenEditClient(selectedClientForView);
                    setSelectedClientForView(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center space-x-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    archiveClient(selectedClientForView.id);
                    setSelectedClientForView(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-bold border border-amber-200 hover:bg-amber-100 flex items-center space-x-1"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Arquivar</span>
                </button>
              </div>

              <button
                onClick={() => {
                  const id = selectedClientForView.id;
                  const name = selectedClientForView.name;
                  setSelectedClientForView(null);
                  handleDeleteClientClick(id, name);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 hover:bg-rose-100 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Tutor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Client / Tutor (Add or Edit) */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editingClient ? 'Editar Ficha do Tutor' : 'Cadastrar Novo Tutor'}
              </h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo do Tutor *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Ex: Mariana Silva"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={clientForm.cpf}
                    onChange={(e) => setClientForm({ ...clientForm, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="tutor@email.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações do Tutor</label>
                <textarea
                  rows={2}
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="Preferências de horário, forma de contato..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                >
                  {editingClient ? 'Salvar Alterações' : 'Cadastrar Tutor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pet (Add or Edit) */}
      {isPetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editingPet ? 'Editar Ficha do Paciente' : 'Cadastrar Novo Pet'}
              </h3>
              <button
                onClick={() => setIsPetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePet} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tutor Responsável *</label>
                <select
                  required
                  value={petForm.clientId}
                  onChange={(e) => setPetForm({ ...petForm, clientId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  <option value="">Selecione o tutor...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome do Pet *</label>
                  <input
                    type="text"
                    required
                    value={petForm.name}
                    onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                    placeholder="Ex: Thor"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Espécie *</label>
                  <select
                    value={petForm.species}
                    onChange={(e) =>
                      setPetForm({ ...petForm, species: e.target.value as PetSpecies })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Cão">Cão</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Exótico">Exótico</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Raça</label>
                  <input
                    type="text"
                    value={petForm.breed}
                    onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                    placeholder="Ex: Golden Retriever"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={petForm.gender}
                    onChange={(e) =>
                      setPetForm({ ...petForm, gender: e.target.value as PetGender })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={petForm.weightKg}
                    onChange={(e) =>
                      setPetForm({ ...petForm, weightKg: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Vacinal</label>
                  <select
                    value={petForm.vaccinationStatus}
                    onChange={(e) =>
                      setPetForm({
                        ...petForm,
                        vaccinationStatus: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Em Dia">Em Dia</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Atrasada">Atrasada</option>
                  </select>
                </div>
              </div>

              {/* Data de Nascimento & Idade Calculada */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={petForm.birthDate}
                    onChange={(e) => setPetForm({ ...petForm, birthDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Idade Hoje (Calculada)</label>
                  <div className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 font-bold text-xs flex items-center justify-between min-h-[38px]">
                    <span>{calculateAge(petForm.birthDate)}</span>
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Microchip / Registro</label>
                <input
                  type="text"
                  value={petForm.microchip}
                  onChange={(e) => setPetForm({ ...petForm, microchip: e.target.value })}
                  placeholder="Código do microchip"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alergias ou Observações Médicas</label>
                <input
                  type="text"
                  value={petForm.allergies}
                  onChange={(e) => setPetForm({ ...petForm, allergies: e.target.value })}
                  placeholder="Ex: Reação a dipirona, dermatite atópica"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                >
                  {editingPet ? 'Salvar Alterações' : 'Salvar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print PDF Document Modal */}
      <PrintDocumentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        docType={printDocType}
        consultationId={printConsultationId}
        petId={selectedPet?.id}
      />

      {/* Confirm Delete Safety Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmState.isOpen}
        title={
          deleteConfirmState.type === 'client'
            ? 'Excluir Tutor Cadastrado'
            : 'Excluir Paciente (Pet)'
        }
        itemName={deleteConfirmState.name}
        description={
          deleteConfirmState.type === 'client'
            ? 'Tem certeza que deseja remover este tutor e o vínculo dos seus pacientes? Esta ação não pode ser desfeita.'
            : 'Tem certeza que deseja excluir o prontuário e cadastro deste paciente?'
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmState({ isOpen: false, type: null, id: '', name: '' })}
      />
    </div>
  );
};
