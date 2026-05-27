import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGroupMembers } from '../api/groups';
import { createExpense, getExpenseDetail, updateExpense } from '../api/expenses';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { getCategoryInfo, EXPENSE_CATEGORIES, SPLIT_TYPES } from '../utils/categoryHelpers';

const CATEGORIES = Object.entries(EXPENSE_CATEGORIES).map(([value, info]) => ({ value, ...info }));
const SPLIT_TYPE_LIST = ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'];

function SectionHeader({ children }) {
  return (
    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>{children}</p>
  );
}

export default function AddExpense() {
  const { groupId, expenseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!expenseId;

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidById, setPaidById] = useState('');
  const [paidByOpen, setPaidByOpen] = useState(false);
  const [splitType, setSplitType] = useState('EQUAL');
  const [splits, setSplits] = useState({});
  const [errors, setErrors] = useState({});
  const [amountFocused, setAmountFocused] = useState(false);

  useEffect(() => {
    getGroupMembers(groupId).then(res => {
      setMembers(res.data);
      const initSplits = {};
      res.data.forEach(m => { initSplits[m.id] = { checked: true, amount: '', percentage: '', shares: 1 }; });
      setSplits(initSplits);
      setPaidById(user?.id || res.data[0]?.id || '');
    }).finally(() => setLoadingMembers(false));
  }, [groupId, user]);

  useEffect(() => {
    if (isEditing && members.length > 0) {
      getExpenseDetail(groupId, expenseId).then(res => {
        const e = res.data;
        setDescription(e.description || '');
        setAmount(String(e.amount || ''));
        setCategory(e.category || 'FOOD');
        setDate(e.expenseDate || new Date().toISOString().split('T')[0]);
        setPaidById(e.paidBy?.id || '');
        setSplitType(e.splitType || 'EQUAL');
        const newSplits = {};
        members.forEach(m => { newSplits[m.id] = { checked: false, amount: '', percentage: '', shares: 1 }; });
        (e.splits || []).forEach(s => {
          newSplits[s.userId] = {
            checked: true,
            amount: String(s.amount || ''),
            percentage: String(s.shareValue || ''),
            shares: s.shareValue || 1,
          };
        });
        setSplits(newSplits);
      });
    }
  }, [isEditing, expenseId, groupId, members.length]);

  const totalAmount = parseFloat(amount) || 0;
  const checkedMembers = members.filter(m => splits[m.id]?.checked);

  const equalShare = useMemo(() => {
    if (splitType !== 'EQUAL' || checkedMembers.length === 0 || totalAmount === 0) return 0;
    return totalAmount / checkedMembers.length;
  }, [splitType, checkedMembers.length, totalAmount]);

  const exactTotal = useMemo(() => {
    if (splitType !== 'EXACT') return 0;
    return checkedMembers.reduce((s, m) => s + (parseFloat(splits[m.id]?.amount) || 0), 0);
  }, [splitType, checkedMembers, splits]);

  const pctTotal = useMemo(() => {
    if (splitType !== 'PERCENTAGE') return 0;
    return checkedMembers.reduce((s, m) => s + (parseFloat(splits[m.id]?.percentage) || 0), 0);
  }, [splitType, checkedMembers, splits]);

  const totalShares = useMemo(() => {
    if (splitType !== 'SHARES') return 0;
    return checkedMembers.reduce((s, m) => s + (parseInt(splits[m.id]?.shares) || 0), 0);
  }, [splitType, checkedMembers, splits]);

  const isValid = useMemo(() => {
    if (!description.trim() || totalAmount <= 0 || checkedMembers.length < 2) return false;
    if (splitType === 'EXACT') return Math.abs(exactTotal - totalAmount) < 0.01;
    if (splitType === 'PERCENTAGE') return Math.abs(pctTotal - 100) < 0.01;
    if (splitType === 'SHARES') return totalShares > 0;
    return true;
  }, [description, totalAmount, checkedMembers.length, splitType, exactTotal, pctTotal, totalShares]);

  const buildSplitPayload = () => {
    return checkedMembers.map(m => {
      const s = splits[m.id];
      const base = { userId: m.id };
      if (splitType === 'EXACT') return { ...base, shareValue: parseFloat(s.amount) || 0 };
      if (splitType === 'PERCENTAGE') return { ...base, shareValue: parseFloat(s.percentage) || 0 };
      if (splitType === 'SHARES') return { ...base, shareValue: parseInt(s.shares) || 1 };
      return base;
    });
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const payload = {
        paidById,
        amount: parseFloat(amount),
        description: description.trim(),
        category,
        expenseDate: date,
        splitType,
        splits: buildSplitPayload(),
      };
      if (isEditing) {
        await updateExpense(groupId, expenseId, payload);
        toast.success('Expense updated!');
      } else {
        await createExpense(groupId, payload);
        toast.success('Expense added! 💸');
      }
      navigate(`/groups/${groupId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally { setSubmitting(false); }
  };

  const updateSplit = (memberId, field, value) => {
    setSplits(prev => ({ ...prev, [memberId]: { ...prev[memberId], [field]: value } }));
  };

  const payer = members.find(m => m.id === paidById);
  const currency = 'INR';

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate(`/groups/${groupId}`)}
          style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={18} color="var(--text-secondary)" />
        </button>
        <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>{isEditing ? 'Edit Expense' : 'Add Expense'}</h3>
      </div>

      {/* Section 1: What */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
        <SectionHeader>What was this for?</SectionHeader>

        <input
          autoFocus
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (e.g. Hotel booking)"
          style={{
            width: '100%', padding: '10px 12px', fontSize: '0.9375rem',
            background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            outline: 'none', marginBottom: 14, boxSizing: 'border-box',
            fontFamily: 'var(--font)', transition: 'var(--transition)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <div
          style={{
            display: 'flex', alignItems: 'center', marginBottom: 16,
            border: `1.5px solid ${amountFocused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)', overflow: 'hidden',
            background: 'var(--bg-tertiary)', transition: 'border-color 0.2s',
          }}
        >
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 60, flexShrink: 0,
            borderRight: `1px solid ${amountFocused ? 'var(--accent)' : 'var(--border)'}`,
            fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent)',
            transition: 'border-color 0.2s',
          }}>₹</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              flex: 1, padding: '0 16px', height: 60,
              fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em',
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font)',
            }}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 999, border: `1.5px solid ${category === cat.value ? cat.color : 'var(--border)'}`,
              background: category === cat.value ? cat.bg : 'transparent',
              color: category === cat.value ? cat.color : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'var(--transition)',
            }}>
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            padding: '8px 12px', fontSize: '0.875rem',
            background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            outline: 'none', fontFamily: 'var(--font)', cursor: 'pointer',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Section 2: Who Paid */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
        <SectionHeader>Who paid?</SectionHeader>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setPaidByOpen(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 14px', background: 'var(--bg-tertiary)',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {payer && <Avatar name={payer.fullName} avatarColor={payer.avatarColor} size="sm" />}
            <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              {payer ? (payer.id === user?.id ? 'You' : payer.fullName) : 'Select member'}
            </span>
            <ChevronDown size={16} color="var(--text-tertiary)" />
          </button>
          <AnimatePresence>
            {paidByOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 50, overflow: 'hidden',
                }}
              >
                {members.map(m => (
                  <button key={m.id} onClick={() => { setPaidById(m.id); setPaidByOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '10px 14px', background: m.id === paidById ? 'var(--accent-bg)' : 'none',
                      border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => { if (m.id !== paidById) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={e => { if (m.id !== paidById) e.currentTarget.style.background = 'none'; }}
                  >
                    <Avatar name={m.fullName} avatarColor={m.avatarColor} size="sm" />
                    <span style={{ fontWeight: 600, color: m.id === paidById ? 'var(--accent)' : 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      {m.id === user?.id ? `${m.fullName} (you)` : m.fullName}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Section 3: Split */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 100 }}>
        <SectionHeader>Split between</SectionHeader>

        {/* Split type pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {SPLIT_TYPE_LIST.map(type => (
            <button key={type} onClick={() => setSplitType(type)} style={{
              flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${splitType === type ? 'var(--accent)' : 'var(--border)'}`,
              background: splitType === type ? 'var(--accent-bg)' : 'transparent',
              color: splitType === type ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--transition)',
            }}>
              {SPLIT_TYPES[type].label}
            </button>
          ))}
        </div>

        {/* Member split rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map(m => {
            const s = splits[m.id] || { checked: true, amount: '', percentage: '', shares: 1 };
            return (
              <motion.div key={m.id} layout style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {splitType === 'EQUAL' && (
                  <input type="checkbox" checked={s.checked}
                    onChange={e => updateSplit(m.id, 'checked', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }} />
                )}
                <Avatar name={m.fullName} avatarColor={m.avatarColor} size="sm" />
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {m.id === user?.id ? 'You' : m.fullName}
                </span>

                {splitType === 'EQUAL' && s.checked && (
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {equalShare > 0 ? formatCurrency(equalShare, currency) : '—'}
                  </span>
                )}

                {splitType === 'EXACT' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" checked={s.checked}
                      onChange={e => updateSplit(m.id, 'checked', e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    <span style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>₹</span>
                    <input type="number" min="0" step="0.01" value={s.amount}
                      onChange={e => updateSplit(m.id, 'amount', e.target.value)}
                      disabled={!s.checked}
                      placeholder="0"
                      style={{
                        width: 80, padding: '6px 8px', textAlign: 'right',
                        background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                        fontSize: '0.9rem', fontWeight: 700, outline: 'none', fontFamily: 'var(--font)',
                        opacity: s.checked ? 1 : 0.4,
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                )}

                {splitType === 'PERCENTAGE' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" checked={s.checked}
                      onChange={e => updateSplit(m.id, 'checked', e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    <input type="number" min="0" max="100" step="0.1" value={s.percentage}
                      onChange={e => updateSplit(m.id, 'percentage', e.target.value)}
                      disabled={!s.checked}
                      placeholder="0"
                      style={{
                        width: 60, padding: '6px 8px', textAlign: 'right',
                        background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                        fontSize: '0.9rem', fontWeight: 700, outline: 'none', fontFamily: 'var(--font)',
                        opacity: s.checked ? 1 : 0.4,
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <span style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>%</span>
                    {s.checked && parseFloat(s.percentage) > 0 && totalAmount > 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        ({formatCurrency(totalAmount * parseFloat(s.percentage) / 100, currency)})
                      </span>
                    )}
                  </div>
                )}

                {splitType === 'SHARES' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => updateSplit(m.id, 'shares', Math.max(0, (s.shares || 1) - 1))}
                      style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--bg-tertiary)', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      −
                    </button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>{s.shares || 0}</span>
                    <button onClick={() => updateSplit(m.id, 'shares', (s.shares || 0) + 1)}
                      style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--bg-tertiary)', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      +
                    </button>
                    {totalShares > 0 && totalAmount > 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', minWidth: 50 }}>
                        {formatCurrency(totalAmount * (s.shares || 0) / totalShares, currency)}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Running totals */}
        <AnimatePresence>
          {splitType === 'EXACT' && totalAmount > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 14, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: Math.abs(exactTotal - totalAmount) < 0.01 ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: Math.abs(exactTotal - totalAmount) < 0.01 ? 'var(--success)' : 'var(--danger)' }}>
                {formatCurrency(exactTotal, currency)} of {formatCurrency(totalAmount, currency)} assigned
                {Math.abs(exactTotal - totalAmount) < 0.01 ? ' ✓' : ` (${formatCurrency(totalAmount - exactTotal, currency)} remaining)`}
              </span>
            </motion.div>
          )}
          {splitType === 'PERCENTAGE' && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 14, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: Math.abs(pctTotal - 100) < 0.01 ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: Math.abs(pctTotal - 100) < 0.01 ? 'var(--success)' : 'var(--danger)' }}>
                {pctTotal.toFixed(1)}% of 100%{Math.abs(pctTotal - 100) < 0.01 ? ' ✓' : ''}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed bottom CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        paddingTop: 12, paddingLeft: 20, paddingRight: 20,
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        zIndex: 80,
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <Button
            fullWidth size="lg"
            loading={submitting}
            disabled={!isValid}
            onClick={handleSubmit}
            style={{ opacity: isValid ? 1 : 0.5 }}
          >
            {isEditing ? 'Save Changes' : `Add Expense${totalAmount > 0 ? ` — ${formatCurrency(totalAmount, currency)}` : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
