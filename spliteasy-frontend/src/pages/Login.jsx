import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, SplitSquareVertical, ArrowRight, Zap, Users, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function validate(email, password) {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.fullName.split(' ')[0]}! 👋`);
      navigate(redirectTo);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
    }}>
      {/* Left branding panel — desktop only */}
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
        {/* Background decoration */}
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
            Settle up,<br />stress-free.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: '1rem', maxWidth: 320 }}>
            Track shared expenses, split them any way you like, and settle with minimum transactions.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: <Zap size={16} />, text: 'Smart debt simplification algorithm' },
            { icon: <Users size={16} />, text: 'Works for trips, homes & events' },
            { icon: <Calculator size={16} />, text: 'Equal, exact, %, or custom splits' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>{icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9375rem', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, justifyContent: 'center' }} className="auth-mobile-logo">
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SplitSquareVertical size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>SplitEasy</span>
          </div>

          <div style={{ marginBottom: 36 }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Welcome back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              error={errors.password}
              autoComplete="current-password"
              iconRight={
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Button type="submit" size="lg" fullWidth loading={loading} iconRight={!loading && <ArrowRight size={18} />}>
              Log In
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Don't have an account?{' '}
            <Link to={`/register${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>

          {/* Quick fill hint for dev */}
          <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '0 0 6px', fontWeight: 600 }}>Demo credentials</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, fontFamily: 'monospace' }}>faizan@spliteasy.com / password123</p>
          </div>
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
