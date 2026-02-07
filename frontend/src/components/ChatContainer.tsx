/**
 * Chat Container Component
 * Main chat interface with message history and input
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { NeuralBackground } from './NeuralBackground';
import { useChat } from '@/context/ChatContext';

export function ChatContainer() {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages, isLoading, sendMessage, clearMessages } = useChat();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        setInput('');
        await sendMessage(trimmedInput);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleSuggestionClick = (action: string) => {
        if (action === 'web_search') {
            sendMessage("Search the web for more details about this.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative z-10">
            {/* Header with Animated Border */}
            <motion.div
                className="flex items-center justify-between px-8 py-5 border-b border-fuchsia-500/20 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(90deg, rgba(20, 0, 40, 0.9) 0%, rgba(8, 20, 60, 0.9) 100%)',
                    backdropFilter: 'blur(12px)'
                }}
            >
                {/* Animated gradient border */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{
                        background: 'linear-gradient(90deg, transparent, #e879f9, #22d3ee, #e879f9, transparent)',
                        backgroundSize: '200% 100%'
                    }}
                    animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />

                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
                        {/* Animated Neural Network Icon */}
                        <motion.div
                            className="w-10 h-10 relative"
                            whileHover={{ scale: 1.1 }}
                        >
                            <svg viewBox="0 0 40 40" className="w-full h-full">
                                {/* Connection Lines */}
                                <motion.line
                                    x1="10" y1="10" x2="30" y2="10"
                                    stroke="url(#grad1)"
                                    strokeWidth="1.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <motion.line
                                    x1="10" y1="10" x2="20" y2="30"
                                    stroke="url(#grad2)"
                                    strokeWidth="1.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: [0, 1, 0] }}
                                    transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                                />
                                <motion.line
                                    x1="30" y1="10" x2="20" y2="30"
                                    stroke="url(#grad3)"
                                    strokeWidth="1.5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: [0, 1, 0] }}
                                    transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                                />

                                {/* Nodes */}
                                <motion.circle
                                    cx="10" cy="10" r="3"
                                    fill="#fbbf24"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <motion.circle
                                    cx="30" cy="10" r="3"
                                    fill="#22d3ee"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                                />
                                <motion.circle
                                    cx="20" cy="30" r="3"
                                    fill="#e879f9"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                                />

                                {/* Gradients */}
                                <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
                                    </linearGradient>
                                    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#e879f9" stopOpacity="0.8" />
                                    </linearGradient>
                                    <linearGradient id="grad3" x1="100%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#e879f9" stopOpacity="0.8" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </motion.div>
                        <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent transform translate-y-0.5">
                            KnowBot 3.0
                        </span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.25em] font-semibold bg-gradient-to-r from-red-400/70 to-yellow-400/70 bg-clip-text text-transparent pl-16 -mt-1">
                        Neural Knowledge Engine
                    </p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        onClick={clearMessages}
                        className="px-4 py-2.5 bg-white/5 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-300 text-xs font-semibold rounded-xl 
                                 border border-white/5 hover:border-cyan-500/30 transition-all flex items-center gap-2 group"
                        title="Clear chat history"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="group-hover:rotate-12 transition-transform"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </motion.svg>
                        Clear
                    </motion.button>
                </div>
            </motion.div>

            {/* Replaced old BrainHologram with NeuralBackground */}
            <NeuralBackground />

            {/* Neural Network Floating Lines (Keeping these as nice accents) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
                        style={{
                            top: `${20 + i * 15}%`,
                            left: 0,
                            right: 0,
                        }}
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                            scaleX: [0.8, 1, 0.8],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                    />
                ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar relative z-10">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                        {/* Empty Spacer to let Background Hologram Shine */}
                        <div className="h-96"></div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, idx) => (
                            <MessageBubble
                                key={message.id || idx}
                                message={message}
                                isLatest={idx === messages.length - 1}
                                onSuggestionClick={handleSuggestionClick}
                            />
                        ))}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-4"
                            >
                                <motion.div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-cyan-300 shrink-0"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.2))',
                                        border: '1px solid rgba(34, 211, 238, 0.3)',
                                        boxShadow: '0 0 15px rgba(34, 211, 238, 0.2)'
                                    }}
                                    animate={{ boxShadow: ['0 0 15px rgba(34, 211, 238, 0.2)', '0 0 25px rgba(34, 211, 238, 0.4)', '0 0 15px rgba(34, 211, 238, 0.2)'] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    AI
                                </motion.div>
                                <div className="glass px-6 py-4 rounded-2xl rounded-tl-none shadow-xl border border-cyan-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <motion.span
                                                className="w-2 h-2 bg-cyan-400 rounded-full"
                                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                            />
                                            <motion.span
                                                className="w-2 h-2 bg-blue-400 rounded-full"
                                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                                            />
                                            <motion.span
                                                className="w-2 h-2 bg-purple-400 rounded-full"
                                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-widest uppercase">
                                            Processing
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-8 py-8 relative z-20">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative group">
                        {/* Animated glow border */}
                        <motion.div
                            className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500"
                            style={{
                                background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc, #38bdf8)',
                                backgroundSize: '300% 300%'
                            }}
                            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything about your documents..."
                            className="relative w-full bg-sky-200/95 backdrop-blur-xl border border-sky-400/30 rounded-2xl px-6 py-4 pr-16 
                                     text-blue-900 placeholder-blue-700/50 resize-none focus:outline-none focus:border-sky-500/50
                                     transition-all shadow-xl font-medium"
                            rows={1}
                            style={{ minHeight: '60px', maxHeight: '200px' }}
                            disabled={isLoading}
                        />
                        <motion.button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-3 p-3 text-white rounded-xl transition-all 
                                     disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                background: isLoading || !input.trim()
                                    ? 'rgba(107, 114, 128, 0.5)'
                                    : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                            }}
                            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </motion.button>
                    </form>
                    <motion.p
                        className="text-[10px] text-cyan-400/40 mt-4 text-center font-medium uppercase tracking-[0.2em]"
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        Powered by Neural RAG Engine {isLoading && "● Processing..."}
                    </motion.p>
                </div>
            </div>
        </div>
    );
}

export default ChatContainer;
