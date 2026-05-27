export default function Badge({ children, color, bg, variant = 'default', size = 'md', style }) {
  const sizeStyles = {
    sm: { fontSize: '0.6875rem', padding: '2px 8px', height: 20 },
    md: { fontSize: '0.75rem', padding: '3px 10px', height: 24 },
    lg: { fontSize: '0.8125rem', padding: '4px 12px', height: 28 },
  };

  const variantStyles = {
    default: {
      background: bg || 'var(--bg-tertiary)',
      color: color || 'var(--text-secondary)',
    },
    accent: {
      background: 'var(--accent-bg)',
      color: 'var(--accent)',
    },
    success: {
      background: 'var(--success-bg)',
      color: 'var(--success)',
    },
    danger: {
      background: 'var(--danger-bg)',
      color: 'var(--danger)',
    },
    warning: {
      background: 'var(--warning-bg)',
      color: 'var(--warning)',
    },
  };

  const s = sizeStyles[size] || sizeStyles.md;
  const v = variantStyles[variant] || variantStyles.default;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      borderRadius: 'var(--radius-full)',
      fontWeight: 600,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      ...s,
      ...v,
      ...style,
    }}>
      {children}
    </span>
  );
}
