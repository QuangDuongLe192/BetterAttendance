import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './stores/AuthContext';
import { RequireAuth } from './stores/RequireAuth';
import { SetupApp } from './pages/SetUp/SetupApp';
import { ManagerApp } from './pages/Manager/ManagerApp';
import { FinanceApp } from './pages/Finance/FinanceApp';
import { Landing } from './pages/Landing/Landing';
import { Login } from './pages/Login/Login';
import { ForbiddenPage } from './pages/Forbidden/ForbiddenPage';
import { NotFoundPage } from './pages/Notfound/NotFoundPage';

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1E2D3D',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 10,
              boxShadow: '0 12px 40px rgba(30,45,61,0.28)',
            },
            classNames: { toast: 'ba-toast' },
          }}
          icons={{
            success: <span style={{ width: 20, height: 20, borderRadius: 999, background: '#00B4A0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>,
            error:   <span style={{ width: 20, height: 20, borderRadius: 999, background: '#EF4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</span>,
            info:    <span style={{ width: 20, height: 20, borderRadius: 999, background: '#3B82F6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>ℹ</span>,
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />

          {/* Require login */}
          <Route path="/" element={<RequireAuth><Landing /></RequireAuth>} />

          {/* Require role */}
          <Route path="/setup" element={<RequireAuth roles={['ADMIN']}><SetupApp /></RequireAuth>} />
          <Route path="/setup/:section" element={<RequireAuth roles={['ADMIN']}><SetupApp /></RequireAuth>} />
          <Route path="/setup/:section/:subId" element={<RequireAuth roles={['ADMIN']}><SetupApp /></RequireAuth>} />

          <Route path="/manager" element={<RequireAuth roles={['MANAGER', 'ADMIN']}><ManagerApp /></RequireAuth>} />
          <Route path="/manager/:section" element={<RequireAuth roles={['MANAGER', 'ADMIN']}><ManagerApp /></RequireAuth>} />
          <Route path="/manager/:section/:locId" element={<RequireAuth roles={['MANAGER', 'ADMIN']}><ManagerApp /></RequireAuth>} />

          <Route path="/finance" element={<RequireAuth roles={['FINANCE', 'ADMIN']}><FinanceApp /></RequireAuth>} />
          <Route path="/finance/:section" element={<RequireAuth roles={['FINANCE', 'ADMIN']}><FinanceApp /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
