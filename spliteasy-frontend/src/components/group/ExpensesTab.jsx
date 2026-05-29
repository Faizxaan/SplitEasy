import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical, Pencil, Trash2, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { getExpenses, deleteExpense } from '../../api/expenses';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import { SkeletonCard } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getCategoryInfo } from '../../utils/categoryHelpers';

const CATEGORY_FILTERS = ['ALL', 'FOOD', 'TRANSPORT', 'ACCOMMODATION', 'SHOPPING', 'ENTERTAINMENT', 'UTILITIES', 'OTHER'];

function ExpenseCard({ expense, currency, currentUserId, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const cat = getCategoryInfo(expense.category);
  const mySplit = expense.splits?.find(s => s.userId === currentUserId);
  const iAmPayer = expense.paidBy?.id === currentUserId;

  let myLabel = null, myColor = 'var(--text-tertiary)';
  if (iAmPayer) {
    const otherOwed = (expense.splits || []).filter(s => s.userId !== currentUserId).reduce((a, s) => a + (s.amount || 0), 0);
    if (otherOwed > 0) { myLabel = `+${formatCurrency(otherOwed, currency)}`; myColor = 'var(--success)'; }
    else { myLabel = 'You paid'; myColor = 'var(--success)'; }
  } else if (mySplit) {
    myLabel = formatCurrency(mySplit.amount, currency); myColor = 'var(--danger)';
  } else {
    myLabel = 'Not involved';
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setExpanded(p => !p)}>
        <div style={{ width: 40, height: 40, background: cat.bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>
          {cat.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{expense.description}</p>
          <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-tertiary)' }}>
            Paid by {expense.paidBy?.fullName?.split(' ')[0]} · {formatDate(expense.expenseDate)}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ margin: '0 0 2px', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{formatCurrency(expense.amount, currency)}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: myColor }}>{myLabel}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
          {expanded ? <ChevronUp size={16} color="var(--text-tertiary)" /> : <ChevronDown size={16} color="var(--text-tertiary)" />}
          <div style={{ padding: 4, borderRadius: 'var(--radius-sm)', position: 'relative' }}
            onClick={e => { e.stopPropagation(); setShowMenu(p => !p); }}>
            <MoreVertical size={16} color="var(--text-tertiary)" />
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.1 }}
                  onMouseLeave={() => setShowMenu(false)}
                  style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', minWidth: 140, overflow: 'hidden' }}>
                  {[
                    { label: 'Edit', icon: <Pencil size={14} />, color: 'var(--text-primary)', hover: 'var(--bg-tertiary)', action: () => { setShowMenu(false); onEdit(expense); } },
                    { label: 'Delete', icon: <Trash2 size={14} />, color: 'var(--danger)', hover: 'var(--danger-bg)', action: () => { setShowMenu(false); onDelete(expense); } },
                  ].map(item => (
                    <button key={item.label} onClick={e => { e.stopPropagation(); item.action(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', fontSize: '0.875rem', fontWeight: 500, color: item.color, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = item.hover}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      {item.icon}{item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px 14px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Split: {expense.splitType}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(expense.splits || []).map(split => (
                  <div key={split.id || split.userId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={split.fullName} avatarColor={split.avatarColor} size="xs" />
                    <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{split.fullName}</span>
                    {split.shareValue != null && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        {expense.splitType === 'PERCENTAGE' ? `${split.shareValue}%` : expense.splitType === 'SHARES' ? `${split.shareValue} shares` : ''}
                      </span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: split.userId === expense.paidBy?.id ? 'var(--success)' : 'var(--text-primary)' }}>
                      {formatCurrency(split.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ExpensesTab({ groupId, currency, currentUserId }) {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [catFilter, setCatFilter] = useState('ALL');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback((reset = true) => {
    const p = reset ? 0 : page;
    const params = { page: p, size: 10, sort: `expenseDate,${sortDir}` };
    if (catFilter !== 'ALL') params.category = catFilter;
    setLoading(reset);
    getExpenses(groupId, params).then(res => {
      const data = res.data;
      setExpenses(prev => reset ? data.content : [...prev, ...data.content]);
      setHasMore(!data.last);
      setPage(data.number + 1);
    }).finally(() => setLoading(false));
  }, [groupId, catFilter, sortDir, page]);

  useEffect(() => { setPage(0); setExpenses([]); load(true); }, [groupId, catFilter, sortDir]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExpense(groupId, deleteTarget.id);
      setExpenses(prev => prev.filter(e => e.id !== deleteTarget.id));
      toast.success('Expense deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div style={{ paddingTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 12, scrollbarWidth: 'none' }}
        className="hide-scrollbar">
        {CATEGORY_FILTERS.map(cat => {
          const active = catFilter === cat;
          return (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              padding: '6px 14px', borderRadius: 999, flexShrink: 0,
              border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent-bg)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'var(--transition)',
            }}>
              {cat === 'ALL' ? 'All' : getCategoryInfo(cat).label}
            </button>
          );
        })}
        <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')} style={{
          marginLeft: 'auto', padding: '6px 14px', borderRadius: 999, flexShrink: 0,
          border: '1.5px solid var(--border)', background: 'transparent',
          color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          {sortDir === 'desc' ? 'Newest ↓' : 'Oldest ↑'}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0,1,2,3].map(i => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <SkeletonCard lines={2} />
            </motion.div>
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState icon={Receipt} title="No expenses yet"
          description="Tap the + button to add the first expense!"
          action={() => navigate(`/groups/${groupId}/expenses/new`)} actionLabel="Add Expense" />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expenses.map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ExpenseCard
                  expense={exp} currency={currency} currentUserId={currentUserId}
                  onEdit={exp => navigate(`/groups/${groupId}/expenses/${exp.id}/edit`)}
                  onDelete={setDeleteTarget}
                />
              </motion.div>
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button variant="secondary" size="sm" onClick={() => load(false)}>Load more</Button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Expense">
        <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>
          Delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.description}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)} fullWidth>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
