
import React from 'react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="font-serif text-5xl md:text-8xl text-white drop-shadow-lg"
      >
        Welcome to Our World
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
        className="mt-4 text-xl md:text-2xl text-white/80 max-w-2xl"
      >
        A special place for our memories, our stories, and our love. Use the navigation to explore our journey together.
      </motion.p>
    </div>
  );
};

export default HomePage;
