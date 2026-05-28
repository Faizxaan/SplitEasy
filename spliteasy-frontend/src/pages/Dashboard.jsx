import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Equal, Users, ArrowRight, Receipt, Wallet, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboard } from '../api/dashboard';
import { getUserGroups, createGroup } from '../api/groups';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeTime } from '../utils/formatDate';
import { getCategoryInfo } from '../utils/categoryHelpers';

const CATEGORY_OPTIONS = [
  { value: 'TRIP', label: 'Trip', icon: '✈️' },
  { value: 'HOME', label: 'Home', icon: '🏠' },
  { value: 'COUPLE', label: 'Couple', icon: '💑' },
  { value: 'EVENT', label: 'Event', icon: '🎉' },
  { value: 'OTHER', label: 'Other', icon: '📌' },
];

const CURRENCY_OPTIONS = [
  { value: 'INR', label: '₹ INR' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

/* ─── Balance Card ────────────────────────────────── */
function BalanceCard({ label, amount, currency, icon: Icon, type, delay }) {
  const colors = {
    owed:    { accent: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
    owes:    { accent: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
    net_pos: { accent: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
    net_neg: { accent: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
    net_zer: { accent: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)', border: 'var(--border)' },
  };
  const c = colors[type] || colors.net_zer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid var(--border)`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.accent, borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
        <div style={{ width: 36, height: 36, background: c.bg, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${c.border}` }}>
          <Icon size={18} color={c.accent} />
        </div>
      </div>
      <p style={{ fontSize: '1.625rem', fontWeight: 800, color: c.accent, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {formatCurrency(Math.abs(amount), currency)}
      </p>
    </motion.div>
  );
}

/* ─── Group Card ──────────────────────────────────── */
function GroupCard({ group, index }) {
  const cat = getCategoryInfo(group.category, 'group');
  const bal = group.userBalance ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link to={`/groups/${group.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <motion.div
          whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: `${cat.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', flexShrink: 0,
              border: `1px solid ${cat.color}30`,
            }}>
              {cat.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {group.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
              </p>
            </div>
            <ArrowRight size={15} color="var(--text-tertiary)" strokeWidth={2} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {formatCurrency(group.totalExpenses, group.currency)} total
            </span>
            <span style={{
              fontSize: '0.8125rem', fontWeight: 700,
              color: bal > 0 ? 'var(--success)' : bal < 0 ? 'var(--danger)' : 'var(--text-tertiary)',
              background: bal > 0 ? 'var(--success-bg)' : bal < 0 ? 'var(--danger-bg)' : 'var(--bg-tertiary)',
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
            }}>
              {bal === 0 ? 'Settled ✓' : (bal > 0 ? '+' : '') + formatCurrency(bal, group.currency)}
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ─── Activity Item ───────────────────────────────── */
function ActivityItem({ exp, index }) {
  const cat = getCategoryInfo(exp.category);
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link to={`/groups/${exp.groupId}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 40, height: 40, background: cat.bg, borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>
            {cat.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {exp.description}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {exp.groupName} · paid by {exp.paidByName} · {formatRelativeTime(exp.expenseDate)}
            </p>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', flexShrink: 0 }}>
            {formatCurrency(exp.amount, exp.currency)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Create Group Modal ──────────────────────────── */
function CreateGroupModal({ isOpen, onClose, onCreated }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('TRIP');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setName(''); setDescription(''); setCategory('TRIP'); setCurrency('INR'); setError(''); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Group name is required'); return; }
    setLoading(true);
    try {
      const res = await createGroup({ name: name.trim(), description, category, currency });
      toast.success('Group created! 🎉');
      reset(); onClose(); onCreated?.();
      navigate(`/groups/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create a New Group" maxWidth={480}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label="Group name" placeholder="e.g. Goa Trip 2026" value={name}
          onChange={e => { setName(e.target.value); setError(''); }} error={error} autoFocus />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Description <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            maxLength={200} placeholder="What's this group for?" rows={2}
            style={{
              width: '100%', padding: '10px 12px', fontSize: '0.9375rem',
              background: 'var(--bg-secondary)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              resize: 'none', outline: 'none', fontFamily: 'var(--font)',
              boxSizing: 'border-box', transition: 'var(--transition)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Category</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORY_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setCategory(opt.value)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${category === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                background: category === opt.value ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                color: category === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'var(--transition)',
              }}>
                <span>{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Currency</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CURRENCY_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setCurrency(opt.value)} style={{
                padding: '8px 16px', borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${currency === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                background: currency === opt.value ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                color: currency === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'var(--transition)',
              }}>
                {opt.value}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 4 }}>
          Create Group
        </Button>
      </form>
    </Modal>
  );
}

/* ─── Section Header ──────────────────────────────── */
function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <h3 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>{title}</h3>
      {action}
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([getDashboard(), getUserGroups()])
      .then(([dRes, gRes]) => {
        setDashboard(dRes.data);
        setGroups(gRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const currency = groups[0]?.currency || 'INR';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const netBal = dashboard?.overallBalance ?? 0;
  const netType = netBal > 0 ? 'net_pos' : netBal < 0 ? 'net_neg' : 'net_zer';

  return (
    <>
      <CreateGroupModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={loadData} />

      {/* ── Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
      >
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {greeting}, {user?.fullName?.split(' ')[0]}!
            <motion.span animate={{ rotate: [0, 20, 0, 20, 0] }} transition={{ delay: 0.5, duration: 1 }}>👋</motion.span>
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
            {new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
          </p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)} size="sm">
          New Group
        </Button>
      </motion.div>

      {/* ── Balance Cards ───────────────────────────── */}
      <div className="balance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
        {loading ? (
          [0,1,2].map(i => <SkeletonCard key={i} lines={2} />)
        ) : (
          <>
            <BalanceCard label="You are owed" amount={dashboard?.youAreOwed ?? 0} currency={currency} icon={TrendingUp} type="owed" delay={0} />
            <BalanceCard label="You owe" amount={dashboard?.youOwe ?? 0} currency={currency} icon={TrendingDown} type="owes" delay={0.05} />
            <BalanceCard label="Net balance" amount={netBal} currency={currency} icon={netBal >= 0 ? Equal : Wallet} type={netType} delay={0.1} />
          </>
        )}
      </div>

      {/* ── Quick Draft Banner ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ marginBottom: 28 }}
      >
        <Link to="/quick-splits" style={{ textDecoration: 'none', display: 'block' }}>
          <motion.div
            whileHover={{ y: -1, boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }} transition={{ duration: 0.2 }}
            style={{
              background: 'var(--accent-bg)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 'var(--radius-lg)', padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 2px 12px rgba(99,102,241,0.1)',
            }}
          >
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={20} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--accent)', margin: '0 0 2px', fontSize: '0.9375rem' }}>
                Quick Split
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Split bills instantly with guests — no sign-up needed for them
              </p>
            </div>
            <ArrowRight size={16} color="var(--accent)" />
          </motion.div>
        </Link>
      </motion.div>

      {/* ── Groups ─────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <SectionHeader title="Your Groups" action={
          <button onClick={() => setShowCreate(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)',
            background: 'var(--accent-bg)', border: 'none', borderRadius: 'var(--radius-full)',
            padding: '6px 12px', cursor: 'pointer', transition: 'var(--transition)',
          }}>
            <Plus size={13} /> New
          </button>
        } />

        {loading ? (
          <div className="groups-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {[0,1,2,3].map(i => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : groups.length === 0 ? (
          <div style={{
            background: 'var(--bg-secondary)', border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏝️</div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontSize: '1rem' }}>No groups yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 20 }}>
              Create a group to start splitting expenses with friends.
            </p>
            <Button onClick={() => setShowCreate(true)} size="sm" icon={<Plus size={14} />}>
              Create your first group
            </Button>
          </div>
        ) : (
          <div className="groups-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            <AnimatePresence>
              {groups.map((g, i) => <GroupCard key={g.id} group={g} index={i} />)}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Recent Activity ─────────────────────────── */}
      <div>
        <SectionHeader title="Recent Activity" />
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[0,1,2,3,4].map(i => <SkeletonCard key={i} lines={1} />)}
          </div>
        ) : !dashboard?.recentExpenses?.length ? (
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '32px 24px', textAlign: 'center',
          }}>
            <Receipt size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No expenses yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Add an expense to a group to see recent activity here.</p>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {dashboard.recentExpenses.map((exp, i) => (
              <div key={exp.id} style={{ borderBottom: i < dashboard.recentExpenses.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <ActivityItem exp={exp} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 480px) {
          .balance-grid { grid-template-columns: 1fr !important; }
          .groups-grid  { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 481px) and (max-width: 640px) {
          .balance-grid { grid-template-columns: repeat(3,1fr) !important; }
          .groups-grid  { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .balance-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>
    </>
  );
}
