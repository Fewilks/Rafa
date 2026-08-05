import React, { useState } from 'react';
import { useVetContext } from '../context/VetContext';
import {
  CalendarCheck,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  X,
  Trash2,
  Syringe,
  Stethoscope,
  Scissors,
  Check,
  Pencil,
} from 'lucide-react';
import { ReminderType, ReminderStatus, Reminder } from '../types';

export const RemindersSystem: React.FC = () => {
  const {
    reminders,
    pets,
    clients,
    addReminder,
    updateReminder,
    toggleReminderNotified,
    deleteReminder,
    getPetById,
    getClientById,
  } = useVetContext();

  const [filterType, setFilterType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('Pendente');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  // New / Edit Reminder Form State
  const [reminderForm, setReminderForm] = useState({
    petId: pets[0]?.id || '',
    type: 'Vacinação' as ReminderType,
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    notes: '',
  });

  const handleOpenAddReminder = () => {
    setEditingReminderId(null);
    setReminderForm({
      petId: pets[0]?.id || '',
      type: 'Vacinação',
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      notes: '',
    });
    setIsAddReminderModalOpen(true);
  };

  const handleOpenEditReminder = (rem: Reminder) => {
    setEditingReminderId(rem.id);
    setReminderForm({
      petId: rem.petId,
      type: rem.type,
      title: rem.title,
      date: rem.date,
      time: rem.time,
      notes: rem.notes || '',
    });
    setIsAddReminderModalOpen(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderForm.petId || !reminderForm.title) return;

    const pet = getPetById(reminderForm.petId);
    const client = pet ? getClientById(pet.clientId) : null;

    if (editingReminderId) {
      updateReminder(editingReminderId, {
        ...reminderForm,
        clientId: client?.id || '',
      });
    } else {
      addReminder({
        ...reminderForm,
        clientId: client?.id || '',
        status: 'Pendente',
        tutorNotified: false,
      });
    }

    setReminderForm({
      petId: pets[0]?.id || '',
      type: 'Vacinação',
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      notes: '',
    });
    setEditingReminderId(null);
    setIsAddReminderModalOpen(false);
  };

  const filteredReminders = reminders.filter((rem) => {
    const pet = getPetById(rem.petId);
    const client = getClientById(rem.clientId);

    const matchesType = filterType === 'todos' || rem.type === filterType;
    const matchesStatus = filterStatus === 'todos' || rem.status === filterStatus;

    const matchesSearch =
      rem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet && pet.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client && client.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesStatus && matchesSearch;
  });

  const handleSendWhatsAppNotification = (rem: typeof reminders[0]) => {
    const pet = getPetById(rem.petId);
    const client = getClientById(rem.clientId);

    if (!client) return;

    const formattedDate = rem.date.split('-').reverse().join('/');
    const message = `Olá, ${client.name}! Lembrete da Clínica do Dr. Rafael Bastazini:
O pet *${pet?.name || 'seu pet'}* possui um agendamento de *${rem.type}* (${rem.title}) marcado para *${formattedDate} às ${rem.time}*.
Caso precise reagendar ou tenha dúvidas, por favor entre em contato conosc. Tenha um ótimo dia!`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encoded}`, '_blank');

    toggleReminderNotified(rem.id);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-emerald-700" />
            <span>Agenda & Sistema de Lembretes Veterinários</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Agende retornos, vacinas e cirurgias futuras com disparo fácil de lembretes no WhatsApp do tutor.
          </p>
        </div>

        <button
          id="btn-open-add-reminder-modal"
          onClick={handleOpenAddReminder}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento / Lembrete</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="input-search-reminders"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, pet ou tutor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            id="select-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Pendente">Pendentes</option>
            <option value="Concluído">Concluídos</option>
            <option value="todos">Todos Status</option>
          </select>

          <select
            id="select-filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todos">Todos Tipos</option>
            <option value="Vacinação">Vacinações</option>
            <option value="Retorno">Retornos</option>
            <option value="Consulta">Consultas</option>
            <option value="Cirurgia">Cirurgias</option>
            <option value="Exame">Exames</option>
          </select>
        </div>
      </div>

      {/* Reminders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReminders.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            Nenhum lembrete encontrado.
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const pet = getPetById(rem.petId);
            const client = getClientById(rem.clientId);

            return (
              <div
                key={rem.id}
                className={`bg-white rounded-2xl border p-5 space-y-3 shadow-sm hover:shadow-md transition-all ${
                  rem.status === 'Concluído'
                    ? 'opacity-65 border-slate-200 bg-slate-50'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${
                      rem.type === 'Vacinação'
                        ? 'bg-purple-100 text-purple-800'
                        : rem.type === 'Cirurgia'
                        ? 'bg-rose-100 text-rose-800'
                        : rem.type === 'Retorno'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {rem.type}
                  </span>

                  <span className="text-xs font-bold text-slate-600 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {rem.date.split('-').reverse().join('/')} às {rem.time}
                    </span>
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rem.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Paciente: <strong className="text-slate-800">{pet?.name}</strong> ({pet?.species})
                  </p>
                  <p className="text-xs text-slate-500">Tutor: {client?.name} ({client?.phone})</p>
                  {rem.notes && (
                    <p className="text-xs text-slate-400 italic mt-1 bg-slate-50 p-2 rounded-lg border">
                      {rem.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    id={`btn-notify-wa-${rem.id}`}
                    onClick={() => handleSendWhatsAppNotification(rem)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      rem.tutorNotified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{rem.tutorNotified ? 'Notificado via WhatsApp' : 'Enviar Lembrete WA'}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      id={`btn-edit-reminder-${rem.id}`}
                      onClick={() => handleOpenEditReminder(rem)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                      title="Editar Agendamento"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {rem.status === 'Pendente' ? (
                      <button
                        id={`btn-complete-reminder-${rem.id}`}
                        onClick={() => updateReminder(rem.id, { status: 'Concluído' })}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        title="Marcar como Concluído"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        id={`btn-reopen-reminder-${rem.id}`}
                        onClick={() => updateReminder(rem.id, { status: 'Pendente' })}
                        className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                        title="Reabrir Agendamento"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      id={`btn-delete-reminder-${rem.id}`}
                      onClick={() => {
                        if (confirm('Excluir este agendamento?')) deleteReminder(rem.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add/Edit Reminder */}
      {isAddReminderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editingReminderId ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h3>
              <button
                onClick={() => setIsAddReminderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReminder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Selecione o Paciente *</label>
                <select
                  required
                  value={reminderForm.petId}
                  onChange={(e) => setReminderForm({ ...reminderForm, petId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {pets.map((p) => {
                    const tutor = clients.find((c) => c.id === p.clientId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species}) - Tutor: {tutor?.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Agendamento</label>
                  <select
                    value={reminderForm.type}
                    onChange={(e) =>
                      setReminderForm({
                        ...reminderForm,
                        type: e.target.value as ReminderType,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Vacinação">Vacinação</option>
                    <option value="Retorno">Retorno Médico</option>
                    <option value="Consulta">Consulta Geral</option>
                    <option value="Cirurgia">Cirurgia</option>
                    <option value="Exame">Exame Laboratorial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Título Curto *</label>
                  <input
                    type="text"
                    required
                    value={reminderForm.title}
                    onChange={(e) =>
                      setReminderForm({ ...reminderForm, title: e.target.value })
                    }
                    placeholder="Ex: Vacina V10 Reforço"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={reminderForm.date}
                    onChange={(e) =>
                      setReminderForm({ ...reminderForm, date: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={reminderForm.time}
                    onChange={(e) =>
                      setReminderForm({ ...reminderForm, time: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações ou Recomendações</label>
                <textarea
                  rows={2}
                  value={reminderForm.notes}
                  onChange={(e) =>
                    setReminderForm({ ...reminderForm, notes: e.target.value })
                  }
                  placeholder="Ex: Jejum hídrico, trazer exames anteriores..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddReminderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Salvar na Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
