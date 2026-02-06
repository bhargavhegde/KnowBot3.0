/**
 * Message Bubble Component
 * Displays individual chat messages with citations and TTS controls
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Message as ChatMessage, Citation } from '@/lib/api';
import { AnimatedBot } from './AnimatedBot';
import { useSpeech } from '@/hooks/useSpeech';

interface MessageBubbleProps {
    message: ChatMessage;
    isLatest?: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
    const [showCitations, setShowCitations] = useState(false);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const isUser = message.role === 'user';
    const hasCitations = message.citations && message.citations.length > 0;

    const { speak, stop, isSpeaking, isSupported } = useSpeech();

    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 relative group`}
        >
            <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <motion.div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative z-20
                        ${isUser ? '' : 'bg-transparent'}`}
                    style={isUser ? {
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
                    } : {}}
                    whileHover={{ scale: 1.1 }}
                >
                    {isUser ? (
                        <span className="text-lg">👤</span>
                    ) : (
                        <AnimatedBot mode="idle" size="xs" />
                    )}
                </motion.div>

                {/* Message Content */}
                <motion.div
                    className="flex flex-col relative z-10"
                    ref={bubbleRef}
                    whileHover={{ x: isUser ? -2 : 2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <div
                        className={`px-5 py-4 relative overflow-hidden transition-all duration-300
                            ${isUser
                                ? 'rounded-2xl rounded-tr-sm text-white'
                                : 'rounded-2xl rounded-tl-sm'}`}
                        style={isUser ? {
                            background: 'linear-gradient(135deg, #0ea5e9, #3b82f6, #6366f1)',
                            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                        } : {
                            background: 'rgba(15, 30, 55, 0.3)', // Highly transparent
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(251, 191, 36, 0.2)', // Amber border
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {/* Message Content Container */}
                        <div className="prose prose-invert prose-sm max-w-none relative z-10">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className={`mb-2 last:mb-0 leading-relaxed ${isUser ? 'text-white' : 'text-amber-100/90'}`}>{children}</p>, // Gold text for bot
                                    ul: ({ children }) => <ul className={`list-disc ml-4 mb-2 ${isUser ? 'text-white' : 'text-amber-100/90'}`}>{children}</ul>,
                                    ol: ({ children }) => <ol className={`list-decimal ml-4 mb-2 ${isUser ? 'text-white' : 'text-amber-100/90'}`}>{children}</ol>,
                                    strong: ({ children }) => <strong className="font-bold text-amber-300">{children}</strong>,
                                    code: ({ children }) => (
                                        <code className="bg-[#0c1a2e] px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs border border-cyan-500/20">{children}</code>
                                    ),
                                    pre: ({ children }) => (
                                        <pre className="bg-[#0c1a2e] p-4 rounded-xl border border-cyan-500/20 overflow-x-auto my-3 text-sm">{children}</pre>
                                    ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* TTS Controls - Only for assistant messages */}
                    {!isUser && isSupported && (
                        <div className="mt-2 flex items-center gap-2">
                            <motion.button
                                onClick={() => isSpeaking ? stop() : speak(message.content)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                    ${isSpeaking
                                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'
                                    }`}
                                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isSpeaking ? (
                                    <>
                                        <motion.svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                        >
                                            <rect x="6" y="6" width="12" height="12" rx="1" />
                                        </motion.svg>
                                        <span>Stop</span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                        <span>Listen</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    )}

                    {/* Citations */}
                    {!isUser && hasCitations && (
                        <div className="mt-2">
                            <motion.button
                                onClick={() => setShowCitations(!showCitations)}
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                                whileHover={{ x: 3 }}
                            >
                                📌 {showCitations ? 'Hide' : 'Show'} Sources ({message.citations.length})
                            </motion.button>

                            {showCitations && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 space-y-2"
                                >
                                    {message.citations.map((citation, idx) => (
                                        <CitationCard key={idx} citation={citation} index={idx + 1} />
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}

interface CitationCardProps {
    citation: Citation;
    index: number;
}

function CitationCard({ citation, index }: CitationCardProps) {
    const [expanded, setExpanded] = useState(false);
    const content = citation.content || '';
    const previewLength = 200;
    const needsExpand = content.length > previewLength;

    return (
        <motion.div
            className="text-xs p-3 rounded-xl"
            style={{
                background: 'rgba(8, 25, 50, 0.5)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderLeft: '3px solid #fbbf24' // Amber
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 4, borderColor: 'rgba(34, 211, 238, 0.3)' }}
        >
            <div className="flex items-center gap-2 mb-1.5">
                <span className="font-bold text-amber-400">Source {index}</span>
                <span className="text-gray-500">({citation.metadata?.source || 'Unknown'})</span>
                {citation.metadata?.page && <span className="text-gray-500">Page {citation.metadata.page}</span>}
            </div>
            <p className="text-gray-400 leading-relaxed">
                {expanded || !needsExpand
                    ? content
                    : `${content.slice(0, previewLength)}...`}
            </p>
            {needsExpand && (
                <motion.button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-amber-400 hover:text-amber-300 mt-1.5"
                    whileHover={{ x: 2 }}
                >
                    {expanded ? 'Show less' : 'Show more'}
                </motion.button>
            )}
        </motion.div>
    );
}

export default MessageBubble;
