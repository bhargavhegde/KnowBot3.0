/**
 * Message Bubble Component
 * Displays individual chat messages with citations
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Message as ChatMessage, Citation } from '@/lib/api';
import { CyberBrainIcon } from './CyberBrainIcon';

interface MessageBubbleProps {
    message: ChatMessage;
    isLatest?: boolean; // To trigger laser effect
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
    const [showCitations, setShowCitations] = useState(false);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const isUser = message.role === 'user';
    const hasCitations = message.citations && message.citations.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 relative group`}
        >
            <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative z-20
          ${isUser ? 'bg-blue-600' : 'bg-transparent'}`}
                >
                    {isUser ? '👤' : <CyberBrainIcon className="w-full h-full drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />}
                </div>

                {/* Laser Eye Effect Overlay */}
                {!isUser && isLatest && (
                    <div className="absolute top-4 left-5 w-[800px] h-[200px] pointer-events-none z-0 opacity-80 overflow-hidden">
                        <svg width="100%" height="100%" className="overflow-visible">
                            <defs>
                                <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                                </linearGradient>
                                <filter id="laserGlow">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            {/* The Beam */}
                            <motion.line
                                x1="20" y1="10"
                                x2="100%" y2="20"
                                stroke="url(#laserGrad)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                filter="url(#laserGlow)"
                                initial={{ opacity: 0, x2: 50 }}
                                animate={{
                                    opacity: [0, 1, 0.5, 0],
                                    x2: ["50", "200", "400"],
                                    y2: [10, 40, 10]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            {/* Eye Sparkle */}
                            <motion.circle cx="20" cy="10" r="2" fill="#ec4899" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.1, repeat: Infinity }} />
                        </svg>
                    </div>
                )}

                {/* Message Content */}
                <div className="flex flex-col relative z-10" ref={bubbleRef}>
                    <div className={`px-5 py-4 ${isUser ? 'chat-bubble-user text-white' : 'chat-bubble-assistant relative overflow-hidden'}`}>
                        {/* Scanning Scanline for Assistant */}
                        {!isUser && isLatest && (
                            <motion.div
                                className="absolute inset-0 bg-blue-400/10 pointer-events-none"
                                initial={{ top: -100 }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                style={{ height: '20px', boxShadow: '0 0 20px #22d3ee' }}
                            />
                        )}

                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                    code: ({ children }) => (
                                        <code className="bg-[#1e2530] px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs">{children}</code>
                                    ),
                                    pre: ({ children }) => (
                                        <pre className="bg-[#0f172a] p-4 rounded-xl border border-white/5 overflow-x-auto my-3 text-sm scrollbar-thin scrollbar-thumb-gray-700">{children}</pre>
                                    ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Citations */}
                    {!isUser && hasCitations && (
                        <div className="mt-2">
                            <button
                                onClick={() => setShowCitations(!showCitations)}
                                className="text-xs text-[#4a90e2] hover:text-[#5ba0f2] flex items-center gap-1 transition-colors"
                            >
                                📌 {showCitations ? 'Hide' : 'Show'} Sources ({message.citations.length})
                            </button>

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
                </div>
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
        <div className="citation-box text-xs bg-[#0f172a] border border-white/5 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[#22d3ee]">Source {index}</span>
                <span className="text-gray-500">({citation.metadata?.source || 'Unknown'})</span>
                {citation.metadata?.page && <span className="text-gray-500">Page {citation.metadata.page}</span>}
            </div>
            <p className="text-gray-400 leading-relaxed">
                {expanded || !needsExpand
                    ? content
                    : `${content.slice(0, previewLength)}...`}
            </p>
            {needsExpand && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-[#22d3ee] hover:underline mt-1"
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </div>
    );
}

export default MessageBubble;
