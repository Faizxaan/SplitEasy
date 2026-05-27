import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Users, Receipt, TrendingDown } from 'lucide-react';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { computeSettlements } from '../utils/guestSessions';

const getCatIcon = (cat) => {
  const map = { FOOD: '🍽️', TRANSPORT: '🚗', STAY: '🏨', SHOPPING: '🛍️', FUN: '🎉', UTILITIES: '💡', OTHER: '📌' };
  return map[cat] || '📌';
};

function decodeShareData(encoded) {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4 ? '='.repeat(4 - base64.length % 4) : '';
    return JSON.parse(decodeURIComponent(escape(atob(base64 + padding))));
  } catch { return null; }
}

export default function GuestQuickSplitView() {
  const [params] = useSearchParams();
  const session = useMemo(() => decodeShareData(params.get('d') || ''), [params]);

  if (!session) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
        <div>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>❌</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Invalid or expired link</h2>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 24 }}>This share link doesn't contain valid data.</p>
          <Link to="/quick-split" style={{ textDecoration: 'none' }}>
            <Button icon={<Zap size={15} />}>Start your own Quick Split</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { title, currency, participants, expenses } = session;
  const settlements = computeSettlements(participants, expenses);
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header banner */}
      <div style={{
        background: 'var(--accent-bg)', border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 'var(--radius-lg)', padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap',
      }}>
        <Zap size={14} color="var(--accent)" />
        <p style={{ flex: 1, margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          This is a read-only view shared via Quick Split.
          {' '}<Link to="/quick-split" style={{ color: 'var(--accent)', fontWeight: 600 }}>Start your own split →</Link>
        </p>
      </div>

      {/* Title row */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.25)',
            padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
          }}>
            <Zap size={10} /> Quick Split
          </span>
        </div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
          {participants.length} people · {expenses.length} expenses · {formatCurrency(totalAmount, currency)} total
        </p>
      </div>

      {/* Settlement summary — most important, shown first */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 16,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingDown size={16} color="var(--text-tertiary)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Settlement</span>
        </div>

        <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Cost</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
            {formatCurrency(totalAmount, currency)}
          </p>
        </div>

        {settlements.length === 0 && expenses.length > 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <p style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, margin: '8px 0 0' }}>Everyone is settled up!</p>
          </div>
        )}
        {settlements.length === 0 && expenses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-tertiary)' }}>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>No expenses recorded</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {settlements.map((debt, i) => {
            const fromInitials = debt.from.displayName.slice(0, 2).toUpperCase();
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div style={{
                  padding: '14px', background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: debt.from.avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                    }}>{fromInitials}</div>
                    <div style={{ flex: 1 }}>
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
        </div>
      </div>

      {/* Desktop: side-by-side people + expenses | Mobile: stacked */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>

        {/* People */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Users size={15} color="var(--text-tertiary)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>People</span>
            <span style={{ background: 'var(--accent-bg)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
              {participants.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {participants.map((p, i) => {
              const initials = p.displayName.slice(0, 2).toUpperCase();
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials}</div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.displayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Receipt size={15} color="var(--text-tertiary)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Expenses</span>
            <span style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
              {currency}
            </span>
          </div>
          {expenses.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '16px 0' }}>No expenses</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {expenses.map(exp => (
                <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{getCatIcon(exp.category)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exp.description}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {exp.paidByParticipantName} paid
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', flexShrink: 0 }}>
                    {formatCurrency(exp.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 10 }}>⚡</div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Start your own Quick Split</h3>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: 20, fontSize: '0.875rem' }}>
          Free, no signup needed. Split expenses with anyone in minutes.
        </p>
        <Link to="/quick-split" style={{ textDecoration: 'none' }}>
          <Button icon={<Zap size={15} />}>Try Quick Split — No signup needed</Button>
        </Link>
      </div>
    </motion.div>
  );
}
