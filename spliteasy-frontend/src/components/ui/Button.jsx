import { motion } from 'framer-motion';

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--accent)',
    border: '1.5px solid var(--accent)',
    boxShadow: 'none',
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    boxShadow: 'none',
  },
  subtle: {
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    border: 'none',
    boxShadow: 'none',
  },
};

const sizeStyles = {
  sm: { padding: '6px 14px', fontSize: '0.8125rem', height: '32px', gap: '6px' },
  md: { padding: '10px 20px', fontSize: '0.9375rem', height: '42px', gap: '8px' },
  lg: { padding: '14px 28px', fontSize: '1rem', height: '52px', gap: '10px' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  onClick,
  type = 'button',
  style,
  ...props
}) {
  const vStyle = variantStyles[variant] || variantStyles.primary;
  const sStyle = sizeStyles[size] || sizeStyles.md;
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font)',
        fontWeight: 600,
        borderRadius: 'var(--radius-md)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'var(--transition)',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...vStyle,
        ...sStyle,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span style={{
          width: 16, height: 16,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          flexShrink: 0,
        }} />
      ) : icon ? (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{iconRight}</span>
      )}
    </motion.button>
  );
}
