
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '../components/icons';
import { loginOrRegister } from '../services/api';
import toast from 'react-hot-toast';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    setIsLoading(true);
    try {
      const { token } = await loginOrRegister(username, password);
      // NOTE: In a real app, the backend should set an HttpOnly cookie.
      // Storing JWT in localStorage is suitable for this frontend-only demo but is not secure.
      localStorage.setItem('authToken', token);
      toast.success('Welcome!');
      onLogin();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex items-center justify-center text-white p-4"
    >
      <div className="w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <HeartIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="font-serif text-4xl">Our Space</h1>
          <p className="text-white/70">Login or create your shared account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-md h-12 px-4 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              placeholder="e.g., us"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-md h-12 px-4 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-red-500 rounded-md font-semibold text-white transition-all duration-300 hover:bg-red-600 disabled:bg-red-500/50 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Enter Our World'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AuthPage;
