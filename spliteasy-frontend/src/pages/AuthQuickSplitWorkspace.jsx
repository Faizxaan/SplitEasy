import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, X, Edit2, Share2, Check,
  Users, Receipt, TrendingDown, Zap, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getDraftSession, addDraftParticipant, removeDraftParticipant,
  addDraftExpense, updateDraftExpense, deleteDraftExpense, deleteDraftSession
} from '../api/quickSplits';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { SkeletonCard } from '../components/ui/Skeleton';
import SplitInputs from '../components/group/SplitInputs';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Avatar from '../components/ui/Avatar';
import { formatCurrency } from '../utils/formatCurrency';

const EXPENSE_CATEGORIES = [
  { value: 'FOOD', label: 'Food & Drinks', icon: '🍽️' },
  { value: 'TRANSPORT', label: 'Transport', icon: '🚗' },
  { value: 'STAY', label: 'Stay', icon: '🏨' },
  { value: 'SHOPPING', label: 'Shopping', icon: '🛍️' },
  { value: 'FUN', label: 'Fun', icon: '🎉' },
  { value: 'UTILITIES', label: 'Utilities', icon: '💡' },
  { value: 'OTHER', label: 'Other', icon: '📌' },
];

const getCatIcon = (cat) => EXPENSE_CATEGORIES.find(c => c.value === cat)?.icon || '📌';

