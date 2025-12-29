
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PhotosPage from './pages/PhotosPage';
import VideosPage from './pages/VideosPage';
import LettersPage from './pages/LettersPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import SecurityGate from './components/SecurityGate';
import { SECRET_SECURITY_CODE } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [hasPassedGate, setHasPassedGate] = useState<boolean>(sessionStorage.getItem('gatePassed') === 'true');
  const [background, setBackground] = useState<string | null>(localStorage.getItem('appBackground'));

  useEffect(() => {
    if (isAuthenticated) {
      const storedBg = localStorage.getItem('appBackground');
      if (storedBg) {
        setBackground(storedBg);
      } else {
        // Default romantic background
        setBackground('https://picsum.photos/1920/1080?random=1');
      }
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  const handleGatePass = (code: string) => {
    if (code === SECRET_SECURITY_CODE) {
      setHasPassedGate(true);
      sessionStorage.setItem('gatePassed', 'true');
      return true;
    }
    return false;
  };
  
  const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/auth" replace />;
  };

  return (
    <div className="relative min-h-screen w-full bg-black">
      <AnimatePresence mode="wait">
        {background && (
          <motion.div
            key="background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
              style={{ backgroundImage: `url(${background})` }}
            ></div>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <Toaster position="top-center" toastOptions={{
          className: 'bg-white/10 backdrop-blur-md text-white border border-white/20',
          duration: 4000,
        }}/>
        <HashRouter>
          <AnimatePresence mode="wait">
            {!hasPassedGate ? (
              <SecurityGate key="gate" onPass={handleGatePass} />
            ) : (
              <Routes>
                <Route path="/auth" element={!isAuthenticated ? <AuthPage onLogin={handleLogin} /> : <Navigate to="/" replace />} />
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <Layout onLogout={handleLogout}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/photos" element={<PhotosPage />} />
                          <Route path="/videos" element={<VideosPage />} />
                          <Route path="/letters" element={<LettersPage />} />
                          <Route path="/settings" element={<SettingsPage setAppBackground={setBackground} />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Layout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            )}
          </AnimatePresence>
        </HashRouter>
      </div>
    </div>
  );
};

export default App;
