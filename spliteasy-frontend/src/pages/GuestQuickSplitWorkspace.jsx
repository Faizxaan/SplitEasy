import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, X, Edit2, Check,
  Users, Receipt, TrendingDown, Zap, Copy, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatCurrency } from '../utils/formatCurrency';
import {
  loadSession, persistSession, removeSession,
  getAvatarColor, computeSettlements,
} from '../utils/guestSessions';
import SplitInputs from '../components/group/SplitInputs';

const EXPENSE_CATEGORIES = [
  { value: 'FOOD',      label: 'Food & Drinks', icon: '🍽️' },
  { value: 'TRANSPORT', label: 'Transport',      icon: '🚗' },
  { value: 'STAY',      label: 'Stay',           icon: '🏨' },
  { value: 'SHOPPING',  label: 'Shopping',       icon: '🛍️' },
  { value: 'FUN',       label: 'Fun',            icon: '🎉' },
  { value: 'UTILITIES', label: 'Utilities',      icon: '💡' },
  { value: 'OTHER',     label: 'Other',          icon: '📌' },
];

const getCatIcon = (cat) => EXPENSE_CATEGORIES.find(c => c.value === cat)?.icon || '📌';

/* ── Participant Chip (identical to DraftWorkspace) ─────────────────────── */
function ParticipantChip({ p, onRemove }) {
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
      </div>
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
    </div>
  );
}

/* ── Add Person Modal (identical to DraftWorkspace) ─────────────────────── */
function AddPersonModal({ isOpen, onClose, onAdded, existingNames }) {
  const [input, setInput] = useState('');
  const [queued, setQueued] = useState([]);
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

  const handleDone = () => {
    if (!queued.length) { onClose(); return; }
    onAdded(queued);
    setQueued([]); setInput(''); onClose();
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
        <Button fullWidth onClick={handleDone} disabled={queued.length === 0}>
          {queued.length > 0 ? `Done (${queued.length} added)` : 'Done'}
        </Button>
      </div>
    </Modal>
  );
}

/* ── Expense Row ────────────────────────────────────────────────────────── */
function ExpenseRow({ exp, currency, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: expanded ? 'flex-start' : 'center', gap: 10, padding: '10px 12px',
      borderRadius: 'var(--radius-md)', transition: 'background 0.15s', cursor: 'pointer'
    }}
      onClick={() => setExpanded(e => !e)}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      title={!expanded ? "Click to expand details" : ""}
    >
      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{getCatIcon(exp.category)}</span>
      <div style={{ flex: '1 1 auto', minWidth: 0, paddingRight: 8 }}>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: expanded ? 'clip' : 'ellipsis', whiteSpace: expanded ? 'normal' : 'nowrap', wordBreak: 'break-word' }}>
          {exp.description}
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {exp.paidByParticipantName} paid
        </p>
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', flexShrink: 1, minWidth: 0, maxWidth: expanded ? '100%' : '45%', overflow: 'hidden', textOverflow: expanded ? 'clip' : 'ellipsis', whiteSpace: expanded ? 'normal' : 'nowrap', textAlign: 'right', wordBreak: 'break-word' }}>
        {formatCurrency(exp.amount, currency)}
      </span>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginTop: expanded ? -2 : 0 }}>
        <button className="tap-sm" onClick={(e) => { e.stopPropagation(); onEdit(exp); }}
          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 6, flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        ><Edit2 size={13} /></button>
        <button className="tap-sm" onClick={(e) => { e.stopPropagation(); onDelete(exp.id); }}
          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 6, flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        ><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

