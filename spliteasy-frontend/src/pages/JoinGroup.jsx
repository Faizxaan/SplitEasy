import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SplitSquareVertical, Users, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGroupPreview, joinGroup } from '../api/groups';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { getCategoryInfo } from '../utils/categoryHelpers';

export default function JoinGroup() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  // Prevent double-join attempts (e.g. StrictMode double-render or auth state flicker)
  const hasAutoJoined = useRef(false);

  useEffect(() => {
    getGroupPreview(inviteCode)
      .then(res => setPreview(res.data))
      .catch(() => setError('Invalid or expired invite link.'))
      .finally(() => setLoading(false));
  }, [inviteCode]);

  // Auto-join once the user is authenticated and the preview is ready.
  // This handles the redirect-back-from-login/register case so users
  // don't have to click "Join Group" a second time.
  useEffect(() => {
    if (!isAuthenticated || !preview || loading || error || hasAutoJoined.current) return;
    hasAutoJoined.current = true;

    setJoining(true);
    joinGroup(inviteCode)
      .then(res => {
        toast.success(`Joined ${preview.name}! 🎉`);
        navigate(`/groups/${res.data.id}`);
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to join group';
        if (msg.toLowerCase().includes('already')) {
          // Already a member — redirect straight to the group
          if (err.response?.data?.groupId) {
            navigate(`/groups/${err.response.data.groupId}`);
          } else {
            setError('already_member');
          }
        } else {
          toast.error(msg);
          // Reset so the user can retry manually
          hasAutoJoined.current = false;
        }
      })
      .finally(() => setJoining(false));
  }, [isAuthenticated, preview, loading, error, inviteCode, navigate]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/register?redirect=/join/${inviteCode}`);
      return;
    }
    setJoining(true);
    try {
      const res = await joinGroup(inviteCode);
      toast.success(`Joined ${preview.name}! 🎉`);
      navigate(`/groups/${res.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join group';
      toast.error(msg);
    } finally { setJoining(false); }
  };

  const cat = preview ? getCategoryInfo(preview.category, 'group') : null;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'linear-gradient(160deg, var(--bg-primary), var(--accent-bg))',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Top bar */}
        <div style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', padding: '24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SplitSquareVertical size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff' }}>SplitEasy</span>
        </div>

        <div style={{ padding: '28px 24px 24px' }}>
          {(loading || joining) ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
              {joining && <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: '0.9rem' }}>Joining group...</p>}
            </div>
          ) : error === 'already_member' ? (
            <>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Already a member</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>You're already in <strong>{preview?.name}</strong>.</p>
              <Button fullWidth onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </>
          ) : error ? (
            <>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Invalid invite</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{error}</p>
              <Link to="/"><Button fullWidth variant="secondary">Back to Home</Button></Link>
            </>
          ) : preview ? (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>You've been invited!</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 52, height: 52, background: cat ? `${cat.color}20` : 'var(--accent-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  {cat?.icon || '👥'}
                </div>
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '1.125rem' }}>{preview.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: cat?.color, background: cat ? `${cat.color}20` : 'var(--accent-bg)', padding: '2px 8px', borderRadius: 999 }}>
                      {cat?.icon} {cat?.label}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      <Users size={12} /> {preview.memberCount} member{preview.memberCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                <Button fullWidth size="lg" loading={joining} onClick={handleJoin} iconRight={<ArrowRight size={18} />}>
                  Join Group
                </Button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to={`/register?redirect=/join/${inviteCode}`}>
                    <Button fullWidth size="lg" iconRight={<ArrowRight size={18} />}>Sign Up to Join</Button>
                  </Link>
                  <Link to={`/login?redirect=/join/${inviteCode}`}>
                    <Button fullWidth size="md" variant="secondary">I have an account</Button>
                  </Link>
                </div>
              )}
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
