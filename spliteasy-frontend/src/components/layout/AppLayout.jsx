import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

export default function AppLayout() {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <main style={{
        maxWidth: 960,
        margin: '0 auto',
        paddingTop: 76,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
      }}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.div>
      </main>
      <MobileNav />
    </div>
  );
}