/* ── Add / Edit Expense Modal (identical to DraftWorkspace) ─────────────── */
function AddExpenseModal({ isOpen, onClose, onSaved, participants, currency, editingExpense }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [splitType, setSplitType] = useState('EQUAL');
  const [amountFocused, setAmountFocused] = useState(false);
  const [showPayerPicker, setShowPayerPicker] = useState(false);
  const [paidBy, setPaidBy] = useState('');
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
        setPaidBy(participants[0]?.id || '');
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

  const handleSave = () => {
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
      finalSplits = checkedMembers.map(m => ({ participantId: m.id, participantName: m.displayName, shareValue: parseFloat(splits[m.id].amount) || 0, amount: parseFloat(splits[m.id].amount) || 0 }));
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

    const payload = {
      description: desc.trim(),
      amount: totalAmt,
      category,
      paidByParticipantId: paidBy,
      paidByParticipantName: payer?.displayName || '',
      splitType,
      expenseDate: new Date().toISOString().split('T')[0],
      splits: finalSplits,
    };
    onSaved(payload, editingExpense?.id);
    onClose();
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
              {payer ? payer.displayName : 'Select payer'}
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

        <Button fullWidth size="lg" onClick={handleSave}>
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
                        {p.displayName}
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

/* ── helpers for share encoding ─────────────────────────────────────────── */
function encodeShareData(session) {
  const data = {
    title: session.title,
    currency: session.currency,
    participants: session.participants.map(({ id, displayName, avatarColor }) => ({ id, displayName, avatarColor })),
    expenses: session.expenses.map(({ id, description, amount, category, paidByParticipantId, paidByParticipantName }) =>
      ({ id, description, amount, category, paidByParticipantId, paidByParticipantName })),
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/* ── Guest share modal — no login required ──────────────────────────────── */
function GuestShareModal({ isOpen, onClose, session }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const textareaRef = useRef(null);

  if (!session) return null;

  const shareUrl = `${window.location.origin}/quick-split/view?d=${encodeShareData(session)}`;

  const settlements = computeSettlements(session.participants, session.expenses);
  const total = session.expenses.reduce((sum, e) => sum + e.amount, 0);

  const textSummary = [
    `*${session.title}* — Split Summary`,
    `Total: ${formatCurrency(total, session.currency)}`,
    '',
    settlements.length === 0
      ? '✅ Everyone is settled up!'
      : settlements.map(s => `• ${s.from.displayName} → ${s.to.displayName}: ${formatCurrency(s.amount, session.currency)}`).join('\n'),
    '',
    `View details: ${shareUrl}`,
  ].join('\n');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500);
      toast.success('Link copied!');
    } catch {
      toast.error('Could not copy — please copy the link manually');
    }
  };

  const copyText = async () => {
    setShowTextPreview(true);
    try {
      await navigator.clipboard.writeText(textSummary);
      setTextCopied(true); setTimeout(() => setTextCopied(false), 2500);
      toast.success('Summary copied!');
    } catch {
      toast('Select the text below and press Ctrl+C / Cmd+C', { icon: 'ℹ️' });
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 50);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Results" maxWidth={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '12px 14px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Share link</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 10px', wordBreak: 'break-all', lineHeight: 1.4 }}>
            {shareUrl.slice(0, 72)}{shareUrl.length > 72 ? '…' : ''}
          </p>
          <Button fullWidth size="sm" icon={<Copy size={13} />} onClick={copyLink} variant={linkCopied ? 'secondary' : 'primary'}>
            {linkCopied ? '✓ Copied!' : 'Copy Share Link'}
          </Button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '8px 0 0', textAlign: 'center' }}>
            Anyone with this link can view the results — no login needed
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div>
          <Button fullWidth size="sm" variant="secondary" icon={<Copy size={13} />} onClick={copyText}>
            {textCopied ? '✓ Copied!' : 'Copy as Text (WhatsApp / SMS)'}
          </Button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '8px 0 0', textAlign: 'center' }}>
            {showTextPreview && !textCopied ? 'Click inside the box below and press Ctrl+C / Cmd+C' : 'Copies a formatted summary you can paste anywhere'}
          </p>
        </div>

        <AnimatePresence>
          {showTextPreview && (
            <motion.textarea
              ref={textareaRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 130 }}
              exit={{ opacity: 0, height: 0 }}
              readOnly
              value={textSummary}
              onClick={e => { e.target.focus(); e.target.select(); }}
              style={{
                width: '100%', resize: 'none', boxSizing: 'border-box',
                padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.78rem',
                lineHeight: 1.6, color: 'var(--text-secondary)',
                background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)', outline: 'none',
                cursor: 'text', overflow: 'auto',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.select(); }}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

