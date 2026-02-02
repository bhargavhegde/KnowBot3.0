/**
 * Chat Container Component
 * Main chat interface with message history and input
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { BrainHologram } from './BrainHologram';
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
        <div className="flex flex-col h-full bg-transparent relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                        <span className="text-2xl filter drop-shadow">🧠</span> KnowBot
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-blue-300/70">Your private knowledge assistant</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearMessages}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold rounded-xl border border-white/5 transition-all flex items-center gap-2 hover:shadow-lg hover:border-white/10 group"
                        title="Clear chat history"
                    >
                        {/* Cute Dustbin Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="group-hover:rotate-12 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                        {/* Holographic Brain Animation */}
                        <div className="scale-125 transform transition-transform duration-1000">
                            <BrainHologram />
                        </div>

                        <div className="space-y-3 relative z-10 -mt-10">
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-100 to-white drop-shadow-xl">
                                How can I help you today?
                            </h2>
                            <p className="text-blue-200/60 max-w-sm mx-auto text-sm font-light leading-relaxed">
                                Ask me anything about your documents. <br />
                                <span className="opacity-50 text-xs">Ready to process complex queries.</span>
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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-4"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-300 shrink-0 shadow-lg shadow-blue-500/10">
                                    AI
                                </div>
                                <div className="glass px-6 py-4 rounded-2xl rounded-tl-none shadow-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                                        </div>
                                        <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Thinking</span>
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
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="relative w-full bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 pr-16 
                                     text-white placeholder-gray-500 resize-none focus:outline-none 
                                     transition-all shadow-2xl"
                            rows={1}
                            style={{ minHeight: '60px', maxHeight: '200px' }}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-3 p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-[10px] text-blue-300/40 mt-4 text-center font-medium uppercase tracking-[0.2em] animate-pulse-subtle">
                        Powered by Neural RAG Engine ● Secure Local Processing {isLoading && "● Processing..."}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ChatContainer;
