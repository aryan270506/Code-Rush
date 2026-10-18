import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          {variant === 'danger' && <AlertCircle className="h-5 w-5 text-[#EF4444]" />}
          {variant === 'warning' && <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />}
          {variant === 'primary' && <Info className="h-5 w-5 text-[#8B5CF6]" />}
          <span>{title}</span>
        </div>
      }
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-xs sm:text-sm text-[#A5ADCA] leading-relaxed">{description}</p>
    </Modal>
  );
};
