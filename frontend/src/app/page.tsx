/**
 * KnowBot Main Page
 * Combines Sidebar and ChatContainer
 */

'use client';

import { Sidebar } from '@/components/Sidebar';
import { ChatContainer } from '@/components/ChatContainer';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e1117]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatContainer />
      </div>
    </main>
  );
}
