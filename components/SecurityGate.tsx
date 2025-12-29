
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, LockIcon } from './icons';
import toast from 'react-hot-toast';

interface SecurityGateProps {
  onPass: (code: string) => boolean;
}

const SecurityGate: React.FC<SecurityGateProps> = ({ onPass }) => {
  const [code, setCode] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUnlocking) return;

    setIsUnlocking(true);
    setTimeout(() => {
      if (!onPass(code)) {
        toast.error('Incorrect Code');
        setIsUnlocking(false);
        setCode('');
      }
      // On success, the parent component will unmount this component
    }, 1500);
  };

  const gateVariants = {
    closed: { y: 0 },
    open: { y: '-100%' },
  };

  return (
    <motion.div
      key="security-gate"
      initial="closed"
      animate={isUnlocking ? 'open' : 'closed'}
      exit="open"
      variants={gateVariants}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
        >
          <HeartIcon className="w-24 h-24 text-red-500 mx-auto mb-4" />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="font-serif text-4xl md:text-6xl mb-2"
        >
          Our Secret Garden
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-lg md:text-xl text-white/70 mb-8"
        >
          Enter the secret code to unlock our world.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Secret Code"
              className="bg-white/10 border border-white/20 rounded-full w-64 md:w-80 h-12 text-center text-lg tracking-widest pl-10 pr-4 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="group relative w-64 md:w-80 h-12 flex items-center justify-center rounded-full bg-red-500 text-white font-semibold overflow-hidden transition-all duration-300 hover:bg-red-600 disabled:opacity-50"
            disabled={isUnlocking}
          >
            <span className="relative z-10">{isUnlocking ? 'Unlocking...' : 'Unlock'}</span>
          </button>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default SecurityGate;
