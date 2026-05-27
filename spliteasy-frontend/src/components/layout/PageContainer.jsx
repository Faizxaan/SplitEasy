import { motion } from 'framer-motion';

export default function PageContainer({ children, maxWidth = 1100, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        paddingTop: 80,
        paddingBottom: 48,
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth, margin: '0 auto', padding: '0 24px', ...style }}>
        {children}
      </div>
    </motion.div>
  );
}
