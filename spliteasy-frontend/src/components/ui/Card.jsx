import { motion } from 'framer-motion';

export default function Card({
  children,
  hover = false,
  clickable = false,
  onClick,
  padding = '24px',
  style,
  ...props
}) {
  const base = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    padding,
    ...style,
  };

  if (clickable || onClick) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
        whileTap={{ scale: 0.99 }}
        style={{ ...base, cursor: 'pointer' }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
        style={base}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div style={base} {...props}>
      {children}
    </div>
  );
}
