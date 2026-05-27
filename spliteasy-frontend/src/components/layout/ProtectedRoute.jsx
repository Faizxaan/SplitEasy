import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SplitSquareVertical } from 'lucide-react';

function FullPageSpinner() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        width: 48, height: 48,
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        <SplitSquareVertical size={24} color="#fff" />
      </div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Loading…</p>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
