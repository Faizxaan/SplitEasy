import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Share2, Check, Crown, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateGroup, leaveGroup, deleteGroup } from '../../api/groups';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Divider from '../ui/Divider';
import { formatDate } from '../../utils/formatDate';
import { getCategoryInfo } from '../../utils/categoryHelpers';

const CATEGORY_OPTIONS = [
  { value: 'TRIP', label: 'Trip', icon: '✈️' },
  { value: 'HOME', label: 'Home', icon: '🏠' },
  { value: 'COUPLE', label: 'Couple', icon: '💑' },
  { value: 'EVENT', label: 'Event', icon: '🎉' },
  { value: 'OTHER', label: 'Other', icon: '📌' },
];

export default function SettingsTab({ group, members, onGroupUpdated }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCreator = group?.createdById === user?.id;

  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [saving, setSaving] = useState(false);
  const [nameDirty, setNameDirty] = useState(false);

  const [copied, setCopied] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const inviteUrl = group ? `${window.location.origin}/join/${group.inviteCode}` : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=6366F1&data=${encodeURIComponent(inviteUrl)}`;
  const cat = group ? getCategoryInfo(group.category, 'group') : null;

  useEffect(() => {
    setName(group?.name || '');
    setDescription(group?.description || '');
  }, [group]);

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Invite link copied!');
    });
  };

  const shareInvite = () => {
    if (navigator.share) {
      navigator.share({ title: `Join ${group.name} on SplitEasy`, url: inviteUrl });
    } else { copyInvite(); }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await updateGroup(group.id, { name: name.trim(), description });
      toast.success('Group updated!');
      setNameDirty(false);
      onGroupUpdated?.(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update group');
    } finally { setSaving(false); }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await leaveGroup(group.id);
      toast.success('Left the group');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave group');
    } finally { setActionLoading(false); setShowLeave(false); }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== group.name) { toast.error('Group name does not match'); return; }
    setActionLoading(true);
    try {
      await deleteGroup(group.id);
      toast.success('Group deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete group');
    } finally { setActionLoading(false); setShowDelete(false); }
  };

  return (
    <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Group Info */}
      <Card>
        <h4 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontWeight: 700 }}>Group Info</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Group Name"
            value={name}
            onChange={e => { setName(e.target.value); setNameDirty(true); }}
            disabled={!isCreator}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Description</label>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); setNameDirty(true); }}
              disabled={!isCreator}
              rows={2}
              maxLength={200}
              style={{
                width: '100%', padding: '10px 12px', fontSize: '0.9375rem',
                background: isCreator ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', resize: 'none', outline: 'none',
                fontFamily: 'var(--font)', boxSizing: 'border-box',
                opacity: isCreator ? 1 : 0.7,
              }}
              onFocus={e => isCreator && (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: cat?.color, background: cat ? `${cat.color}15` : 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: 999 }}>
                {cat?.icon} {cat?.label}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Currency</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: 999 }}>
                {group?.currency}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{formatDate(group?.createdAt)}</span>
            </div>
          </div>

          {isCreator && nameDirty && (
            <Button onClick={handleSave} loading={saving} size="sm">Save Changes</Button>
          )}
        </div>
      </Card>

      {/* Invite */}
      <Card>
        <h4 style={{ color: 'var(--text-primary)', margin: '0 0 14px', fontWeight: 700 }}>Invite Members</h4>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{
            flex: 1, padding: '10px 12px', background: 'var(--bg-tertiary)',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'monospace',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{inviteUrl}</div>
          <button onClick={copyInvite}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: copied ? 'var(--success-bg)' : 'var(--accent-bg)', border: `1.5px solid ${copied ? 'var(--success)' : 'var(--accent)'}`, borderRadius: 'var(--radius-md)', color: copied ? 'var(--success)' : 'var(--accent)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'var(--transition)', flexShrink: 0 }}
            aria-label="Copy invite link">
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <img src={qrUrl} alt="QR Code" width={120} height={120}
            style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.5 }}>
              Share the invite link or scan the QR code to join this group.
            </p>
            <Button size="sm" variant="secondary" icon={<Share2 size={14} />} onClick={shareInvite}>
              Share Invite
            </Button>
          </div>
        </div>
      </Card>

      {/* Members */}
      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px 12px' }}>
          <h4 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>Members ({members.length})</h4>
        </div>
        {members.map((m, i) => (
          <div key={m.id}>
            {i > 0 && <Divider style={{ margin: 0 }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
              <Avatar name={m.fullName} avatarColor={m.avatarColor} size="sm" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                    {m.fullName}
                    {m.id === user?.id && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 400 }}> (you)</span>}
                  </p>
                  {m.id === group?.createdById && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B', background: '#FFFBEB', padding: '2px 7px', borderRadius: 999 }}>
                      <Crown size={10} /> Creator
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{m.email}</p>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="secondary" onClick={() => setShowLeave(true)} fullWidth>Leave Group</Button>

        {isCreator && (
          <Card style={{ border: '1.5px solid var(--danger)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={16} color="var(--danger)" />
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--danger)', fontSize: '0.875rem' }}>Danger Zone</p>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
              This will permanently delete all expenses, settlements, and data in this group.
            </p>
            <Button variant="danger" onClick={() => setShowDelete(true)} fullWidth>Delete Group</Button>
          </Card>
        )}
      </div>

      {/* Leave Modal */}
      <Modal isOpen={showLeave} onClose={() => setShowLeave(false)} title="Leave Group">
        <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>
          Are you sure you want to leave <strong style={{ color: 'var(--text-primary)' }}>{group?.name}</strong>?
          You'll lose access to all expenses.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={() => setShowLeave(false)} fullWidth>Cancel</Button>
          <Button variant="danger" loading={actionLoading} onClick={handleLeave} fullWidth>Leave Group</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDelete} onClose={() => { setShowDelete(false); setDeleteConfirmName(''); }} title="Delete Group">
        <p style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>
          This action <strong>cannot be undone</strong>. This will permanently delete{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{group?.name}</strong> and all its data.
        </p>
        <p style={{ marginBottom: 16, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Type <strong style={{ color: 'var(--text-primary)' }}>{group?.name}</strong> to confirm:
        </p>
        <Input
          value={deleteConfirmName}
          onChange={e => setDeleteConfirmName(e.target.value)}
          placeholder={group?.name}
          autoFocus
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button variant="ghost" onClick={() => { setShowDelete(false); setDeleteConfirmName(''); }} fullWidth>Cancel</Button>
          <Button variant="danger" loading={actionLoading}
            onClick={handleDelete}
            disabled={deleteConfirmName !== group?.name}
            style={{ opacity: deleteConfirmName === group?.name ? 1 : 0.5 }}
            fullWidth>
            Delete Forever
          </Button>
        </div>
      </Modal>
    </div>
  );
}
