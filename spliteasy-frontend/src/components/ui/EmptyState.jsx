import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: 16,
      }}
    >
      {Icon && (
        <div style={{
          width: 64, height: 64,
          background: 'var(--accent-bg)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
        }}>
          <Icon size={28} />
        </div>
      )}
      <div>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>{title}</h4>
        {description && <p style={{ fontSize: '0.9375rem', maxWidth: 320 }}>{description}</p>}
      </div>
      {action && actionLabel && (
        <Button onClick={action} size="sm">{actionLabel}</Button>
      )}
    </motion.div>
  );
}
