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
      {/* Base Background Gradient */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #030810 0%, #0a1628 40%, #0c1a2e 70%, #0a1628 100%)'
        }}
      />

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
