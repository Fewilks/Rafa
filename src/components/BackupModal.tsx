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
} from 'lucide-react';
import { useVetContext } from '../context/VetContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const {
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

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    try {
      exportBackup();
      setFeedback({
        type: 'success',
        message: 'Download do arquivo de backup (JSON) iniciado com sucesso! Guarde este arquivo em local seguro.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Erro ao gerar arquivo de backup. Tente novamente.',
      });
    }
  };

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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-1.5">
                <span>Backup e Segurança dos Dados</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
              </h3>
              <p className="text-xs text-slate-500">
                Exporte e restaure cópias de segurança em formato JSON diretamente no seu dispositivo.
              </p>
            </div>
          </div>
          <button
            id="btn-close-backup-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
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

        {/* Summary of Local Data */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
          <p className="text-xs font-bold text-slate-700 flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Conteúdo Atual do Banco de Dados Local:</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              • <strong className="text-slate-800">{clients.length}</strong> Clientes e{' '}
              <strong className="text-slate-800">{pets.length}</strong> Pets
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              • <strong className="text-slate-800">{consultations.length}</strong> Atendimentos Clínicos
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              • <strong className="text-slate-800">{medications.length}</strong> Medicamentos
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              • <strong className="text-slate-800">{equipments.length}</strong> Insumos / Materiais
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              • <strong className="text-slate-800">{reminders.length}</strong> Lembretes / Vacinas
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              • <strong className="text-slate-800">{transactions.length}</strong> Lançamentos Financeiros
            </div>
          </div>
        </div>

        {/* Action 1: Export/Download Backup */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
              <Download className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">1. Baixar Cópia de Segurança (JSON)</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Gera um arquivo completo de segurança com todos os seus registros para guardar no seu computador ou celular.
              </p>
            </div>
          </div>
          <button
            id="btn-download-backup-json"
            onClick={handleDownloadBackup}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
          >
            <FileJson className="w-4 h-4" />
            <span>Fazer Backup Agora (.json)</span>
          </button>
        </div>

        {/* Action 2: Restore Backup */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
              <Upload className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">2. Restaurar Dados de um Backup (.json)</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Selecione um arquivo de backup previamente salvo para recuperar seus cadastros e atendimentos.
              </p>
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
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>{isRestoring ? 'Restaurando...' : 'Selecionar Arquivo de Backup (.json)'}</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
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
