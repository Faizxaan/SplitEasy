import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGroupBalances, getSimplifiedDebts } from '../../api/balances';
import { getGroupSettlements, createSettlement, deleteSettlement } from '../../api/settlements';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { SkeletonCard } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatRelativeTime } from '../../utils/formatDate';

/* ─── Animated balance bar ───────────────────────── */
function BalanceBar({ value, max, currency }) {
  const pct = max === 0 ? 0 : Math.min(Math.abs(value) / max, 1);
  const isPositive = value > 0;
  const isZero = value === 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
      {/* Left (negative) bar */}
      <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 999, overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: !isPositive && !isZero ? `${pct * 100}%` : '0%' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{ height: '100%', background: 'var(--danger)', borderRadius: 999 }}
        />
      </div>
      {/* Center dot */}
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: isZero ? 'var(--text-tertiary)' : isPositive ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }} />
      {/* Right (positive) bar */}
      <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 999, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isPositive ? `${pct * 100}%` : '0%' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{ height: '100%', background: 'var(--success)', borderRadius: 999 }}
        />
      </div>
    </div>
  );
}

/* ─── Settlement Modal ───────────────────────────── */
function SettlementModal({ isOpen, onClose, debt, currency, onSettled }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && debt) { setAmount(String(debt.amount)); setNote(''); }
  }, [isOpen, debt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) { toast.error('Enter a valid amount'); return; }
    setLoading(true);
    try {
      await createSettlement(debt.groupId, {
        paidToId: debt.to.id,
        amount: val,
        note: note.trim() || null,
        settledAt: new Date().toISOString(),
      });
      toast.success('Settlement recorded! 🎉');
      onSettled?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record settlement');
    } finally { setLoading(false); }
  };

  if (!debt) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Settlement" maxWidth={440}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '16px', background: 'var(--accent-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent)', opacity: 0.9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={debt.from.fullName} avatarColor={debt.from.avatarColor} size="sm" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{debt.from.fullName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'var(--accent)', borderRadius: '50%' }}>
            <ArrowRight size={16} color="#fff" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={debt.to.fullName} avatarColor={debt.to.avatarColor} size="sm" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{debt.to.fullName}</span>
          </div>
        </div>

        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          autoFocus
        />

        <Input
          label="Note (optional)"
          placeholder="e.g. Paid via UPI"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} fullWidth type="button">Cancel</Button>
          <Button type="submit" fullWidth loading={loading}>Record Settlement</Button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Settlement History ─────────────────────────── */
function SettlementHistory({ groupId, currency, refresh }) {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getGroupSettlements(groupId).then(res => setSettlements(res.data)).finally(() => setLoading(false));
  }, [groupId]);

  useEffect(() => { load(); }, [load, refresh]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSettlement(groupId, deleteTarget.id);
      setSettlements(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.success('Settlement removed');
    } catch (err) {
      toast.error('Failed to delete settlement');
    } finally { setDeleting(false); setDeleteTarget(null); }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
      {[0,1,2].map(i => <SkeletonCard key={i} lines={1} />)}
    </div>
  );

  if (settlements.length === 0) return (
    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>No settlements recorded yet.</p>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      {settlements.map((s, i) => {
        const canDelete = s.paidBy?.id === user?.id;
        return (
          <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            layout exit={{ opacity: 0, x: -20 }}>
            <Card padding="12px 14px" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'var(--success-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={16} color="var(--success)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--accent)' }}>{s.paidBy?.fullName?.split(' ')[0]}</span>
                  {' paid '}
                  <span style={{ color: 'var(--success)' }}>{s.paidTo?.fullName?.split(' ')[0]}</span>
                  {' · '}
                  <span style={{ fontWeight: 800 }}>{formatCurrency(s.amount, currency)}</span>
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} />{formatRelativeTime(s.settledAt || s.createdAt)}
                  {s.note && <span> · {s.note}</span>}
                </p>
              </div>
              {canDelete && (
                <button onClick={() => setDeleteTarget(s)}
                  style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 'var(--radius-sm)', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                  aria-label="Delete settlement">
                  <Trash2 size={14} />
                </button>
              )}
            </Card>
          </motion.div>
        );
      })}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Settlement">
        <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>Remove this settlement record? The balances will be recalculated.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)} fullWidth>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete} fullWidth>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ─── All Settled Celebration ────────────────────── */
function AllSettled() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      style={{ textAlign: 'center', padding: '32px 24px' }}>
      <motion.div
        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</motion.div>
      <p style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: 6 }}>All settled up!</p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>Everyone is even. Time to celebrate!</p>
    </motion.div>
  );
}

