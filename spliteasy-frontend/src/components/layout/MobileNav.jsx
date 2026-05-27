import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, UserCircle, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home', match: '/dashboard' },
  { to: '/groups', icon: Users, label: 'Groups', match: '/groups' },
  { to: '/quick-splits', icon: Zap, label: 'Quick Splits', match: '/quick-splits' },
  { to: '/profile', icon: UserCircle, label: 'Profile', match: '/profile' },
];

export default function MobileNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 64,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 90,
      backdropFilter: 'blur(12px)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}
    className="mobile-nav"
    >
      {tabs.map(({ to, icon: Icon, label, match }) => {
        const active = location.pathname === match || location.pathname.startsWith(match + '/');
        return (
          <Link
            key={match}
            to={to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 16px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              position: 'relative',
              minWidth: 60,
            }}
          >
            {active && (
              <motion.div
                layoutId="mobile-nav-indicator"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--accent-bg)',
                  borderRadius: 'var(--radius-md)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon
              size={22}
              color={active ? 'var(--accent)' : 'var(--text-tertiary)'}
              strokeWidth={active ? 2.5 : 1.75}
            />
            <span style={{
              fontSize: '0.65rem',
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--accent)' : 'var(--text-tertiary)',
              letterSpacing: '0.01em',
            }}>
              {label}
            </span>
          </Link>
        );
      })}

      <style>{`
        @media (min-width: 769px) { .mobile-nav { display: none !important; } }
      `}</style>
    </nav>
  );
}
