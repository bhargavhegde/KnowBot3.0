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
        <div className="flex flex-col h-full bg-[#0d1117]">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        Private Chat
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">Secure AI Knowledge Assistant</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearMessages}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold rounded-lg border border-white/5 transition-all flex items-center gap-2"
                        title="Clear chat history"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
                            🤖
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white tracking-tight">How can I help you today?</h2>
                            <p className="text-gray-500 max-w-sm mx-auto text-sm">
                                Ask me anything about the documents you've uploaded. Your data is processed locally and privately.
                            </p>
                        </div>
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
                                className="flex items-start gap-4"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs shrink-0">
                                    AI
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-5 py-3 shadow-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                        </div>
                                        <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Thinking</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-8 py-8">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-16 
                                     text-white placeholder-gray-500 resize-none focus:outline-none 
                                     focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 
                                     transition-all shadow-2xl"
                            rows={1}
                            style={{ minHeight: '56px', maxHeight: '200px' }}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-[10px] text-gray-500 mt-4 text-center font-medium uppercase tracking-[0.2em]">
                        Your local knowledge base is active ● Encrypted Connection
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ChatContainer;
