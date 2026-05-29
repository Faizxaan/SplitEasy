import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, ArrowRight, ArrowLeft, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Input from '../components/ui/Input';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeTime } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import {
  loadSessions, saveSessions, persistSession,
  removeSession, createNewSession,
} from '../utils/guestSessions';

const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP'];

/* ─── Create Session Modal (mirrors CreateDraftModal) ──────── */
function CreateSessionModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Please enter a title'); return; }
    if (title.trim().length > 50) { setError('Title must not exceed 50 characters'); return; }
    if (!/^[a-zA-Z0-9\s\-_&']+$/.test(title)) { setError('Title contains invalid characters'); return; }
    const session = createNewSession(title.trim(), currency);
    persistSession(session);
    toast.success('Quick Split created! 🎉');
    setTitle(''); setCurrency('INR'); setError('');
    onClose();
    onCreate(session.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Quick Split" maxWidth={420}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input
          label="Session title" placeholder="e.g. Goa Trip, Dinner with friends"
          value={title} maxLength={50} onChange={e => { setTitle(e.target.value); setError(''); }}
          error={error} autoFocus
        />
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Currency</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CURRENCY_OPTIONS.map(c => (
              <button key={c} type="button" onClick={() => setCurrency(c)} style={{
                padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.875rem',
                border: `1.5px solid ${currency === c ? 'var(--accent)' : 'var(--border)'}`,
                background: currency === c ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                color: currency === c ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'var(--transition)',
              }}>{c}</button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '-8px 0 0', lineHeight: 1.5 }}>
          Add people and expenses after creating the session.
        </p>
        <Button type="submit" fullWidth size="lg" icon={<Zap size={15} />}>
          Create Quick Split
        </Button>
      </form>
    </Modal>
  );
}

/* ─── Main list page (mirrors DraftList) ───────────────────── */
export default function GuestQuickSplit() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState(() => loadSessions());
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    setConfirmDelete(id);
  };

  const confirmDeletion = () => {
    removeSession(confirmDelete);
    setSessions(loadSessions());
    toast.success('Quick Split deleted');
  };

  return (
    <>
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeletion}
        title="Delete Quick Split?"
        message="This will permanently delete this Quick Split and all its expenses. This cannot be undone."
        confirmLabel="Delete Quick Split"
      />
      <CreateSessionModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(id) => navigate(`/quick-split/${id}`)}
      />

      {/* ── Guest mode banner ──────────────────────────────── */}
      {!isAuthenticated ? (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--accent-bg)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius-lg)', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap',
          }}>
          <Zap size={14} color="var(--accent)" />
          <p style={{ flex: 1, margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Guest mode</strong> — saved in your browser.
            {' '}<Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up free</Link> to save & share sessions across devices.
          </p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap',
          }}>
          <Zap size={14} color="var(--accent)" />
          <p style={{ flex: 1, margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            These sessions are saved locally in your browser.
            {' '}Use <Link to="/quick-splits" style={{ color: 'var(--accent)', fontWeight: 600 }}>My Quick Splits</Link> to get shareable links and cloud sync.
          </p>
        </motion.div>
      )}

      {/* ── Header (mirrors DraftList header) ──────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', marginTop: 4, textDecoration: 'none', flexShrink: 0 }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Quick Splits</h2>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.25)',
                padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
              }}>
                <Zap size={10} /> Quick Split mode
              </span>
            </div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
              Quick splits with guests — no sign-up required for others.
            </p>
          </div>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)} size="sm">
          New Quick Split
        </Button>
      </motion.div>

      {/* ── Session cards ───────────────────────────────────── */}
      {sessions.length === 0 ? (
        <div style={{
          background: 'var(--bg-secondary)', border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚡</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No Quick Split sessions yet</h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Create a quick split session for outings with friends. No sign-up needed for others — just add names and start tracking.
          </p>
          <Button icon={<Zap size={15} />} onClick={() => setShowCreate(true)}>
            Create your first Quick Split
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          <AnimatePresence>
            {sessions.map((s, i) => {
              const total = s.expenses.reduce((sum, e) => sum + e.amount, 0);
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/quick-split/${s.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <motion.div whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }} transition={{ duration: 0.2 }}
                      style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', borderRadius: '16px 16px 0 0' }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.title}
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {s.participants.length} people · {s.expenses.length} expenses
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button onClick={(e) => handleDelete(e, s.id)} style={{
                            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                            borderRadius: 6, transition: 'var(--transition)',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-bg)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'none'; }}
                          >
                            <Trash2 size={13} />
                          </button>
                          <ArrowRight size={15} color="var(--text-tertiary)" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {formatCurrency(total, s.currency)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          <Clock size={11} /> {formatRelativeTime(s.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
