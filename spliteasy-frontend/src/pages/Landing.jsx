import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, SplitSquareVertical, Zap, Users, Globe, TrendingUp,
  Smartphone, Calculator, CheckCircle2, Sparkles, Share2, Receipt, Clock,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';

/* ─── Helpers ────────────────────────────────────────────── */
function ScrollReveal({ children, delay = 0, y = 28 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}

/* ─── Quick Split Mock UI ─────────────────────────────────── */
function QuickSplitMockUI() {
  const people = [['A','#6366F1','Anjali'],['R','#10B981','Rahul'],['Z','#F59E0B','Zayd'],['P','#EC4899','Priya']];
  const expenses = [['🏨','Hotel booking','₹12,000','Anjali'],['🍽️','Beach dinner','₹3,200','Rahul'],['🚗','Cab ride','₹800','Zayd']];
  const settlements = [['Rahul','Anjali','₹1,400'],['Zayd','Anjali','₹2,100'],['Priya','Anjali','₹1,700']];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(10,13,28,0.92)', border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 560,
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
      }}
    >
      {/* Chrome bar */}
      <div style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F57','#FFBD2E','#28C840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <span style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>SplitEasy — Quick Split (no login needed)</span>
      </div>
      {/* Title row */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Goa Trip 2025</span>
        <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 999, padding: '2px 8px', fontSize: '0.62rem', fontWeight: 700 }}>⚡ Quick Split</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>4 people · 3 expenses</span>
      </div>
      {/* Three panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.2fr' }}>
        <div style={{ padding: '14px 14px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>People</p>
          {people.map(([init, color, name]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{init}</div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{name}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 14px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Expenses</p>
          {expenses.map(([icon, label, amount, payer]) => (
            <div key={label} style={{ marginBottom: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: '0.75rem' }}>{icon}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600, flex: 1 }}>{label}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>{amount}</span>
              </div>
              <p style={{ margin: '1px 0 0 1.3rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)' }}>{payer} paid</p>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 14px' }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Settlement</p>
          {settlements.map(([from, to, amount]) => (
            <div key={from} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>{from} → {to}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F87171' }}>{amount}</div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: '7px 9px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
            <p style={{ margin: 0, fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>✓ Share link ready — no login!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Feature card ───────────────────────────────────────── */
function FeatureCard({ icon: Icon, color, bg, title, description, delay, featured }) {
  return (
    <ScrollReveal delay={delay}>
      <motion.div
        whileHover={{ y: -5, borderColor: featured ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.14)' }}
        transition={{ duration: 0.22 }}
        style={{
          background: 'rgba(255,255,255,0.03)', border: featured ? '1.5px solid rgba(99,102,241,0.32)' : '1px solid rgba(255,255,255,0.07)',
          borderRadius: 18, padding: '24px 22px', cursor: 'default',
          transition: 'border-color 0.25s ease', position: 'relative', overflow: 'hidden',
        }}
      >
        {featured && (
          <span style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 999, padding: '2px 8px', fontSize: '0.62rem', fontWeight: 700 }}>NEW</span>
        )}
        <div style={{ width: 44, height: 44, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Icon size={20} color={color} />
        </div>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: 6, fontWeight: 700 }}>{title}</h4>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0 }}>{description}</p>
      </motion.div>
    </ScrollReveal>
  );
}

/* ─── Step card ──────────────────────────────────────────── */
function StepCard({ number, icon: Icon, title, description, delay }) {
  return (
    <ScrollReveal delay={delay}>
      <div style={{ textAlign: 'center', padding: '0 12px' }}>
        <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 20 }}>
          <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(99,102,241,0.35)' }}>
            <Icon size={28} color="#fff" />
          </div>
          <div style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, background: 'rgba(10,13,28,0.95)', border: '1.5px solid rgba(99,102,241,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#818CF8' }}>{number}</div>
        </div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 10, fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', maxWidth: 260, margin: '0 auto', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{description}</p>
      </div>
    </ScrollReveal>
  );
}

