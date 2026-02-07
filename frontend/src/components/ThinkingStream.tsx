'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ThinkingStreamProps {
    isVisible: boolean;
    steps: string[];
}

export function ThinkingStream({ isVisible, steps }: ThinkingStreamProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!isVisible || steps.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 my-2 ml-12 max-w-[80%]">
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest hover:text-cyan-400 transition-colors w-fit"
                whileHover={{ x: 2 }}
            >
                <motion.span
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    ▶
                </motion.span>
                Thinking Process ({steps.length})
            </motion.button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden border-l border-cyan-500/20 pl-4 space-y-1"
                    >
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-2 text-xs font-mono text-cyan-300/60"
                            >
                                <span className="text-[8px] opacity-50">{(index + 1).toString().padStart(2, '0')}</span>
                                <span>{step}</span>
                                {index === steps.length - 1 && (
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        className="inline-block w-1.5 h-3 bg-cyan-500/50 align-middle ml-1"
                                    />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
