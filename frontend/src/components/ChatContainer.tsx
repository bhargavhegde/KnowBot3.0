/**
 * Chat Container Component
 * Main chat interface with message history and input
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { useChat } from '@/hooks/useChat';

export function ChatContainer() {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages, isLoading, error, sendChatMessage, clearMessages } = useChat();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        setInput('');
        await sendChatMessage(trimmedInput);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d3748]">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        🧠 KnowBot
                    </h1>
                    <p className="text-sm text-gray-400">Your local & private personal knowledge assistant</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearMessages}
                        className="btn-secondary flex items-center gap-2"
                        title="Clear chat history"
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <div className="text-6xl mb-4">🧠</div>
                        <h2 className="text-xl font-medium mb-2">Welcome to KnowBot!</h2>
                        <p className="max-w-md">
                            Ask anything about your documents. Upload files in the sidebar to get started.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, idx) => (
                            <MessageBubble key={message.id || idx} message={message} />
                        ))}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#1e2530] flex items-center justify-center">
                                    🤖
                                </div>
                                <div className="chat-bubble-assistant px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="animate-pulse-subtle flex gap-1">
                                            <span className="w-2 h-2 bg-[#4a90e2] rounded-full"></span>
                                            <span className="w-2 h-2 bg-[#4a90e2] rounded-full animation-delay-200"></span>
                                            <span className="w-2 h-2 bg-[#4a90e2] rounded-full animation-delay-400"></span>
                                        </div>
                                        <span className="text-sm text-gray-400">Thinking...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[#2d3748] px-6 py-4">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about your documents..."
                            className="w-full bg-[#1e2530] border border-[#2d3748] rounded-lg px-4 py-3 pr-12 
                         text-[#e0e0e0] placeholder-gray-500 resize-none focus:outline-none 
                         focus:border-[#4a90e2] transition-colors"
                            rows={1}
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed 
                       disabled:transform-none disabled:shadow-none"
                    >
                        {isLoading ? '...' : 'Send'}
                    </button>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}

export default ChatContainer;
