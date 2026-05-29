import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserGroups, createGroup } from '../api/groups';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { formatCurrency } from '../utils/formatCurrency';
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

function GroupCard({ group, index }) {
  const cat = getCategoryInfo(group.category, 'group');
  const bal = group.userBalance ?? 0;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Link to={`/groups/${group.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <motion.div
          whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px', cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: `${cat.color}18`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
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
    if (name.trim().length > 50) { setError('Group name must not exceed 50 characters'); return; }
    if (!/^[a-zA-Z0-9\s\-_&']+$/.test(name)) { setError('Group name contains invalid characters'); return; }
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
        <Input label="Group name" placeholder="e.g. Goa Trip 2026" value={name} maxLength={50}
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
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
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

export default function GroupsList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getUserGroups().then(r => setGroups(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <CreateGroupModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 4px' }}>Your Groups</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
            All your shared expense groups
          </p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)} size="sm">
          New Group
        </Button>
      </motion.div>

      {loading ? (
        <div className="groups-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {[0,1,2,3].map(i => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : groups.length === 0 ? (
        <div style={{
          background: 'var(--bg-secondary)', border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center',
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

      <style>{`
        @media (max-width: 640px) {
          .groups-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
