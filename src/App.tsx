import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Marketplace } from './pages/Marketplace';
import { TalentMarketplace } from './pages/TalentMarketplace';
import { StartupDetail } from './pages/StartupDetail';
import { ProfileDetail } from './pages/ProfileDetail';
import { Chat } from './pages/Chat';
import { OnboardingPage } from './pages/OnboardingPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} /> {/* Reusing Login for simplicity */}
            
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } />
            
            <Route path="/talent" element={
              <ProtectedRoute>
                <TalentMarketplace />
              </ProtectedRoute>
            } />
            
            <Route path="/startup/:id" element={
              <ProtectedRoute>
                <StartupDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <ProfileDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            
            <Route path="/chat/:conversationId" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}
