export default function Divider({ text, style }) {
  if (!text) {
    return (
      <hr style={{
        border: 'none',
        borderTop: '1px solid var(--border)',
        margin: '8px 0',
        ...style,
      }} />
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '8px 0',
      ...style,
    }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', fontWeight: 500 }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}