/* ─── Main BalancesTab ───────────────────────────── */
export default function BalancesTab({ groupId, currency }) {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [settleDebt, setSettleDebt] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const loadBalances = useCallback(() => {
    setLoadingMain(true);
    Promise.all([getGroupBalances(groupId), getSimplifiedDebts(groupId)])
      .then(([bRes, dRes]) => { setBalances(bRes.data); setDebts(dRes.data); })
      .finally(() => setLoadingMain(false));
  }, [groupId]);

  useEffect(() => { loadBalances(); }, [loadBalances]);

  const maxAbs = Math.max(...balances.map(b => Math.abs(b.netBalance)), 1);

  const handleSettled = () => { loadBalances(); setHistoryRefresh(r => r + 1); };

  return (
    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Member Balances */}
      <div>
        <h4 style={{ color: 'var(--text-primary)', margin: '0 0 14px', fontWeight: 700 }}>Member Balances</h4>
        {loadingMain ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1,2].map(i => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {balances.map((b, i) => (
              <motion.div key={b.user.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <Card padding="14px 16px">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <Avatar name={b.user.fullName} avatarColor={b.user.avatarColor} size="sm" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '0.9375rem' }}>
                        {b.user.id === user?.id ? 'You' : b.user.fullName}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-tertiary)' }}>
                        Paid {formatCurrency(b.totalPaid, currency)} · Owes {formatCurrency(b.totalOwed, currency)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {b.netBalance === 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                          <CheckCircle2 size={14} /> settled
                        </span>
                      ) : (
                        <>
                          <p style={{ margin: '0 0 1px', fontWeight: 800, fontSize: '0.9375rem', color: b.netBalance > 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {b.netBalance > 0 ? '+' : ''}{formatCurrency(b.netBalance, currency)}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: b.netBalance > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                            {b.netBalance > 0 ? 'gets back' : 'owes'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <BalanceBar value={b.netBalance} max={maxAbs} currency={currency} />
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Simplified Debts */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Sparkles size={18} color="var(--accent)" />
          <h4 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>Simplified Settlements</h4>
        </div>
        {!loadingMain && debts.length > 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 14 }}>
            Settle everything in just {debts.length} transaction{debts.length !== 1 ? 's' : ''} ✨
          </p>
        )}

        {loadingMain ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1].map(i => <SkeletonCard key={i} lines={1} />)}
          </div>
        ) : debts.length === 0 ? (
          <AllSettled />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence>
              {debts.map((debt, i) => {
                const isMyDebt = debt.from.id === user?.id || debt.to.id === user?.id;
                const iAmPayer = debt.from.id === user?.id;
                return (
                  <motion.div key={`${debt.from.id}-${debt.to.id}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                    transition={{ delay: i * 0.07 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px',
                      background: 'var(--bg-secondary)',
                      border: `1.5px solid ${isMyDebt ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: isMyDebt ? '0 0 0 3px var(--accent-bg)' : 'none',
                    }}>
                      <Avatar name={debt.from.fullName} avatarColor={debt.from.avatarColor} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span style={{ color: 'var(--danger)' }}>{debt.from.id === user?.id ? 'You' : debt.from.fullName}</span>
                          {' → '}
                          <span style={{ color: 'var(--success)' }}>{debt.to.id === user?.id ? 'You' : debt.to.fullName}</span>
                        </p>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {formatCurrency(debt.amount, currency)}
                        </p>
                      </div>
                      <motion.div animate={{ x: [0, 3, 0] }} transition={{ repeat: isMyDebt ? Infinity : 0, duration: 1.5 }}>
                        <ArrowRight size={18} color={isMyDebt ? 'var(--accent)' : 'var(--text-tertiary)'} />
                      </motion.div>
                      <Avatar name={debt.to.fullName} avatarColor={debt.to.avatarColor} size="sm" />
                      {iAmPayer ? (
                        <Button size="sm" variant="primary"
                          onClick={() => setSettleDebt({ ...debt, groupId, currency })}>
                          Settle
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>awaiting</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Settlement History toggle */}
      <div>
        <button onClick={() => setShowHistory(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', padding: 0 }}>
          <Clock size={15} />
          Settlement History
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
              <SettlementHistory groupId={groupId} currency={currency} refresh={historyRefresh} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SettlementModal
        isOpen={!!settleDebt}
        onClose={() => setSettleDebt(null)}
        debt={settleDebt}
        currency={currency}
        onSettled={handleSettled}
      />
    </div>
  );
}
