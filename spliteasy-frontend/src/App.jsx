import { lazy, Suspense, Component } from 'react';
import { Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GroupDetail = lazy(() => import('./pages/GroupDetail'));
const AddExpense = lazy(() => import('./pages/AddExpense'));
const JoinGroup = lazy(() => import('./pages/JoinGroup'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const GroupsList = lazy(() => import('./pages/GroupsList'));
const GuestQuickSplit = lazy(() => import('./pages/GuestQuickSplit'));
const GuestQuickSplitWorkspace = lazy(() => import('./pages/GuestQuickSplitWorkspace'));
const GuestQuickSplitView = lazy(() => import('./pages/GuestQuickSplitView'));
const QuickSplitsList = lazy(() => import('./pages/QuickSplitsList'));
const AuthQuickSplitWorkspace = lazy(() => import('./pages/AuthQuickSplitWorkspace'));
const QuickSplitSharePage = lazy(() => import('./pages/QuickSplitSharePage'));

function PageLoader() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: 'red' }}>
          <h2>Render Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) {
    // Honour the ?redirect= param so invite-link flows land on /join/:code
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}

const TOAST_STYLE = {
  fontFamily: 'var(--font)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  fontSize: '0.9rem',
  fontWeight: 500,
};

export default function App() {
  const location = useLocation();

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: TOAST_STYLE,
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/join/:inviteCode" element={<JoinGroup />} />
            <Route path="/quick-splits/share/:shareToken" element={<QuickSplitSharePage />} />

            <Route element={<AppLayout />}>
              <Route path="/quick-split" element={<GuestQuickSplit />} />
              <Route path="/quick-split/view" element={<GuestQuickSplitView />} />
              <Route path="/quick-split/:sessionId" element={<GuestQuickSplitWorkspace />} />
            </Route>

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/groups" element={<GroupsList />} />
              <Route path="/groups/:groupId" element={<GroupDetail />} />
              <Route path="/groups/:groupId/expenses/new" element={<AddExpense />} />
              <Route path="/groups/:groupId/expenses/:expenseId/edit" element={<AddExpense />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/quick-splits" element={<QuickSplitsList />} />
              <Route path="/quick-splits/:draftId" element={<AuthQuickSplitWorkspace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      </ErrorBoundary>
    </>
  );
}
