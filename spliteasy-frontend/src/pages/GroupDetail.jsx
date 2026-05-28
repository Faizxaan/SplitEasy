import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Receipt, DollarSign, Settings, Share2, Copy, Check, Users, Crown, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGroupDetail, getGroupMembers } from '../api/groups';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import ExpensesTab from '../components/group/ExpensesTab';
import BalancesTab from '../components/group/BalancesTab';
import SettingsTab from '../components/group/SettingsTab';
import { getCategoryInfo } from '../utils/categoryHelpers';

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('expenses');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (!group?.inviteCode) return;
    const url = `${window.location.origin}/join/${group.inviteCode}`;
    if (navigator.share) {
      navigator.share({ title: `Join ${group.name} on SplitEasy`, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast.success('Invite link copied!');
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const loadGroup = useCallback(() => {
    Promise.all([getGroupDetail(groupId), getGroupMembers(groupId)])
      .then(([gRes, mRes]) => { setGroup(gRes.data); setMembers(mRes.data); })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [groupId, navigate]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  const cat = group ? getCategoryInfo(group.category, 'group') : null;

  return (
    <div>
      {/* Back */}
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: 20, textDecoration: 'none' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
        <ArrowLeft size={16} /> Dashboard
      </Link>

      {/* Group header */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <Skeleton height={28} width="55%" />
          <Skeleton height={18} width="35%" />
        </div>
      ) : group ? (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
              <div style={{ width: 56, height: 56, background: `${cat.color}20`, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>
                {cat.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cat.color, background: `${cat.color}20`, padding: '3px 10px', borderRadius: 999 }}>
                    {cat.icon} {cat.label}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 999 }}>
                    {group.currency}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {members.slice(0, 4).map((m, i) => (
                      <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                        <Avatar name={m.fullName} avatarColor={m.avatarColor} size="xs" style={{ border: '2px solid var(--bg-primary)' }} />
                      </div>
                    ))}
                    {members.length > 4 && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 4 }}>+{members.length - 4}</span>}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>{members.length} members</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleShare}
                title="Share invite link"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)', background: 'var(--bg-secondary)',
                  color: copied ? 'var(--success)' : 'var(--accent)',
                  fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                Invite
              </button>
              <Button size="sm" variant="primary" icon={<Plus size={14} />}
                onClick={() => navigate(`/groups/${groupId}/expenses/new`)}>
                Add Expense
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 0, position: 'relative', overflowX: 'auto' }}>
        {[
          { id: 'expenses', label: 'Expenses', icon: <Receipt size={15} /> },
          { id: 'balances', label: 'Balances', icon: <DollarSign size={15} /> },
          { id: 'members', label: 'Members', icon: <Users size={15} /> },
          { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '12px 18px', border: 'none', background: 'none',
            fontSize: '0.875rem', fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? 'var(--accent)' : 'var(--text-tertiary)',
            cursor: 'pointer', position: 'relative', transition: 'color 0.2s', whiteSpace: 'nowrap',
          }}>
            {t.icon}{t.label}
            {tab === t.id && (
              <motion.div layoutId="tab-underline"
                style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, background: 'var(--accent)', borderRadius: 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
          {tab === 'expenses' && (
            <ExpensesTab groupId={groupId} currency={group?.currency || 'INR'} currentUserId={user?.id} />
          )}
          {tab === 'balances' && (
            <BalancesTab groupId={groupId} currency={group?.currency || 'INR'} />
          )}
          {tab === 'members' && (
            <div style={{ paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>Group Members</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{members.length} {members.length === 1 ? 'member' : 'members'} in this group</p>
                </div>
                <button
                  onClick={handleShare}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--accent)', background: 'var(--accent-bg)',
                    color: 'var(--accent)', fontWeight: 700, fontSize: '0.8125rem',
                    cursor: 'pointer', transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
                >
                  {copied ? <Check size={14} /> : <Share2 size={14} />}
                  {copied ? 'Copied!' : 'Invite'}
                </button>
              </div>

              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                {members.map((m, i) => {
                  const isMe = m.id === user?.id;
                  const isCreator = m.id === group?.createdBy?.id;
                  const balance = m.netBalance ?? 0;
                  const balanceColor = balance > 0 ? 'var(--success)' : balance < 0 ? 'var(--danger)' : 'var(--text-tertiary)';
                  const balanceLabel = balance > 0 ? `gets back ${group?.currency} ${Math.abs(balance).toFixed(2)}` : balance < 0 ? `owes ${group?.currency} ${Math.abs(balance).toFixed(2)}` : 'settled up';
                  return (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 20px',
                      borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isMe ? 'var(--accent-bg)' : 'transparent',
                      transition: 'background 0.15s',
                    }}>
                      {/* Avatar */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Avatar name={m.fullName} avatarColor={m.avatarColor} size="md" />
                        {isCreator && (
                          <div style={{
                            position: 'absolute', bottom: -2, right: -2,
                            width: 16, height: 16, borderRadius: '50%',
                            background: '#F59E0B', border: '2px solid var(--bg-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Crown size={8} color="#fff" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.fullName}
                          </span>
                          {isMe && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-bg)', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--accent)', flexShrink: 0 }}>You</span>
                          )}
                          {isCreator && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B', background: '#FEF3C7', padding: '2px 7px', borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Crown size={9} /> Creator
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                          <Mail size={11} color="var(--text-tertiary)" />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</span>
                        </div>
                      </div>

                      {/* Balance */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: balanceColor }}>
                          {balance === 0 ? '—' : `${balance > 0 ? '+' : ''}${group?.currency} ${Math.abs(balance).toFixed(2)}`}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2, textTransform: 'capitalize' }}>
                          {balanceLabel}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {tab === 'settings' && (
            <SettingsTab group={group} members={members} onGroupUpdated={g => setGroup(g)} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Add button (visible on Expenses tab) */}
      {tab === 'expenses' && (
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
          className="group-fab">
          <button onClick={() => navigate(`/groups/${groupId}/expenses/new`)}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.45)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.45)'; }}
            aria-label="Add expense">
            <Plus size={24} color="#fff" />
          </button>
        </motion.div>
      )}

      <style>{`
        .group-fab {
          position: fixed;
          bottom: calc(80px + env(safe-area-inset-bottom, 0px));
          right: 24px;
          z-index: 80;
        }
        @media (min-width: 769px) {
          .group-fab {
            bottom: 32px;
          }
        }
      `}</style>
    </div>
  );
}
