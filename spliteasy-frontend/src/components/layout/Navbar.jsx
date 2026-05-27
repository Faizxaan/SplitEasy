import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SplitSquareVertical, LayoutDashboard, LogOut, Moon, Sun, UserCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const dropdownItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={15} />, onClick: () => navigate('/dashboard') },
    { label: 'Profile', icon: <UserCircle size={15} />, onClick: () => navigate('/profile') },
    { divider: true },
    { label: 'Log Out', icon: <LogOut size={15} />, danger: true, onClick: logout },
  ];

  const transparent = !scrolled && !isAuthenticated;
  const navTextColor = 'var(--text-primary)';
  const navBorderColor = 'var(--border)';

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 100,
        background: transparent ? 'transparent' : 'var(--bg-secondary)',
        backdropFilter: transparent ? 'none' : 'blur(12px)',
        borderBottom: transparent ? 'none' : '1px solid var(--border)',
        transition: 'var(--transition-slow)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SplitSquareVertical size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: navTextColor, letterSpacing: '-0.02em' }}>
            SplitEasy
          </span>
        </Link>

        {/* Desktop actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setDark(d => !d)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36,
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${navBorderColor}`,
              background: transparent ? 'rgba(255,255,255,0.7)' : 'var(--bg-secondary)',
              color: transparent ? '#475569' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <Dropdown
              trigger={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 'var(--radius-md)', transition: 'var(--transition)' }}>
                  <Avatar name={user?.fullName} avatarColor={user?.avatarColor} size="sm" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.fullName?.split(' ')[0]}</span>
                </div>
              }
              items={dropdownItems}
            />
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="nav-login-btn">
                <button style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${navBorderColor}`, background: 'transparent',
                  fontSize: '0.875rem', fontWeight: 600, color: navTextColor,
                  cursor: 'pointer', transition: 'var(--transition)',
                }}>Log in</button>
              </Link>
              <Link to="/register">
                <button style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  fontSize: '0.875rem', fontWeight: 600, color: '#fff',
                  cursor: 'pointer', transition: 'var(--transition)',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                }}>Get Started</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
