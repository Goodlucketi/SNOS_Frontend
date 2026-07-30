import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './context/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';

// Pages
import HomePage from './pages/Home';
import AboutPage from './pages/AboutPage';
import WhatWeOfferPage from './pages/WhatWeOfferPage';
import Register from './pages/Register';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SupportPage from './pages/SupportPage';
import Wallet from './pages/Wallet';

// Contexts
import { useUI } from './context/UIContext';

// Loaders
import GlobalLoader from './components/GlobalLoader';
import SubtleLoader from './components/SubtleLoader';

// Dashboard Views
import UserDash from './components/UserDash';
import Alerts from './components/Alerts';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Devices from './components/Devices';
import Orders from './components/Orders';

// Role-based Dashboard Views
import RoleDashboardRedirect from './components/RoleDashboardRedirect';
import OrgOverview from './components/OrgOverview';
import Properties from './components/Properties';
import Team from './components/Team';
import PlatformOverview from './components/PlatformOverview';
import Organizations from './components/Organizations';
import ClientsDirectory from './components/ClientsDirectory';

// Global Components
import ChatBot from './components/chat/ChatBot';

import { CatalogProvider } from './context/CatalogContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Snaps to the top immediately without smooth scrolling
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const { isLoading, loaderText, isSubtleLoading, subtleLoaderText } = useUI();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CatalogProvider>
            <BrowserRouter>
            {/* Global UI Loaders */}
            <GlobalLoader isLoading={isLoading} loaderText={loaderText} />
            <SubtleLoader isSubtleLoading={isSubtleLoading} subtleLoaderText={subtleLoaderText} />

            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/what-we-offer" element={<WhatWeOfferPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/support" element={<SupportPage />} />

              {/* Secure Client Terminal Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              >
                {/* Redirect from bare /dashboard to the right landing view for the resolved role */}
                <Route index element={<RoleDashboardRedirect />} />

                {/* Client */}
                <Route path="userdash" element={<UserDash />} />
                <Route path="devices" element={<Devices />} />
                <Route path="orders" element={<Orders />} />

                {/* Org admin / Sub admin (estate or corporate) */}
                <Route path="org-overview" element={<OrgOverview />} />
                <Route path="properties" element={<Properties />} />
                <Route path="team" element={<Team />} />

                {/* Super admin (platform) */}
                <Route path="platform" element={<PlatformOverview />} />
                <Route path="organizations" element={<Organizations />} />
                <Route path="clients" element={<ClientsDirectory />} />

                {/* Shared across all roles */}
                <Route path="alerts" element={<Alerts />} />
                <Route path="profile" element={<Profile />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<RoleDashboardRedirect />} />
              </Route>


              {/* Global Wildcard Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Chatbot */}
            <ChatBot />

            {/* Notification Dispatcher */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              aria-label="Security System Notifications"
            />
          </BrowserRouter>
          </CatalogProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