/* ── Main workspace ─────────────────────────────────────────────────────── */
export default function GuestQuickSplitWorkspace() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('people');

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [confirmDeleteExpense, setConfirmDeleteExpense] = useState(null);
  const [confirmDeleteSession, setConfirmDeleteSession] = useState(false);
  const [confirmRemovePerson, setConfirmRemovePerson] = useState(null);

  useEffect(() => {
    const s = loadSession(sessionId);
    if (!s) { navigate('/quick-split'); return; }
    setSession(s);
  }, [sessionId, navigate]);

  const save = (updated) => {
    persistSession(updated);
    setSession(updated);
  };

  const handleAddPeople = (names) => {
    const base = session.participants.length;
    const newPs = names.map((name, i) => ({
      id: crypto.randomUUID(),
      displayName: name,
      avatarColor: getAvatarColor(base + i),
    }));
    save({ ...session, participants: [...session.participants, ...newPs] });
  };

  const handleRemovePerson = (participantId) => {
    const hasSplits = session.expenses.some(e =>
      e.splits?.some(s => s.participantId === participantId)
    );
    if (hasSplits) {
      setConfirmRemovePerson(participantId);
    } else {
      doRemovePerson(participantId);
    }
  };

  const doRemovePerson = (participantId) => {
    const participants = session.participants.filter(p => p.id !== participantId);
    const expenses = session.expenses.map(e => {
      if (e.paidByParticipantId === participantId) {
        const fallback = participants[0];
        return {
          ...e,
          paidByParticipantId: fallback?.id || '',
          paidByParticipantName: fallback?.displayName || '',
          splits: participants.map(p => ({ participantId: p.id, participantName: p.displayName })),
        };
      }
      return {
        ...e,
        splits: participants.map(p => ({ participantId: p.id, participantName: p.displayName })),
      };
    }).filter(e => participants.length >= 1);
    save({ ...session, participants, expenses });
    toast.success('Person removed');
  };

  const handleSaveExpense = (payload, expenseId) => {
    if (expenseId) {
      const expenses = session.expenses.map(e => e.id === expenseId
        ? {
            ...e,
            ...payload,
          }
        : e
      );
      save({ ...session, expenses });
      toast.success('Expense updated!');
    } else {
      const newExp = {
        id: crypto.randomUUID(),
        ...payload,
      };
      save({ ...session, expenses: [...session.expenses, newExp] });
      toast.success('Expense added! 💸');
    }
  };

  const handleDeleteExpense = (expenseId) => setConfirmDeleteExpense(expenseId);

  const confirmExpenseDeletion = () => {
    save({ ...session, expenses: session.expenses.filter(e => e.id !== confirmDeleteExpense) });
    toast.success('Expense deleted');
  };

  const confirmSessionDeletion = () => {
    removeSession(sessionId);
    toast.success('Quick Split deleted');
    navigate('/quick-split');
  };

  if (!session) return null;

  const { currency, participants, expenses } = session;
  const settlements = computeSettlements(participants, expenses);
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const existingNames = participants.map(p => p.displayName.toLowerCase());

  /* ── panels ─────────────────────────────────────────────── */
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
      <Button fullWidth icon={<UserPlus size={15} />} onClick={() => setShowAddPerson(true)}>
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
              <ExpenseRow
                exp={exp}
                currency={currency}
                onEdit={(e) => { setEditingExpense(e); setShowAddExpense(true); }}
                onDelete={handleDeleteExpense}
              />
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
          {formatCurrency(totalAmount, currency)}
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
                        {debt.from.displayName}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        owes {debt.to.displayName}
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

      <Button fullWidth icon={<Copy size={15} />} onClick={() => setShowShare(true)} variant="secondary">
        Share Results
      </Button>
    </div>
  );

  const TABS = [
    { id: 'people',     label: 'People',     icon: <Users size={15} /> },
    { id: 'expenses',   label: 'Expenses',   icon: <Receipt size={15} /> },
    { id: 'settlement', label: 'Settlement', icon: <TrendingDown size={15} /> },
  ];

  return (
    <>
      <ConfirmDialog
        isOpen={!!confirmRemovePerson}
        onClose={() => setConfirmRemovePerson(null)}
        onConfirm={() => doRemovePerson(confirmRemovePerson)}
        title="Remove person?"
        message="This person has expense splits. Equal splits will be automatically redistributed among the remaining members."
        confirmLabel="Remove & Recalculate"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={!!confirmDeleteExpense}
        onClose={() => setConfirmDeleteExpense(null)}
        onConfirm={confirmExpenseDeletion}
        title="Delete expense?"
        message="This expense will be permanently removed from the session."
        confirmLabel="Delete Expense"
      />
      <ConfirmDialog
        isOpen={confirmDeleteSession}
        onClose={() => setConfirmDeleteSession(false)}
        onConfirm={confirmSessionDeletion}
        title="Delete Quick Split?"
        message="This will permanently delete this Quick Split session, including all people and expenses. This cannot be undone."
        confirmLabel="Delete Quick Split"
      />
      <AddPersonModal
        isOpen={showAddPerson}
        onClose={() => setShowAddPerson(false)}
        onAdded={handleAddPeople}
        existingNames={existingNames}
      />
      <AddExpenseModal
        isOpen={showAddExpense || (!!editingExpense && showAddExpense)}
        onClose={() => { setShowAddExpense(false); setEditingExpense(null); }}
        onSaved={handleSaveExpense}
        participants={participants}
        currency={currency}
        editingExpense={editingExpense}
      />
      <GuestShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        session={session}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/quick-split" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{session.title}</h3>
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
            <Copy size={14} /> Share
          </button>
          <button onClick={() => setConfirmDeleteSession(true)} style={{
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
          { panel: PeoplePanel,     key: 'people' },
          { panel: ExpensesPanel,   key: 'expenses' },
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
                <motion.div layoutId="gqs-tab-underline" style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
              )}
            </button>
          ))}
        </div>
        <div className="workspace-mobile-panel" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, minHeight: 400 }}>
          {activeTab === 'people'     && PeoplePanel}
          {activeTab === 'expenses'   && ExpensesPanel}
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
