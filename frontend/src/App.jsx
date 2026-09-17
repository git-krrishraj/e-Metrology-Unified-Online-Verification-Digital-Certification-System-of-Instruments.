import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { OfflineProvider } from './context/OfflineContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { RoleLayout } from './components/layout/RoleLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { PublicVerificationPage } from './pages/public/PublicVerificationPage';
import { PublicDirectorySearch } from './pages/public/PublicDirectorySearch';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Consumer Pages
import { ConsumerDashboard } from './pages/consumer/ConsumerDashboard';
import { MyInstruments } from './pages/consumer/MyInstruments';
import { SubmitApplication } from './pages/consumer/SubmitApplication';
import { MyApplications } from './pages/consumer/MyApplications';
import { MyCertificates } from './pages/consumer/MyCertificates';

// Officer Pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { AssignedQueue } from './pages/officer/AssignedQueue';
import { DigitalInspectionForm } from './pages/officer/DigitalInspectionForm';
import { VerificationHistory } from './pages/officer/VerificationHistory';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ApplicationAllocation } from './pages/admin/ApplicationAllocation';
import { AllCertificates } from './pages/admin/AllCertificates';
import { ExpiryTracker } from './pages/admin/ExpiryTracker';
import { AllInstruments } from './pages/admin/AllInstruments';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <OfflineProvider>
              <Routes>
                {/* Public Routes with Public Layout */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify/:certId" element={<PublicVerificationPage />} />
                  <Route path="/verify/search" element={<PublicDirectorySearch />} />
                </Route>

                {/* Consumer Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['consumer', 'admin']} />}>
                  <Route element={<RoleLayout />}>
                    <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
                    <Route path="/consumer/instruments" element={<MyInstruments />} />
                    <Route path="/consumer/apply" element={<SubmitApplication />} />
                    <Route path="/consumer/applications" element={<MyApplications />} />
                    <Route path="/consumer/certificates" element={<MyCertificates />} />
                  </Route>
                </Route>

                {/* Officer (LMO & GATC) Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['lmo', 'gatc', 'admin']} />}>
                  <Route element={<RoleLayout />}>
                    <Route path="/officer/dashboard" element={<OfficerDashboard />} />
                    <Route path="/officer/queue" element={<AssignedQueue />} />
                    <Route path="/officer/inspect/:id" element={<DigitalInspectionForm />} />
                    <Route path="/officer/history" element={<VerificationHistory />} />
                  </Route>
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route element={<RoleLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/allocation" element={<ApplicationAllocation />} />
                    <Route path="/admin/certificates" element={<AllCertificates />} />
                    <Route path="/admin/expiry" element={<ExpiryTracker />} />
                    <Route path="/admin/instruments" element={<AllInstruments />} />
                  </Route>
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </OfflineProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
