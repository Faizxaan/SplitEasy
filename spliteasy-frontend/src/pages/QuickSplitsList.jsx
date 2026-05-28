import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, ArrowRight, ArrowLeft, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { listDraftSessions, createDraftSession, deleteDraftSession } from '../api/quickSplits';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Input from '../components/ui/Input';
import { formatCurrency } from '../utils/formatCurrency';
import { formatRelativeTime } from '../utils/formatDate';

const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP'];

function CreateDraftModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Please enter a title'); return; }
    setLoading(true);
    try {
      const r = await createDraftSession({ title: title.trim(), currency });
      toast.success('Quick Split created! 🎉');
      setTitle(''); setCurrency('INR'); setError('');
      onClose();
      onCreate(r.data.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create Quick Split');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Quick Split" maxWidth={420}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input
          label="Session title" placeholder="e.g. Goa Trip, Dinner with friends"
          value={title} onChange={e => { setTitle(e.target.value); setError(''); }}
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
          You'll be added automatically. Add other people after creating the session.
        </p>
        <Button type="submit" fullWidth size="lg" loading={loading} icon={<Zap size={15} />}>
          Create Draft Session
        </Button>
      </form>
    </Modal>
  );
}

export default function DraftList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    listDraftSessions().then(r => setDrafts(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    setConfirmDelete(id);
  };

  const confirmDeletion = async () => {
    await deleteDraftSession(confirmDelete);
    toast.success('Quick Split deleted');
    setDrafts(prev => prev.filter(d => d.id !== confirmDelete));
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
      <CreateDraftModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(id) => navigate(`/quick-splits/${id}`)}
      />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', marginTop: 4, textDecoration: 'none', flexShrink: 0 }}>
              <ArrowLeft size={16} />
            </Link>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: 'clamp(1.25rem, 5vw, 2rem)' }}>Quick Splits</h2>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.25)',
                  padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                }}>
                  <Zap size={10} /> Quick Split
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
        </div>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 120, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <div style={{
          background: 'var(--bg-secondary)', border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚡</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No draft sessions yet</h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Create a quick split session for outings with friends. No sign-up needed for others — just add names and start tracking.
          </p>
          <Button icon={<Zap size={15} />} onClick={() => setShowCreate(true)}>
            Create your first draft
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          <AnimatePresence>
            {drafts.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/quick-splits/${d.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }} transition={{ duration: 0.2 }}
                    style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#F59E0B,#EF4444)', borderRadius: '16px 16px 0 0' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.title}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            {d.participantCount} people · {d.expenseCount} expenses
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button onClick={(e) => handleDelete(e, d.id)} style={{
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
                        {formatCurrency(d.totalAmount, d.currency)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <Clock size={11} /> {formatRelativeTime(d.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
