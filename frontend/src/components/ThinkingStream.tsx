'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ThinkingStreamProps {
    isVisible: boolean;
    steps: string[];
}

export function ThinkingStream({ isVisible, steps }: ThinkingStreamProps) {
    if (!isVisible) return null;

    return (
        <div className="flex flex-col gap-2 my-2 ml-12 max-w-[80%]">
            <AnimatePresence mode="popLayout">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center gap-3 text-xs font-mono"
                    >
                        {/* Status Dot */}
                        <div className="relative">
                            <motion.div
                                className="w-2 h-2 rounded-full bg-cyan-400"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <motion.div
                                className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 blur-sm"
                                animate={{
                                    opacity: [0.2, 0.6, 0.2]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>

                        {/* Step Text */}
                        <span className="text-cyan-300/80 tracking-wide">
                            {step}
                        </span>

                        {/* Scanning Line Effect */}
                        {index === steps.length - 1 && (
                            <motion.div
                                className="h-[1px] w-12 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                                animate={{
                                    x: [-20, 100],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