/* ─── Landing Page ───────────────────────────────────────── */
export default function Landing() {
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);

  return (
    <div style={{ overflowX: 'hidden', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      {/* Global mesh gradient — fixed so it flows across all sections */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 140% 65% at 50% -5%, rgba(99,102,241,0.22) 0%, transparent 58%),
          radial-gradient(ellipse 70% 50% at -5% 55%, rgba(139,92,246,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 60% 45% at 108% 88%, rgba(99,102,241,0.09) 0%, transparent 52%)
        `,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section className="landing-hero-section" style={{ padding: '100px 0 80px', position: 'relative', overflow: 'hidden' }}>
          {/* Unified glow — spans the center+right, connects both halves */}
          <div style={{
            position: 'absolute', top: '-10%', left: '28%',
            width: '80%', height: '120%',
            background: 'radial-gradient(ellipse 70% 65% at 60% 45%, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.05) 45%, transparent 70%)',
            filter: 'blur(36px)', pointerEvents: 'none',
          }} />

          <div className="container" style={{ position: 'relative' }}>
            {/* ── Side-by-side grid: 42% content / 58% video ── */}
            <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '42fr 58fr', gap: 48, alignItems: 'center', marginBottom: 52 }}>

              {/* LEFT: headline + sub + cards */}
              <div className="hero-content-col">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  style={{ marginBottom: 16 }}>
                  <h1 className="hero-text-align" style={{ fontSize: 'clamp(2.1rem, 4vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0 }}>
                    Split expenses,{' '}
                    <span className="gradient-text">not friendships.</span>
                  </h1>
                </motion.div>

                <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 }}
                  className="hero-text-align hero-subtext landing-cta-margin"
                  style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 380, margin: '0 0 28px', lineHeight: 1.75 }}>
                  The simplest way to share costs with friends, roommates, and travel buddies —
                  with an account <em>or</em> without one.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.14 }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 11 }}>

                  {/* Quick Split */}
                  <Link to="/quick-split" style={{ textDecoration: 'none' }}>
                    <motion.div whileHover={{ y: -4, boxShadow: '0 18px 48px rgba(99,102,241,0.28)' }}
                      whileTap={{ scale: 0.985 }} transition={{ duration: 0.22 }}
                      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(139,92,246,0.1) 100%)', border: '1.5px solid rgba(99,102,241,0.38)', borderRadius: 16, padding: '17px 15px', boxShadow: '0 4px 20px rgba(99,102,241,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start', background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 999, padding: '2px 7px', fontSize: '0.66rem', fontWeight: 700, marginBottom: 10 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> No signup
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(99,102,241,0.35)' }}>
                          <Zap size={14} color="#fff" />
                        </div>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Quick Split</h3>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.78rem', marginBottom: 10, lineHeight: 1.6, flex: 1 }}>
                        Split in 60 seconds. Share via link — no login needed.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#818CF8', fontWeight: 700, fontSize: '0.775rem', marginBottom: 8 }}>
                        Start Splitting Now <ArrowRight size={12} />
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {['Add people', 'Log expenses', 'Share instantly'].map(f => (
                          <span key={f} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 999, padding: '1px 6px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.36)' }}>{f}</span>
                        ))}
                      </div>
                    </motion.div>
                  </Link>

                  {/* Full Account */}
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    <motion.div whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.18)', boxShadow: '0 16px 40px rgba(0,0,0,0.3)' }}
                      whileTap={{ scale: 0.985 }} transition={{ duration: 0.22 }}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '17px 15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start', background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.22)', borderRadius: 999, padding: '2px 7px', fontSize: '0.66rem', fontWeight: 700, marginBottom: 10 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#818CF8', display: 'inline-block' }} /> Free forever
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Users size={14} color="rgba(255,255,255,0.6)" />
                        </div>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Full Account</h3>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.78rem', marginBottom: 10, lineHeight: 1.6, flex: 1 }}>
                        Persistent groups, history, real-time balances and settlements.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.42)', fontWeight: 700, fontSize: '0.775rem', marginBottom: 8 }}>
                        Create Free Account <ArrowRight size={12} />
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {['Groups', 'Expense history', 'Real-time sync'].map(f => (
                          <span key={f} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 999, padding: '1px 6px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)' }}>{f}</span>
                        ))}
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>

              {/* RIGHT: video — wider column, glow bridges the gap */}
              <div className="hero-video-col" style={{ position: 'relative' }}>
                <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.72, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'relative' }}>
                  {/* Left-reaching glow — visually connects video to the cards */}
                  <div style={{ position: 'absolute', top: '50%', right: '95%', transform: 'translateY(-50%)', width: 160, height: '90%', background: 'radial-gradient(ellipse 100% 70% at 100% 50%, rgba(99,102,241,0.22) 0%, transparent 100%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(99,102,241,0.3), -20px 0 52px rgba(99,102,241,0.1), 0 32px 64px rgba(0,0,0,0.6)' }}>
                    <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8) 25%, rgba(139,92,246,0.8) 75%, transparent)' }} />
                    <video autoPlay muted loop playsInline style={{ width: '100%', display: 'block' }}>
                      <source src="/spliteasyvideo.mp4" type="video/mp4" />
                    </video>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Stats + scroll hint — full width, bridges both columns */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="landing-hero-stats"
              style={{ display: 'flex', justifyContent: 'center', gap: 52, flexWrap: 'wrap', marginBottom: 28 }}>
              {[['₹5L+', 'Expenses tracked'], ['1,000+', 'Groups created'], ['100%', 'Free forever']].map(([stat, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>{stat}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0, fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ textAlign: 'center' }}>
              <button onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                See how it works ↓
              </button>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            QUICK SPLIT SPOTLIGHT
        ══════════════════════════════════════════════════ */}
        <section className="landing-section-padding" style={{ padding: '96px 0', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.03)', borderTop: '1px solid rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.08)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>

              {/* Left: copy */}
              <div>
                <ScrollReveal>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.22)', borderRadius: 999, padding: '6px 16px', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 24 }}>
                    <Zap size={12} /> Quick Split Mode
                  </span>
                </ScrollReveal>
                <ScrollReveal delay={0.05}>
                  <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', letterSpacing: '-0.025em', marginBottom: 20, lineHeight: 1.2 }}>
                    Split a bill in{' '}
                    <span className="gradient-text">60 seconds.</span>
                    <br />Zero friction. Zero login.
                  </h2>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                  <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 28, maxWidth: 440 }}>
                    At a restaurant? Just checked into a hotel? Open Quick Split, add your group, log expenses, and share the settlement — no account needed for you or anyone you share it with.
                  </p>
                </ScrollReveal>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    [Clock,        'Under 60 seconds to your first split'],
                    [Share2,       'Share results via link — viewers need no login'],
                    [Receipt,      'Multiple currencies & all split types supported'],
                    [CheckCircle2, 'Browser-persisted — your sessions survive refresh'],
                  ].map(([Icon, text], i) => (
                    <ScrollReveal key={i} delay={0.15 + i * 0.06}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={15} color="#818CF8" />
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
                <ScrollReveal delay={0.38}>
                  <Link to="/quick-split" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 32 }}>
                    <motion.div
                      whileHover={{ scale: 1.03, boxShadow: '0 14px 40px rgba(99,102,241,0.38)' }}
                      whileTap={{ scale: 0.97 }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 14, padding: '13px 24px', cursor: 'pointer', boxShadow: '0 6px 24px rgba(99,102,241,0.32)' }}
                    >
                      <Zap size={17} color="#fff" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}>Try Quick Split Free</span>
                      <ArrowRight size={15} color="#fff" />
                    </motion.div>
                  </Link>
                </ScrollReveal>
              </div>

              {/* Right: mock UI — hidden on mobile (<640 px) via CSS */}
              <div className="qsm-preview-col">
                <ScrollReveal delay={0.1} y={40}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <QuickSplitMockUI />
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════ */}
        <section ref={howItWorksRef} className="landing-section-padding" style={{ padding: '96px 0' }}>
          <div className="container">
            <ScrollReveal>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 999, padding: '6px 16px', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 16 }}>HOW IT WORKS</span>
                <h2 style={{ color: 'var(--text-primary)' }}>Three steps to stress-free splitting</h2>
                <p style={{ fontSize: '1.0625rem', maxWidth: 500, margin: '12px auto 0', color: 'var(--text-secondary)' }}>
                  Works with or without an account. No setup, no learning curve.
                </p>
              </div>
            </ScrollReveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 48 }}>
              <StepCard number="1" icon={Users}      title="Add People"      description="Type in names — no accounts required for anyone. Use placeholders like Apple, Banana if you want." delay={0} />
              <StepCard number="2" icon={Calculator} title="Log Expenses"    description="Add who paid, how much, and what category. Split equally, by percentage, or exact amounts." delay={0.1} />
              <StepCard number="3" icon={Share2}     title="Share & Settle"  description="See who owes who. Copy the share link and send it — everyone views results without signing in." delay={0.2} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════════════ */}
        <section ref={featuresRef} className="landing-section-padding" style={{ padding: '96px 0', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.013)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative' }}>
            <ScrollReveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 999, padding: '6px 16px', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 16 }}>FEATURES</span>
                <h2 style={{ color: 'var(--text-primary)' }}>Everything you need, nothing you don't</h2>
              </div>
            </ScrollReveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <FeatureCard featured icon={Zap}       color="#818CF8" bg="rgba(99,102,241,0.14)"   title="Quick Split — No Signup"     description="Split any bill instantly with zero account setup. Add people, log expenses, view settlements — all stored in your browser." delay={0} />
              <FeatureCard featured icon={Share2}    color="#10B981" bg="rgba(16,185,129,0.14)"   title="Share Without Login"         description="Generate a link anyone can open to view split results. No account required for viewers — just send the URL." delay={0.05} />
              <FeatureCard         icon={Calculator} color="#6366F1" bg="rgba(99,102,241,0.12)"   title="Smart Splitting"             description="Equal, percentage, exact amounts, or custom shares. Every real-world scenario is covered." delay={0.1} />
              <FeatureCard         icon={TrendingUp} color="#8B5CF6" bg="rgba(139,92,246,0.14)"  title="Debt Simplification"         description="Our algorithm minimises transactions — no one pays more times than necessary to settle all debts." delay={0.15} />
              <FeatureCard         icon={Globe}      color="#3B82F6" bg="rgba(59,130,246,0.14)"   title="Multi-Currency"              description="₹ INR, $ USD, € EUR, £ GBP — perfect for international trips and mixed-currency groups." delay={0.2} />
              <FeatureCard         icon={Smartphone} color="#EC4899" bg="rgba(236,72,153,0.14)"  title="Mobile Friendly"             description="Pixel-perfect on every screen. Use it at the table, on the road, or anywhere you share costs." delay={0.25} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CTA BOTTOM
        ══════════════════════════════════════════════════ */}
        <section className="landing-section-padding" style={{ padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 50%, rgba(99,102,241,0.18) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, background: 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
            <ScrollReveal>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '6px 16px', fontSize: '0.8125rem', fontWeight: 700, color: '#fff', marginBottom: 28 }}>
                <Sparkles size={13} /> Free forever · No credit card needed
              </div>
              <h2 style={{ color: '#fff', marginBottom: 18, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.025em' }}>
                Ready to split smarter?
              </h2>
              <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: 520, margin: '0 auto 52px', lineHeight: 1.75 }}>
                Jump in instantly with Quick Split, or create a free account for persistent groups and full history.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/quick-split" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: '#fff', color: '#4F46E5', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Zap size={17} fill="#4F46E5" color="#4F46E5" /> Try Quick Split Now
                  </motion.button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ background: 'rgba(255,255,255,0.14)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 28px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.35)', background: 'transparent', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    Create Free Account <ArrowRight size={17} />
                  </motion.button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════ */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 0', background: 'rgba(0,0,0,0.25)' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SplitSquareVertical size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>SplitEasy</span>
            </div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
              Built with ♥ by{' '}
              <a href="https://github.com/faizan" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Faizan</a>
            </p>
            <div style={{ display: 'flex', gap: 22 }}>
              {[['Quick Split', '/quick-split'], ['Log In', '/login'], ['Sign Up', '/register']].map(([label, to]) => (
                <Link key={to} to={to} style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-tertiary)'}
                >{label}</Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
