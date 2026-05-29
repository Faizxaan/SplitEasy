import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../ui/Avatar';
import { formatCurrency } from '../../utils/formatCurrency';

export default function SplitInputs({
  members,
  splits,
  updateSplit,
  splitType,
  totalAmount,
  currency,
  paidById,
  currentUserId,
}) {
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

  return (
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
            <Avatar name={m.displayName || m.fullName} avatarColor={m.avatarColor} size="sm" />
            <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {m.id === currentUserId ? 'You' : (m.displayName || m.fullName)}
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
  );
}
