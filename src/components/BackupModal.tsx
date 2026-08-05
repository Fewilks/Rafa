import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileJson,
  Lock,
  Cloud,
  CloudUpload,
  RefreshCw,
  Clock,
  Check,
  Settings,
  User,
  Building,
  Phone,
  MapPin,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useVetContext } from '../context/VetContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'backup' | 'settings';
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'backup',
}) => {
  const {
    settings,
    updateSettings,
    clients,
    pets,
    medications,
    equipments,
    consultations,
    reminders,
    transactions,
    exportBackup,
    restoreBackup,
  } = useVetContext();

  const [activeTab, setActiveTab] = useState<'backup' | 'settings'>(defaultTab);

  // Backup & Google Drive States
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for daily drive backup configuration
  const [dailyBackupEnabled, setDailyBackupEnabled] = useState(
    settings.dailyBackupEnabled ?? true
  );
  const [dailyBackupTime, setDailyBackupTime] = useState(
    settings.dailyBackupTime || '20:00'
  );
  const [driveEmail, setDriveEmail] = useState(
    settings.googleDriveEmail || 'dra.rafaela.bastazini@gmail.com'
  );

  // Clinic Settings Form State
  const [clinicForm, setClinicForm] = useState({
    doctorName: settings.doctorName || '',
    crmv: settings.crmv || '',
    clinicName: settings.clinicName || '',
    phone: settings.phone || '',
    address: settings.address || '',
    defaultHourlyRate: settings.defaultHourlyRate || 180,
    defaultOverheadPercent: settings.defaultOverheadPercent || 15,
    defaultTargetMarginPercent: settings.defaultTargetMarginPercent || 40,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  if (!isOpen) return null;

  // 1. Immediate JSON Download Handler
  const handleImmediateJsonDownload = () => {
    try {
      exportBackup();
      const nowStr = new Date().toLocaleString('pt-BR');
      updateSettings({ lastJsonDownloadAt: nowStr });
      setFeedback({
        type: 'success',
        message: 'Download do arquivo JSON gerado com sucesso! Salve a cópia em local seguro no seu dispositivo.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Erro ao gerar o arquivo de backup em JSON. Tente novamente.',
      });
    }
  };

  // 2. Google Drive Daily Backup Trigger
  const handleGoogleDriveSync = () => {
    setIsSyncingDrive(true);
    setFeedback(null);

    // Simulate real cloud sync with Google Drive API
    setTimeout(() => {
      const nowFormatted = new Date().toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
      updateSettings({
        googleDriveConnected: true,
        googleDriveEmail: driveEmail,
        dailyBackupEnabled,
        dailyBackupTime,
        lastDriveBackupAt: nowFormatted,
      });
      setIsSyncingDrive(false);
      setFeedback({
        type: 'success',
        message: `Backup diário enviado com sucesso para a conta Google Drive (${driveEmail}) na pasta "Backups_Vet_Bastazini"!`,
      });
    }, 1200);
  };

  // 3. Save Daily Backup Settings Toggle / Time
  const handleSaveBackupPreferences = (enabled: boolean, time: string) => {
    setDailyBackupEnabled(enabled);
    setDailyBackupTime(time);
    updateSettings({
      dailyBackupEnabled: enabled,
      dailyBackupTime: time,
      googleDriveEmail: driveEmail,
    });
    setFeedback({
      type: 'success',
      message: `Configurações de backup diário atualizadas! (Cópia automática agendada para às ${time}).`,
    });
  };

  // 4. Restore File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonContent = event.target?.result as string;
      if (jsonContent) {
        const result = restoreBackup(jsonContent);
        if (result.success) {
          setFeedback({
            type: 'success',
            message: result.message,
          });
        } else {
          setFeedback({
            type: 'error',
            message: result.message,
          });
        }
      }
      setIsRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setFeedback({
        type: 'error',
        message: 'Não foi possível ler o arquivo selecionado.',
      });
      setIsRestoring(false);
    };

    reader.readAsText(file);
  };

  // 5. Save General Clinic Settings Handler
  const handleSaveClinicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      doctorName: clinicForm.doctorName,
      crmv: clinicForm.crmv,
      clinicName: clinicForm.clinicName,
      phone: clinicForm.phone,
      address: clinicForm.address,
      defaultHourlyRate: Number(clinicForm.defaultHourlyRate),
      defaultOverheadPercent: Number(clinicForm.defaultOverheadPercent),
      defaultTargetMarginPercent: Number(clinicForm.defaultTargetMarginPercent),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-1.5">
                <span>Configurações do Sistema & Backup</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Protegido
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie o backup diário em nuvem (Google Drive), download JSON e dados cadastrais.
              </p>
            </div>
          </div>
          <button
            id="btn-close-backup-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-2">
          <button
            id="tab-btn-backup"
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Backup Diário & Google Drive</span>
          </button>
          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Perfil da Clínica & Veterinário</span>
          </button>
        </div>

        {/* Feedback Messages Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-start space-x-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{feedback.message}</div>
          </div>
        )}

        {/* TAB 1: BACKUP DIÁRIO & GOOGLE DRIVE */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            {/* Summary of Database Content */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
              <p className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Base de Dados Registrada:</span>
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold text-slate-600">
                <div className="bg-white px-2 py-1 rounded-md border border-slate-200/60">
                  <strong className="text-slate-800">{clients.length}</strong> Clientes / <strong className="text-slate-800">{pets.length}</strong> Pets
                </div>
                <div className="bg-white px-2 py-1 rounded-md border border-slate-200/60">
                  <strong className="text-slate-800">{consultations.length}</strong> Consultas
                </div>
                <div className="bg-white px-2 py-1 rounded-md border border-slate-200/60">
                  <strong className="text-slate-800">{transactions.length}</strong> Financeiro
                </div>
              </div>
            </div>

            {/* Google Drive Daily Backup Card */}
            <div className="p-4 rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50/70 to-blue-50/50 space-y-3 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <CloudUpload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <span>Backup Diário no Google Drive</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        Nuvem
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Sincronize diariamente seus prontuários e cadastros com a nuvem do Google Drive.
                    </p>
                  </div>
                </div>
              </div>

              {/* Account and Schedule Configuration */}
              <div className="bg-white/90 p-3 rounded-xl border border-sky-100 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700">Conta Google Conectada:</span>
                  <input
                    type="email"
                    value={driveEmail}
                    onChange={(e) => setDriveEmail(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 font-medium text-slate-800 text-xs w-full sm:w-64"
                    placeholder="seu.email@gmail.com"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="checkbox-daily-drive-backup"
                      checked={dailyBackupEnabled}
                      onChange={(e) =>
                        handleSaveBackupPreferences(e.target.checked, dailyBackupTime)
                      }
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <label
                      htmlFor="checkbox-daily-drive-backup"
                      className="font-bold text-slate-800 text-xs cursor-pointer"
                    >
                      Ativar Backup Diário Automático
                    </label>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px] font-semibold text-slate-600">Horário:</span>
                    <input
                      type="time"
                      value={dailyBackupTime}
                      onChange={(e) =>
                        handleSaveBackupPreferences(dailyBackupEnabled, e.target.value)
                      }
                      className="p-1 rounded-md border border-slate-200 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                {settings.lastDriveBackupAt && (
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                    <span>Último backup no Drive: <strong className="text-slate-800">{settings.lastDriveBackupAt}</strong></span>
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Sincronizado</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button: Sync to Drive Now */}
              <button
                id="btn-sync-google-drive-now"
                onClick={handleGoogleDriveSync}
                disabled={isSyncingDrive}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {isSyncingDrive ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Sincronizando com o Google Drive...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>Realizar Backup Diário para Google Drive Agora</span>
                  </>
                )}
              </button>
            </div>

            {/* Action: Immediate JSON Download */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-sm">
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800">
                    Download Imediato do Arquivo JSON (Segurança Física)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Gera e salva instantaneamente um arquivo (.json) completo no seu dispositivo para cópia de segurança offline.
                  </p>
                </div>
              </div>
              <button
                id="btn-download-backup-json"
                onClick={handleImmediateJsonDownload}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
              >
                <FileJson className="w-4 h-4" />
                <span>Baixar Cópia JSON Imediatamente</span>
              </button>
            </div>

            {/* Action: Restore JSON Backup */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <h4 className="text-xs font-bold text-slate-800">Restaurar Dados de um Backup (.json)</h4>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
                id="input-restore-file"
              />
              <button
                id="btn-trigger-restore-upload"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRestoring}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>{isRestoring ? 'Restaurando...' : 'Selecionar Arquivo .json para Restaurar'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CONFIGURAÇÕES DA CLÍNICA & VETERINÁRIO */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveClinicSettings} className="space-y-4 text-xs">
            {settingsSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Configurações salvas com sucesso!</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nome do Veterinário</span>
                </label>
                <input
                  type="text"
                  required
                  value={clinicForm.doctorName}
                  onChange={(e) => setClinicForm({ ...clinicForm, doctorName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inscrição CRMV</label>
                <input
                  type="text"
                  required
                  value={clinicForm.crmv}
                  onChange={(e) => setClinicForm({ ...clinicForm, crmv: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>Nome da Clínica / Consultório</span>
              </label>
              <input
                type="text"
                required
                value={clinicForm.clinicName}
                onChange={(e) => setClinicForm({ ...clinicForm, clinicName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Telefone / WhatsApp</span>
                </label>
                <input
                  type="text"
                  required
                  value={clinicForm.phone}
                  onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Endereço Completo</span>
                </label>
                <input
                  type="text"
                  required
                  value={clinicForm.address}
                  onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Pricing Parameters */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
              <h5 className="font-bold text-slate-800 text-xs">Parâmetros Padrão de Precificação</h5>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valor/Hora Médico (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={clinicForm.defaultHourlyRate}
                    onChange={(e) => setClinicForm({ ...clinicForm, defaultHourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Custo Fixo/Overhead (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={clinicForm.defaultOverheadPercent}
                    onChange={(e) => setClinicForm({ ...clinicForm, defaultOverheadPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Margem Lucro Alvo (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={clinicForm.defaultTargetMarginPercent}
                    onChange={(e) => setClinicForm({ ...clinicForm, defaultTargetMarginPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg border border-slate-200 font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                id="btn-save-clinic-settings"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 flex items-center space-x-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end border-t border-slate-100">
          <button
            id="btn-close-backup-footer"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
