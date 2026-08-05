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
  CheckCircle,
  AlertCircle,
  Syringe,
} from 'lucide-react';
import { Pet, Client, PetSpecies, PetGender } from '../types';

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
    addPet,
    deleteClient,
    deletePet,
    getConsultationsByPetId,
    getRemindersByPetId,
  } = useVetContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('todos');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(pets[0] || null);

  // Modals
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [targetClientIdForNewPet, setTargetClientIdForNewPet] = useState<string>('');

  // New Client Form State
  const [clientForm, setClientForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // New Pet Form State
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

  // Search & Filter
  const filteredPets = pets.filter((pet) => {
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

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone) return;

    const created = addClient(clientForm);
    setClientForm({ name: '', cpf: '', phone: '', email: '', address: '', notes: '' });
    setIsAddClientModalOpen(false);

    // Optionally prompt to add a pet for this client immediately
    setTargetClientIdForNewPet(created.id);
    setPetForm((prev) => ({ ...prev, clientId: created.id }));
    setIsAddPetModalOpen(true);
  };

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petForm.name || !petForm.clientId) return;

    const createdPet = addPet(petForm);
    setSelectedPet(createdPet);
    setPetForm({
      clientId: '',
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
    setIsAddPetModalOpen(false);
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
            Gerencie o histórico médico de cães, gatos e outros pets cadastrados no consultório.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="btn-add-client-modal"
            onClick={() => setIsAddClientModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Tutor</span>
          </button>
          <button
            id="btn-add-pet-modal"
            onClick={() => {
              if (clients.length === 0) {
                alert('Cadastre um tutor primeiro!');
                setIsAddClientModalOpen(true);
              } else {
                setPetForm((prev) => ({ ...prev, clientId: clients[0].id }));
                setIsAddPetModalOpen(true);
              }
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-bold text-xs hover:bg-emerald-400 shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Pet</span>
          </button>
        </div>
      </div>

      {/* Main Layout: List & Detail Drawer */}
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
                Nenhum paciente encontrado para a busca.
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
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pet.vaccinationStatus === 'Em Dia'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pet.vaccinationStatus === 'Pendente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Vacina {pet.vaccinationStatus}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">{pet.weightKg} kg</p>
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
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Espécie: <strong>{selectedPet.species}</strong> • Raça:{' '}
                      <strong>{selectedPet.breed}</strong> • Peso:{' '}
                      <strong>{selectedPet.weightKg} kg</strong>
                    </p>
                  </div>
                </div>

                <button
                  id="btn-start-consultation-for-pet"
                  onClick={() => onStartConsultationForPet(selectedPet.id)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm flex items-center space-x-2 shrink-0 justify-center"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Iniciar Atendimento</span>
                </button>
              </div>

              {/* Patient Details & Tutor Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tutor Info Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Dados do Tutor
                  </span>
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
                      <span className="line-clamp-1">{activeClient?.address}</span>
                    </p>
                  </div>
                </div>

                {/* Pet Clinical Alerts Card */}
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Alertas Clínicos & Alergias</span>
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedPet.allergies || 'Nenhuma alergia relatada pelo tutor.'}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-amber-200/60">
                    Microchip: <strong>{selectedPet.microchip || 'Não informado'}</strong>
                  </div>
                </div>
              </div>

              {/* Medical History (SOAP Consultations) */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Prontuários & Histórico de Consultas ({activePetConsultations.length})</span>
                </h4>

                {activePetConsultations.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-slate-200">
                    Nenhum atendimento clínico gravado para este pet ainda.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activePetConsultations.map((cons) => (
                      <div
                        key={cons.id}
                        onClick={() => onViewConsultationDetail(cons.id)}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800">
                            {cons.reason}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {cons.date.split('-').reverse().join('/')} às {cons.time}
                          </span>
                        </div>
                        {cons.soapAssessment && (
                          <p className="text-xs text-slate-600 font-medium">
                            <strong>Diagnóstico:</strong> {cons.soapAssessment}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                          <span>
                            {cons.prescribedMeds.length} medicamento(s) prescrito(s)
                          </span>
                          <span className="font-bold text-emerald-700">
                            Cobrado: R$ {cons.costBreakdown.finalChargedPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reminders & Vaccines */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-700" />
                  <span>Lembretes & Vacinações ({activePetReminders.length})</span>
                </h4>

                <div className="space-y-2">
                  {activePetReminders.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-slate-200">
                      Nenhum agendamento futuro pendente.
                    </div>
                  ) : (
                    activePetReminders.map((rem) => (
                      <div
                        key={rem.id}
                        className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-purple-950">{rem.title}</p>
                          <p className="text-slate-500 text-[11px]">{rem.type}</p>
                        </div>
                        <span className="font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-lg">
                          {rem.date.split('-').reverse().join('/')} às {rem.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium">Selecione um paciente na lista para visualizar a ficha completa.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Client / Tutor */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Cadastrar Novo Tutor</h3>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
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
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Salvar Tutor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Pet */}
      {isAddPetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Cadastrar Novo Pet</h3>
              <button
                onClick={() => setIsAddPetModalOpen(false)}
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
                  onClick={() => setIsAddPetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
