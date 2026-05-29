import { useState } from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  iconRight,
  type = 'text',
  hint,
  style,
  containerStyle,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...containerStyle }}>
      {label && (
        <label style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          userSelect: 'none',
        }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {Icon && (
          <span style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? 'var(--accent)' : 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            transition: 'var(--transition)',
            pointerEvents: 'none',
          }}>
            <Icon size={16} />
          </span>
        )}

        <input
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: Icon ? '10px 12px 10px 38px' : '10px 12px',
            paddingRight: iconRight ? 44 : 12,
            fontSize: '0.9375rem',
            background: 'var(--bg-secondary)',
            border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'var(--transition)',
            boxSizing: 'border-box',
            boxShadow: focused ? (error ? '0 0 0 3px rgba(239,68,68,0.15)' : '0 0 0 3px rgba(99,102,241,0.15)') : 'none',
            ...style,
          }}
          {...props}
        />

        {iconRight && (
          <span style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
          }}>
            {iconRight}
          </span>
        )}
      </div>

      {error && (
        <span style={{
          fontSize: '0.8125rem',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{hint}</span>
      )}
    </div>
  );
}
