import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  variant = 'danger',
}) {
  const isDanger = variant === 'danger';
  const Icon = isDanger ? Trash2 : AlertTriangle;
  const iconBg = isDanger ? 'var(--danger-bg)' : 'var(--warning-bg)';
  const iconColor = isDanger ? 'var(--danger)' : 'var(--warning)';

  const handleConfirm = () => {
    onClose();
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth={400}>
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Icon size={24} color={iconColor} />
        </div>

        {/* Title */}
        <h3 style={{
          margin: '0 0 10px',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p style={{
            margin: '0 0 28px',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            {message}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={handleConfirm} fullWidth>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
