import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VoiceAgentModal } from './components/VoiceAgentModal';

import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { MandiPage } from './pages/MandiPage';
import { SubsidyPage } from './pages/SubsidyPage';
import { PlotsPage } from './pages/PlotsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading user session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading user session...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 relative">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/mandi" element={<MandiPage />} />
                <Route path="/subsidies" element={<SubsidyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/scan" element={<ProtectedRoute><DiagnosisPage /></ProtectedRoute>} />
                <Route path="/plots" element={<ProtectedRoute><PlotsPage /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            
            {/* Omnipresent Vernacular Voice AI Agent */}
            <VoiceAgentModal />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
