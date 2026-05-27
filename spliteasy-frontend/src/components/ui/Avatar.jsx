const sizes = {
  xs: { width: 24, height: 24, fontSize: '0.6rem' },
  sm: { width: 32, height: 32, fontSize: '0.75rem' },
  md: { width: 40, height: 40, fontSize: '0.9375rem' },
  lg: { width: 52, height: 52, fontSize: '1.125rem' },
  xl: { width: 64, height: 64, fontSize: '1.375rem' },
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

function getTextColor(hexColor) {
  if (!hexColor) return '#fff';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1E293B' : '#FFFFFF';
}

export default function Avatar({ name, avatarColor, size = 'md', style }) {
  const s = sizes[size] || sizes.md;
  const bg = avatarColor || '#6366F1';
  const textColor = getTextColor(bg);

  return (
    <div
      title={name}
      style={{
        width: s.width,
        height: s.height,
        minWidth: s.width,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s.fontSize,
        fontWeight: 700,
        color: textColor,
        userSelect: 'none',
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {getInitials(name)}
    </div>
  );
}
