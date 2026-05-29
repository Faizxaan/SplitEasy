import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, SplitSquareVertical, ArrowRight, Zap, Users, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: 'Weak', color: '#EF4444' };
  if (score <= 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
  if (score <= 3) return { level: 3, label: 'Good', color: '#10B981' };
  return { level: 4, label: 'Strong', color: '#6366F1' };
}

function validate(fullName, email, password) {
  const errors = {};
  if (!fullName || fullName.trim().length < 2) errors.fullName = 'Full name must be at least 2 characters';
  else if (fullName.trim().length > 30) errors.fullName = 'Full name must not exceed 30 characters';
  else if (!/^[a-zA-Z0-9\s\-_&']+$/.test(fullName)) errors.fullName = 'Name contains invalid characters';
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Valid email is required';
  
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fullName, email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await register(fullName.trim(), email, password);
      toast.success('Account created! Welcome to SplitEasy 🎉');
      navigate(redirectTo);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          flex: '0 0 480px',
          background: 'linear-gradient(160deg, #4F46E5 0%, #7C3AED 100%)',
          padding: '60px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="auth-left-panel"
      >
        <div style={{ position: 'absolute', top: -120, right: -80, width: 300, height: 300, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 240, height: 240, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SplitSquareVertical size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.02em' }}>SplitEasy</span>
          </div>
          <h2 style={{ color: '#fff', marginBottom: 16, fontSize: '2rem', fontWeight: 800 }}>
            Start splitting<br />the smart way.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: '1rem', maxWidth: 320 }}>
            Create an account in seconds and start managing shared expenses with your friends.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: <Zap size={16} />, text: 'Free forever, no credit card needed' },
            { icon: <Users size={16} />, text: 'Invite friends with a single link' },
            { icon: <Calculator size={16} />, text: 'Settle with minimum transactions' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>{icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9375rem', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, justifyContent: 'center' }} className="auth-mobile-logo">
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SplitSquareVertical size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>SplitEasy</span>
          </div>

          <div style={{ marginBottom: 36 }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Create your account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Join thousands splitting expenses the smart way</p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input
              label="Full name"
              type="text"
              placeholder="Faizan Ahmed"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={User}
              error={errors.fullName}
              autoComplete="name"
              autoFocus
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              error={errors.email}
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                error={errors.password}
                autoComplete="new-password"
                iconRight={
                  <button type="button" className="tap-sm" onClick={() => setShowPass(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 99,
                        background: i <= strength.level ? strength.color : 'var(--border)',
                        transition: 'var(--transition)',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" fullWidth loading={loading} iconRight={!loading && <ArrowRight size={18} />}>
              Create Account
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Already have an account?{' '}
            <Link to={`/login${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .auth-mobile-logo { display: flex !important; }
        }
        @media (min-width: 769px) {
          .auth-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
