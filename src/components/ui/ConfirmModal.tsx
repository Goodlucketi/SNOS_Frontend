import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle = 'Action Required',
  message,
  confirmText = 'Okay',
  cancelText = 'Cancel',
  isDestructive = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={<AlertTriangle className="w-5 h-5" />}
      iconColorClass={isDestructive 
        ? "text-red-500 bg-red-500/10 border-red-500/20" 
        : "text-amber-500 bg-amber-500/10 border-amber-500/20"}
      maxWidthClass="max-w-md"
    >
      <div className="p-6 md:p-8 space-y-8">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>{cancelText}</span>
          </button>
          
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:-translate-y-0.5 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/10 hover:shadow-red-500/25'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:shadow-blue-500/25'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
