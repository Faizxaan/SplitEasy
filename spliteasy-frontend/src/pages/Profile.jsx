import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Moon, Sun, Users, Receipt, CheckCircle2, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUserGroups } from '../api/groups';
import { getDashboard } from '../api/dashboard';
import Avatar from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Divider from '../components/ui/Divider';
import { formatDate } from '../utils/formatDate';

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ width: 36, height: 36, background: `${color}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      <p style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value ?? '—'}</p>
      <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>{label}</p>
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => document.body.classList.contains('dark'));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [stats, setStats] = useState({ groups: null, settlements: null });

  useEffect(() => {
    Promise.all([getUserGroups(), getDashboard()]).then(([gRes, dRes]) => {
      setStats({ groups: gRes.data.length, settlements: dRes.data.totalSettlements ?? null });
    }).catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.body.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const memberSince = user?.createdAt ? formatDate(user.createdAt) : null;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Profile</h2>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Your account and preferences</p>
      </motion.div>

      {/* Avatar + info */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14 }}>
          <Avatar name={user?.fullName} avatarColor={user?.avatarColor} size="xl" />
          <div>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{user?.fullName}</p>
            <p style={{ margin: '0 0 6px', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{user?.email}</p>
            {memberSince && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} color="var(--text-tertiary)" />
                <span style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)' }}>Member since {memberSince}</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <StatTile icon={Users} label="Groups" value={stats.groups} color="var(--accent)" />
          <StatTile icon={CheckCircle2} label="Settlements" value={stats.settlements} color="var(--success)" />
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card padding="0" style={{ overflow: 'hidden', marginBottom: 14 }}>
          <button onClick={toggleTheme}
            style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <div style={{ width: 36, height: 36, background: 'var(--accent-bg)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dark ? <Sun size={18} color="var(--accent)" /> : <Moon size={18} color="var(--accent)" />}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{dark ? 'Switch to Light' : 'Switch to Dark'}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Theme: {dark ? 'Dark' : 'Light'}</p>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 999, background: dark ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: dark ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </button>

          <Divider style={{ margin: 0 }} />

          <button onClick={() => setShowLogoutConfirm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <div style={{ width: 36, height: 36, background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={18} color="var(--danger)" />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.9375rem' }}>Log Out</span>
          </button>
        </Card>
      </motion.div>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 32 }}>SplitEasy v1.0.0</p>

      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Log Out">
        <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>Are you sure you want to log out?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={logout} fullWidth>Log Out</Button>
        </div>
      </Modal>
    </div>
  );
}
