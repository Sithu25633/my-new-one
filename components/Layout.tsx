
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, PhotoIcon, VideoIcon, LetterIcon, SettingsIcon, LogoutIcon } from './icons';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const navItems = [
  { path: '/', name: 'Home', icon: HeartIcon },
  { path: '/photos', name: 'Photos', icon: PhotoIcon },
  { path: '/videos', name: 'Videos', icon: VideoIcon },
  { path: '/letters', name: 'Letters', icon: LetterIcon },
  { path: '/settings', name: 'Settings', icon: SettingsIcon },
];

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // NOTE: This is a best-effort attempt to prevent screenshots.
  // It is not foolproof, as users can still use hardware or third-party software.
  const secureViewStyles: React.CSSProperties = {
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none',
  };

  const NavItem: React.FC<{ item: typeof navItems[0], isOpen: boolean }> = ({ item, isOpen }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <item.icon className="w-6 h-6 flex-shrink-0" />
      <AnimatePresence>
        {isOpen && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap"
            >
              {item.name}
            </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );

  return (
    <div className="flex min-h-screen text-white" style={secureViewStyles}>
      {/* Sidebar */}
      <motion.nav 
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col p-4"
      >
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white/70 hover:text-white transition-colors mb-8 self-center">
            <HeartIcon className="w-8 h-8 text-red-400" />
        </button>

        <div className="flex-grow space-y-2">
          {navItems.map((item) => <NavItem key={item.path} item={item} isOpen={isSidebarOpen} /> )}
        </div>
        
        <button
            onClick={onLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-200"
        >
            <LogoutIcon className="w-6 h-6 flex-shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    Logout
                  </motion.span>
              )}
            </AnimatePresence>
        </button>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
