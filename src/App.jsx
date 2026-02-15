import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SoundProvider } from './contexts/SoundContext';
import { GeminiProvider } from './contexts/GeminiContext';
import { GamificationProvider } from './contexts/GamificationContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Nexus = lazy(() => import('./pages/Nexus'));
const Arcade = lazy(() => import('./pages/Arcade'));
const NeuroScan = lazy(() => import('./pages/NeuroScan'));
const Identity = lazy(() => import('./pages/Identity'));

import BootSequence from './components/ui/BootSequence';

function App() {
  const [booted, setBooted] = React.useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <GeminiProvider>
          <SoundProvider>
            <GamificationProvider>
              {!booted ? (
                <BootSequence onComplete={() => setBooted(true)} />
              ) : (
                <Router>
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/login" element={<Login />} />

                      <Route path="/" element={
                        <PrivateRoute>
                          <MainLayout />
                        </PrivateRoute>
                      }>
                        <Route index element={<Dashboard />} />
                        <Route path="nexus" element={<Nexus />} />
                        <Route path="arcade" element={<Arcade />} />
                        <Route path="scan" element={<NeuroScan />} />
                        <Route path="identity" element={<Identity />} />
                      </Route>

                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </Suspense>
                </Router>
              )}
            </GamificationProvider>
          </SoundProvider>
        </GeminiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
