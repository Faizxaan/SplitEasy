import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SplitSquareVertical, Users, Receipt, ArrowRight } from 'lucide-react';
import { getSharedDraft } from '../api/quickSplits';
import { formatCurrency } from '../utils/formatCurrency';

const getCatIcon = (cat) => {
  const map = { FOOD: '🍽️', TRANSPORT: '🚗', STAY: '🏨', SHOPPING: '🛍️', FUN: '🎉', UTILITIES: '💡', OTHER: '📌' };
  return map[cat] || '📌';
};

function ParticipantAvatar({ p, size = 40 }) {
  const initials = p.displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: p.avatarColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size > 32 ? '0.875rem' : '0.7rem', fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>{initials}</div>
  );
}

export default function DraftSharePage() {
  const { shareToken } = useParams();
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getSharedDraft(shareToken)
      .then(r => setDraft(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shareToken]);

  const containerStyle = {
    minHeight: '100vh', background: 'var(--bg-primary)',
    display: 'flex', flexDirection: 'column',
  };

  const headerStyle = {
    background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: 10,
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SplitSquareVertical size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff' }}>SplitEasy</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #6366F1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SplitSquareVertical size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff' }}>SplitEasy</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔗</div>
            <h2 style={{ color: '#0F172A', marginBottom: 8 }}>Link not found</h2>
            <p style={{ color: '#64748B', marginBottom: 24, lineHeight: 1.6 }}>
              This shared split session may have been deleted or the link is invalid.
            </p>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px',
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff',
              borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: '0.9375rem',
            }}>
              Go to SplitEasy <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currency = draft.currency || 'INR';
  const participants = draft.participants || [];
  const expenses = draft.expenses || [];
  const settlements = draft.settlements || [];

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SplitSquareVertical size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff' }}>SplitEasy</span>
        <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
          Read-only
        </span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px', width: '100%' }}>
        {/* Title card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, marginBottom: 16,
            boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
          }}
        >
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '1.5rem' }}>{draft.title}</h2>
          <p style={{ color: 'var(--text-tertiary)', margin: '0 0 16px', fontSize: '0.875rem' }}>
            {participants.length} people · {expenses.length} expenses
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>Total Cost</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
                {formatCurrency(draft.totalAmount || 0, currency)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settlement */}
        {settlements.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>Who owes what</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {settlements.map((debt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <ParticipantAvatar p={debt.from} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{debt.from.displayName}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>owes {debt.to.displayName}</p>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--danger)' }}>
                    {formatCurrency(debt.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {settlements.length === 0 && expenses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 16, textAlign: 'center', boxShadow: '0 4px 24px rgba(16,185,129,0.1)', border: '1px solid #A7F3D0' }}
          >
            <span style={{ fontSize: '2rem' }}>✅</span>
            <p style={{ fontWeight: 700, color: '#065F46', fontSize: '1rem', margin: '8px 0 0' }}>Everyone is settled up!</p>
          </motion.div>
        )}

        {/* People */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Users size={16} color="var(--text-tertiary)" />
            <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>People ({participants.length})</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {participants.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 999 }}>
                <ParticipantAvatar p={p} size={24} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.displayName}</span>
                {p.isCreator && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>Host</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Expenses */}
        {expenses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Receipt size={16} color="var(--text-tertiary)" />
              <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>Expenses ({expenses.length})</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {expenses.map((exp, i) => (
                <div key={exp.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px',
                  borderBottom: i < expenses.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{getCatIcon(exp.category)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{exp.paidByParticipantName} paid</p>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{formatCurrency(exp.amount, currency)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '8px 0 32px' }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginBottom: 12 }}>
            Want to create your own split? It's free.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px',
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff',
            borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: '0.9375rem',
          }}>
            Try SplitEasy free <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