/* ── Avatar chip ────────────────────────────────────────────────────────── */
function ParticipantChip({ p, onRemove, isCreator }) {
  const initials = p.displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', background: 'var(--bg-tertiary)',
      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
      transition: 'var(--transition)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', background: p.avatarColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: 800, color: '#fff', flexShrink: 0,
      }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.displayName}
        </p>
        {p.isCreator && <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700 }}>You</p>}
      </div>
      {!p.isCreator && !isCreator && null}
      {!p.isCreator && (
        <button onClick={() => onRemove(p.id)} style={{
          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
          borderRadius: '50%', transition: 'var(--transition)', flexShrink: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/* ── Add Person Modal ───────────────────────────────────────────────────── */
function AddPersonModal({ isOpen, onClose, onAdded, existingNames }) {
  const [input, setInput] = useState('');
  const [queued, setQueued] = useState([]);
  const [adding, setAdding] = useState(false);
  const inputRef = useRef();

  const PLACEHOLDERS = ['Apple', 'Banana', 'Grape', 'Kiwi', 'Pear', 'Mango', 'Cherry', 'Lemon'];

  const queueName = () => {
    const parts = input.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
    const valid = parts.filter(name => {
      if (name.length > 30) { toast.error(`"${name.slice(0,10)}..." exceeds 30 characters`); return false; }
      if (!/^[a-zA-Z0-9\s\-_&']+$/.test(name)) { toast.error(`"${name}" contains invalid characters`); return false; }
      if (existingNames.includes(name.toLowerCase())) { toast.error(`"${name}" already exists`); return false; }
      if (queued.map(q => q.toLowerCase()).includes(name.toLowerCase())) return false;
      return true;
    });
    if (valid.length) setQueued(prev => [...prev, ...valid]);
    setInput('');
    inputRef.current?.focus();
  };

  const removeQueued = (name) => setQueued(prev => prev.filter(n => n !== name));

  const handleDone = async () => {
    if (!queued.length) { onClose(); return; }
    setAdding(true);
    try {
      for (const name of queued) await onAdded(name);
      setQueued([]); setInput(''); onClose();
    } finally { setAdding(false); }
  };

  const handleClose = () => { setQueued([]); setInput(''); onClose(); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add People" maxWidth={480}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          ref={inputRef} autoFocus value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={150} // allows multiple comma separated names
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); queueName(); } }}
          placeholder="Type a name, or multiple separated by comma"
          style={{
            flex: 1, padding: '10px 12px', fontSize: '0.9rem',
            background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            outline: 'none', fontFamily: 'var(--font)', transition: 'var(--transition)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <Button onClick={queueName} variant="secondary" size="sm" icon={<Plus size={14} />}>Add</Button>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
        Press Enter or click Add to queue names, then Done saves them all.
      </p>

      {queued.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            People to add <span style={{ color: 'var(--accent)' }}>{queued.length} added</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {queued.map(name => (
              <span key={name} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', background: 'var(--accent-bg)', color: 'var(--accent)',
                border: '1px solid var(--accent)', borderRadius: 'var(--radius-full)',
                fontWeight: 600, fontSize: '0.8125rem',
              }}>
                {name}
                <button onClick={() => removeQueued(name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0, display: 'flex' }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          💡 Placeholder names
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PLACEHOLDERS.map(name => (
            <button key={name} onClick={() => {
              if (!existingNames.includes(name.toLowerCase()) && !queued.map(q => q.toLowerCase()).includes(name.toLowerCase()))
                setQueued(prev => [...prev, name]);
            }} style={{
              padding: '5px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 500,
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >{name}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" fullWidth onClick={handleClose}>Cancel</Button>
        <Button fullWidth loading={adding} onClick={handleDone} disabled={queued.length === 0}>
          {queued.length > 0 ? `Done (${queued.length} added)` : 'Done'}
        </Button>
      </div>
    </Modal>
  );
}

/* ── Add Expense Modal ─────────────────────────────────────────────────── */
function AddExpenseModal({ isOpen, onClose, onSaved, participants, currency, editingExpense }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');
  const [saving, setSaving] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [showPayerPicker, setShowPayerPicker] = useState(false);
  const [splits, setSplits] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setDesc(editingExpense.description || '');
        setAmount(String(editingExpense.amount || ''));
        setCategory(editingExpense.category || 'FOOD');
        setPaidBy(editingExpense.paidByParticipantId || '');
        setSplitType(editingExpense.splitType || 'EQUAL');
        
        const newSplits = {};
        participants.forEach(p => { newSplits[p.id] = { checked: false, amount: '', percentage: '', shares: 1 }; });
        (editingExpense.splits || []).forEach(s => {
          newSplits[s.participantId] = {
            checked: true,
            amount: String(s.shareValue || ''),
            percentage: String(s.shareValue || ''),
            shares: s.shareValue || 1,
          };
          if (editingExpense.splitType === 'EXACT' && s.amount !== undefined) {
             newSplits[s.participantId].amount = String(s.amount || s.shareValue || '');
          }
        });
        setSplits(newSplits);
      } else {
        setDesc(''); setAmount(''); setCategory('FOOD'); setSplitType('EQUAL');
        const creator = participants.find(p => p.isCreator);
        setPaidBy(creator?.id || participants[0]?.id || '');
        const newSplits = {};
        participants.forEach(p => { newSplits[p.id] = { checked: true, amount: '', percentage: '', shares: 1 }; });
        setSplits(newSplits);
      }
    }
  }, [isOpen, editingExpense, participants]);

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;

  const payer = participants.find(p => p.id === paidBy);
  const payerInitials = payer ? payer.displayName.slice(0, 2).toUpperCase() : '?';

  const updateSplit = (memberId, field, value) => {
    setSplits(prev => ({ ...prev, [memberId]: { ...prev[memberId], [field]: value } }));
  };

  const handleSave = async () => {
    if (!desc.trim()) { toast.error('Please enter a description'); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Please enter a valid amount'); return; }
    if (!paidBy) { toast.error('Please select who paid'); return; }

    const checkedMembers = participants.filter(m => splits[m.id]?.checked);
    if (checkedMembers.length === 0) { toast.error('Please select at least one person to split with'); return; }

    const totalAmt = parseFloat(amount);
    let finalSplits = [];
    if (splitType === 'EXACT') {
      const exactTotal = checkedMembers.reduce((s, m) => s + (parseFloat(splits[m.id]?.amount) || 0), 0);
      if (Math.abs(exactTotal - totalAmt) >= 0.01) { toast.error('Exact amounts must add up to the total'); return; }
      finalSplits = checkedMembers.map(m => ({ participantId: m.id, participantName: m.displayName, shareValue: parseFloat(splits[m.id].amount) || 0 }));
    } else if (splitType === 'PERCENTAGE') {
      const pctTotal = checkedMembers.reduce((s, m) => s + (parseFloat(splits[m.id]?.percentage) || 0), 0);
      if (Math.abs(pctTotal - 100) >= 0.01) { toast.error('Percentages must add up to 100%'); return; }
      finalSplits = checkedMembers.map(m => ({ participantId: m.id, participantName: m.displayName, shareValue: parseFloat(splits[m.id].percentage) || 0 }));
    } else if (splitType === 'SHARES') {
      const sharesTotal = checkedMembers.reduce((s, m) => s + (parseInt(splits[m.id]?.shares) || 0), 0);
      if (sharesTotal <= 0) { toast.error('Total shares must be greater than 0'); return; }
      finalSplits = checkedMembers.map(m => ({ participantId: m.id, participantName: m.displayName, shareValue: parseInt(splits[m.id].shares) || 1 }));
    } else {
      finalSplits = checkedMembers.map(m => ({ participantId: m.id, participantName: m.displayName }));
    }

    setSaving(true);
    try {
      const payload = {
        description: desc.trim(),
        amount: totalAmt,
        category,
        paidByParticipantId: paidBy,
        splitType,
        expenseDate: new Date().toISOString().split('T')[0],
        splits: finalSplits,
      };
      await onSaved(payload, editingExpense?.id);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingExpense ? 'Edit Expense' : 'Add Expense'} maxWidth={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          autoFocus value={desc} onChange={e => setDesc(e.target.value)}
          maxLength={100}
          placeholder="What was this for? e.g. Hotel booking"
          style={{
            width: '100%', padding: '10px 12px', fontSize: '0.9375rem', boxSizing: 'border-box',
            background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none',
            fontFamily: 'var(--font)', transition: 'var(--transition)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <div style={{
          display: 'flex', alignItems: 'center',
          border: `1.5px solid ${amountFocused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
          background: 'var(--bg-tertiary)', transition: 'border-color 0.2s',
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 56, flexShrink: 0,
            borderRight: `1px solid ${amountFocused ? 'var(--accent)' : 'var(--border)'}`,
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', transition: 'border-color 0.2s',
          }}>{currencySymbol}</span>
          <input
            type="number" min="0" max="99999999.99" step="0.01" value={amount}
            onChange={e => {
              const val = e.target.value;
              if (val && parseFloat(val) > 99999999.99) return;
              setAmount(val);
            }} placeholder="0.00"
            style={{
              flex: 1, padding: '0 16px', height: 56,
              fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em',
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font)',
            }}
            onFocus={() => setAmountFocused(true)} onBlur={() => setAmountFocused(false)}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }} className="hide-scrollbar">
          {EXPENSE_CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
              display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
              padding: '5px 10px', borderRadius: 999, whiteSpace: 'nowrap',
              border: `1.5px solid ${category === cat.value ? 'var(--accent)' : 'var(--border)'}`,
              background: category === cat.value ? 'var(--accent-bg)' : 'transparent',
              color: category === cat.value ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--transition)',
            }}>
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>

        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Who paid?</p>
          <button onClick={() => setShowPayerPicker(true)} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '10px 14px', background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {payer && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: payer.avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>{payerInitials}</div>
            )}
            <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              {payer ? (payer.isCreator ? `${payer.displayName} (you)` : payer.displayName) : 'Select payer'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Change</span>
          </button>
        </div>

        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Split type</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'].map(t => (
              <button key={t} onClick={() => setSplitType(t)} style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.8125rem',
                border: `1.5px solid ${splitType === t ? 'var(--accent)' : 'var(--border)'}`,
                background: splitType === t ? 'var(--accent-bg)' : 'transparent',
                color: splitType === t ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'var(--transition)',
              }}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <SplitInputs
            members={participants}
            splits={splits}
            updateSplit={updateSplit}
            splitType={splitType}
            totalAmount={parseFloat(amount) || 0}
            currency={currency}
            paidById={paidBy}
          />
        </div>

        <Button fullWidth size="lg" loading={saving} onClick={handleSave}>
          {editingExpense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>

      <AnimatePresence>
        {showPayerPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setShowPayerPicker(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-xl)' }}
              onClick={e => e.stopPropagation()}
            >
              <h4 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>Who's paying?</h4>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: 20 }}>Whose wallet is about to cry?</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
                {participants.map(p => {
                  const initials = p.displayName.slice(0, 2).toUpperCase();
                  const isSelected = paidBy === p.id;
                  return (
                    <button key={p.id} onClick={() => { setPaidBy(p.id); setShowPayerPicker(false); }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        border: `2px solid ${isSelected ? p.avatarColor : 'transparent'}`,
                        background: isSelected ? `${p.avatarColor}18` : 'var(--bg-tertiary)',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', background: p.avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', fontWeight: 800, color: '#fff',
                      }}>{initials}</div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.isCreator ? 'You' : p.displayName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

/* ── Share Modal ────────────────────────────────────────────────────────── */
function ShareModal({ isOpen, onClose, shareToken }) {
  const [copied, setCopied] = useState(false);
  const url = shareToken ? `${window.location.origin}/quick-splits/share/${shareToken}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Quick Split Results', url });
    } else handleCopy();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Results" maxWidth={420}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔗</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
          Share this link so everyone can see the split results. No login required to view.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', marginBottom: 16,
        }}>
          <span style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
            {url}
          </span>
          <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--accent)', flexShrink: 0 }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <Button fullWidth icon={<Share2 size={15} />} onClick={handleNativeShare}>
          {copied ? 'Copied!' : 'Share Link'}
        </Button>
      </div>
    </Modal>
  );
}

/* ── Main workspace ─────────────────────────────────────────────────────── */
export default function DraftWorkspace() {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('people');

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [confirmDeleteExpense, setConfirmDeleteExpense] = useState(null);
  const [confirmDeleteDraft, setConfirmDeleteDraft] = useState(false);
  const [confirmRemovePerson, setConfirmRemovePerson] = useState(null);

  const load = useCallback(() => {
    getDraftSession(draftId).then(r => setDraft(r.data)).catch(() => navigate('/quick-splits')).finally(() => setLoading(false));
  }, [draftId, navigate]);

  useEffect(() => { load(); }, [load]);

  const existingNames = draft?.participants?.map(p => p.displayName.toLowerCase()) || [];

  const handleAddPerson = async (name) => {
    const r = await addDraftParticipant(draftId, { displayName: name });
    setDraft(prev => ({ ...prev, participants: [...prev.participants, r.data] }));
  };

  const handleRemovePerson = (participantId) => {
    const hasSplits = draft?.expenses?.some(e =>
      e.splits?.some(s => s.participantId === participantId)
    );
    if (hasSplits) {
      setConfirmRemovePerson(participantId);
    } else {
      doRemovePerson(participantId);
    }
  };

  const doRemovePerson = async (participantId) => {
    await removeDraftParticipant(draftId, participantId);
    load();
  };

  const handleSaveExpense = async (payload, expenseId) => {
    if (expenseId) {
      await updateDraftExpense(draftId, expenseId, payload);
    } else {
      await addDraftExpense(draftId, payload);
    }
    toast.success(expenseId ? 'Expense updated!' : 'Expense added! 💸');
    load();
  };

  const handleDeleteExpense = (expenseId) => {
    setConfirmDeleteExpense(expenseId);
  };

  const confirmExpenseDeletion = async () => {
    await deleteDraftExpense(draftId, confirmDeleteExpense);
    toast.success('Expense deleted');
    load();
  };

  const handleDeleteDraft = () => {
    setConfirmDeleteDraft(true);
  };

  const confirmDraftDeletion = async () => {
    await deleteDraftSession(draftId);
    toast.success('Quick Split deleted');
    navigate('/quick-splits');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  if (!draft) return null;

  const currency = draft.currency || 'INR';
  const participants = draft.participants || [];
  const expenses = draft.expenses || [];
  const settlements = draft.settlements || [];

  /* ── panels ─────────────────────────────────────────────────── */
  const PeoplePanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} color="var(--text-tertiary)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>People</span>
          <span style={{ background: 'var(--accent-bg)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
            {participants.length}
          </span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <AnimatePresence>
          {participants.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ delay: i * 0.04 }}>
              <ParticipantChip p={p} onRemove={handleRemovePerson} />
            </motion.div>
          ))}
        </AnimatePresence>
        {participants.length <= 1 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-tertiary)' }}>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Add people to split with</p>
          </div>
        )}
      </div>
      <Button fullWidth icon={<Plus size={15} />} onClick={() => setShowAddPerson(true)}>
        Add People
      </Button>
    </div>
  );

  const ExpensesPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Receipt size={16} color="var(--text-tertiary)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Expenses</span>
          <span style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
            {currency}
          </span>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
        <AnimatePresence>
          {expenses.map((exp, i) => (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 'var(--radius-md)', transition: 'background 0.15s',
                group: 'expense',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{getCatIcon(exp.category)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {exp.description}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {exp.paidByParticipantName} paid
                  </p>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', flexShrink: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatCurrency(exp.amount, currency)}
                </span>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className="tap-sm" onClick={() => { setEditingExpense(exp); setShowAddExpense(true); }}
                    style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 6, flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                  ><Edit2 size={13} /></button>
                  <button className="tap-sm" onClick={() => handleDeleteExpense(exp.id)}
                    style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 6, flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                  ><Trash2 size={13} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {expenses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: '2rem' }}>🧾</span>
            <p style={{ fontSize: '0.875rem', margin: '8px 0 0' }}>No expenses yet</p>
          </div>
        )}
      </div>
      <Button fullWidth icon={<Plus size={15} />} onClick={() => { setEditingExpense(null); setShowAddExpense(true); }}
        disabled={participants.length < 2}>
        Add Expense
      </Button>
    </div>
  );

  const SettlementPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingDown size={16} color="var(--text-tertiary)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Settlement</span>
        </div>
      </div>

      <div style={{ marginBottom: 16, padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Total Cost</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
          {formatCurrency(draft.totalAmount || 0, currency)}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {settlements.length === 0 && expenses.length > 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <p style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, margin: '8px 0 0' }}>Everyone is settled up!</p>
          </div>
        )}
        {settlements.length === 0 && expenses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-tertiary)' }}>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Add expenses to see who owes what</p>
          </div>
        )}
        <AnimatePresence>
          {settlements.map((debt, i) => {
            const fromInitials = debt.from.displayName.slice(0, 2).toUpperCase();
            const toInitials = debt.to.displayName.slice(0, 2).toUpperCase();
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div style={{
                  padding: '14px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: debt.from.avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                    }}>{fromInitials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {debt.from.isCreator ? 'You' : debt.from.displayName}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        owes {debt.to.isCreator ? 'you' : debt.to.displayName}
                      </p>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--danger)', flexShrink: 0 }}>
                      {formatCurrency(debt.amount, currency)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Button fullWidth icon={<Share2 size={15} />} onClick={() => setShowShare(true)} variant="secondary">
        Share Results
      </Button>
    </div>
  );

  const TABS = [
    { id: 'people', label: 'People', icon: <Users size={15} /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt size={15} /> },
    { id: 'settlement', label: 'Settlement', icon: <TrendingDown size={15} /> },
  ];

  return (
    <>
      <ConfirmDialog
        isOpen={!!confirmRemovePerson}
        onClose={() => setConfirmRemovePerson(null)}
        onConfirm={() => doRemovePerson(confirmRemovePerson)}
        title="Remove person?"
        message="This person has expense splits. Equal splits will be automatically redistributed among the remaining members. Custom splits will be dropped and the expense may no longer balance."
        confirmLabel="Remove & Recalculate"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={!!confirmDeleteExpense}
        onClose={() => setConfirmDeleteExpense(null)}
        onConfirm={confirmExpenseDeletion}
        title="Delete expense?"
        message="This expense will be permanently removed from the draft."
        confirmLabel="Delete Expense"
      />
      <ConfirmDialog
        isOpen={confirmDeleteDraft}
        onClose={() => setConfirmDeleteDraft(false)}
        onConfirm={confirmDraftDeletion}
        title="Delete Quick Split?"
        message="This will permanently delete this Quick Split session, including all people and expenses. This cannot be undone."
        confirmLabel="Delete Quick Split"
      />
      <AddPersonModal isOpen={showAddPerson} onClose={() => setShowAddPerson(false)} onAdded={handleAddPerson} existingNames={existingNames} />
      <AddExpenseModal isOpen={showAddExpense || !!editingExpense && showAddExpense}
        onClose={() => { setShowAddExpense(false); setEditingExpense(null); }}
        onSaved={handleSaveExpense} participants={participants} currency={currency} editingExpense={editingExpense} />
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} shareToken={draft.shareToken} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/quick-splits" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{draft.title}</h3>
              <span className="gqs-badge" style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.25)',
                padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
              }}>
                <Zap size={10} /> Quick Split mode
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {participants.length} people · {expenses.length} expenses
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowShare(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)',
            background: 'var(--bg-secondary)', color: 'var(--accent)', fontWeight: 600,
            fontSize: '0.8125rem', cursor: 'pointer', transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Share2 size={14} /> Share
          </button>
          <button onClick={handleDeleteDraft} style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', color: 'var(--text-tertiary)', transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </motion.div>

      {/* Desktop 3-panel layout */}
      <div className="draft-desktop-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, height: 'calc(100vh - 240px)', minHeight: 480 }}>
        {[
          { panel: PeoplePanel, key: 'people' },
          { panel: ExpensesPanel, key: 'expenses' },
          { panel: SettlementPanel, key: 'settlement' },
        ].map(({ panel, key }) => (
          <div key={key} style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: 20, display: 'flex', flexDirection: 'column',
            overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
          }}>
            {panel}
          </div>
        ))}
      </div>

      {/* Mobile tab layout */}
      <div className="draft-mobile-layout" style={{ display: 'none' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '11px 8px', border: 'none', background: 'none', fontSize: '0.8125rem',
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text-tertiary)',
              cursor: 'pointer', position: 'relative',
            }}>
              {t.icon}{t.label}
              {activeTab === t.id && (
                <motion.div layoutId="draft-tab-underline" style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
              )}
            </button>
          ))}
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, minHeight: 400 }}>
          {activeTab === 'people' && PeoplePanel}
          {activeTab === 'expenses' && ExpensesPanel}
          {activeTab === 'settlement' && SettlementPanel}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .draft-desktop-layout { display: none !important; }
          .draft-mobile-layout  { display: block !important; }
        }
        @media (max-width: 460px) {
          .gqs-badge { display: none !important; }
        }
      `}</style>
    </>
  );
}
