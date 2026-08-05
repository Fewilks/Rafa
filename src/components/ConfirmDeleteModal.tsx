import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  itemName,
  description = 'Esta ação é permanente e removerá o registro do sistema. Deseja continuar?',
  onConfirm,
  onCancel,
  confirmButtonText = 'Sim, Excluir Registro',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              <p className="text-xs text-slate-500">Confirmação de Segurança</p>
            </div>
          </div>
          <button
            id="btn-close-delete-modal"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {itemName && (
          <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl">
            <p className="text-xs text-rose-800 font-semibold">
              Item a ser removido: <span className="font-bold underline">{itemName}</span>
            </p>
          </div>
        )}

        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

        <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
          <button
            id="btn-cancel-delete"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-delete"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
