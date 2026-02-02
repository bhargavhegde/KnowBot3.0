/**
 * KnowBot Main Page
 * Combines Sidebar and ChatContainer
 */

'use client';

import { Sidebar } from '@/components/Sidebar';
import { ChatContainer } from '@/components/ChatContainer';

export default function Home() {
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
