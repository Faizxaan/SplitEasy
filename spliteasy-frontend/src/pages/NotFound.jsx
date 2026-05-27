import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, SplitSquareVertical } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--bg-primary)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', maxWidth: 400 }}>

        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeInOut' }}
          style={{ marginBottom: 24 }}>
          <div style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
          }}>
            <SplitSquareVertical size={40} color="#fff" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.05em' }}>404</h1>
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 12px' }}>Page not found</h2>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 32, lineHeight: 1.6 }}>
            Looks like this page went on a trip without splitting the bill.
          </p>
          <Link to="/">
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px',
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              border: 'none', borderRadius: 'var(--radius-md)',
              color: '#fff', fontWeight: 700, fontSize: '0.9375rem',
              cursor: 'pointer', transition: 'var(--transition)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <Home size={18} /> Back to Home
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
