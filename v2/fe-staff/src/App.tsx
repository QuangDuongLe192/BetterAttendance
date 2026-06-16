import { useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabBar } from './shared/components/TabBar';
import { AuthGuard } from './components/AuthGuard';
import { useSwipeTabs } from './shared/hooks/useSwipeTabs';
import { RoleGuard } from './components/RoleGuard';
import { LoginPage } from './pages/LoginPage';
import { TodayPage } from './pages/TodayPage';
import { CalendarPage } from './pages/CalendarPage';
import { ShiftDetailPage } from './pages/ShiftDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { RequestsPage } from './pages/RequestsPage';
import { RequestFormPage } from './pages/RequestFormPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { LanguagePage } from './pages/LanguagePage';
import { ActivityPage } from './pages/ActivityPage';
import { WeeklySchedulePage } from './pages/WeeklySchedulePage';
import { AdminRequestsPage } from './pages/AdminRequestsPage';
import { ManagerCalendarPage } from './pages/ManagerCalendarPage';
import { useMe } from './features/auth/hooks/useMe';
import type { ApiError } from './shared/types';
import { ExpectedSalaryPage } from './pages/ExpectedSalaryPage';
import { GpsCheckPage } from './pages/GpsCheckPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        const apiErr = (error as unknown) as ApiError;
        // 401 handled in request(); timeout shouldn't auto-retry
        if (apiErr?.code === 'UNAUTHORIZED' || apiErr?.code === 'TIMEOUT') return false;
        return failureCount < 2;
      },
    },
  },
});

// Triggers GET /api/auth/me on app bootstrap so authStore.user is populated.
// 401 handling is centralised in request() which calls clearAuth() directly.
function AppBootstrap() {
  useMe();
  return null;
}

function RouterContent() {
  const swipeRef = useRef<HTMLDivElement>(null);
  useSwipeTabs(swipeRef);
  return (
    <>
      <AppBootstrap />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/clock/:shiftId/:action" element={
          <AuthGuard>
            <GpsCheckPage />
          </AuthGuard>
        } />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <div ref={swipeRef} style={{ display: 'contents' }}>
              <Routes>
                <Route path="/" element={<TodayPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/weekly" element={<WeeklySchedulePage />} />
                <Route path="/shifts/:id" element={<ShiftDetailPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/requests/create/:type" element={<RequestFormPage />} />
                <Route path="/requests/:id" element={<RequestDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/salary" element={<ExpectedSalaryPage />} />
                <Route path="/profile/language" element={<LanguagePage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/admin/requests" element={
                  <RoleGuard allow={['admin']}>
                    <AdminRequestsPage />
                  </RoleGuard>
                } />
                <Route path="/manager/calendar" element={
                  <RoleGuard allow={['admin', 'manager']}>
                    <ManagerCalendarPage />
                  </RoleGuard>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <TabBar />
              </div>
            </AuthGuard>
          }
        />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouterContent />

      </BrowserRouter>
    </QueryClientProvider>
  );
}
