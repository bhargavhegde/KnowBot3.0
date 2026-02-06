'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatContainer } from '@/components/ChatContainer';
import { useAuth } from '@/context/AuthContext';
import { BrainLoader } from '@/components/BrainLoader';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { user, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Show loader for at least 2.5 seconds on mount
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <BrainLoader />;

  if (!user) return null;

  return (
    <main className="flex h-screen overflow-hidden relative">
      {/* Vibrant Fluid Background */}
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(-45deg, #2e1065, #4c1d95, #701a75, #083344)',
          backgroundSize: '400% 400%'
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating Particles/Orb Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 mix-blend-screen">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600 rounded-full blur-[128px]"
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-[128px]"
          animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Animated Loader Overlay */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            className="fixed inset-0 z-[100]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <BrainLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-0">
        {/* Aurora Nebula Background */}
        <div className="aurora-bg"></div>

        {/* Hex Grid Pattern Overlay */}
        <div className="hex-grid fixed inset-0 pointer-events-none z-0" />

        <ChatContainer />
      </div>
    </main>
  );
}
