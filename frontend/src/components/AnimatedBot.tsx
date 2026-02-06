/**
 * AnimatedBot Component
 * Pure SVG geometric robot with smooth animations - no images, no artifacts
 */

'use client';

import { motion } from 'framer-motion';

interface AnimatedBotProps {
    mode?: 'idle' | 'hover' | 'thinking';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function AnimatedBot({ mode = 'idle', size = 'md', className = '' }: AnimatedBotProps) {
    const sizes = {
        sm: 80,
        md: 120,
        lg: 160
    };

    const dimension = sizes[size];
    const isThinking = mode === 'thinking';
    const isHovering = mode === 'hover';

    return (
        <motion.div
            className={`relative ${className}`}
            style={{ width: dimension, height: dimension }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 0 20px rgba(255, 165, 0, 0.4))' }}
            >
                {/* Glow effect background */}
                <defs>
                    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
                    </radialGradient>
                    <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
                    </radialGradient>
                </defs>

                {/* Antennae */}
                <motion.g>
                    {/* Left Antenna */}
                    <motion.line
                        x1="35" y1="20" x2="35" y2="10"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={isHovering ? { y1: [20, 15, 20] } : {}}
                        transition={{ duration: 0.6, repeat: Infinity }}
                    />
                    <motion.circle
                        cx="35" cy="10" r="3"
                        fill="#fbbf24"
                        animate={{
                            scale: isThinking ? [1, 1.5, 1] : [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                            duration: isThinking ? 0.8 : 2,
                            repeat: Infinity,
                            delay: 0
                        }}
                        style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))' }}
                    />

                    {/* Right Antenna */}
                    <motion.line
                        x1="65" y1="20" x2="65" y2="10"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={isHovering ? { y1: [20, 15, 20] } : {}}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.circle
                        cx="65" cy="10" r="3"
                        fill="#fbbf24"
                        animate={{
                            scale: isThinking ? [1, 1.5, 1] : [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                            duration: isThinking ? 0.8 : 2,
                            repeat: Infinity,
                            delay: 0.4
                        }}
                        style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))' }}
                    />
                </motion.g>

                {/* Head */}
                <motion.rect
                    x="30" y="20" width="40" height="35" rx="8"
                    fill="url(#gradient-head)"
                    stroke="#f97316"
                    strokeWidth="2"
                    animate={isHovering ? {
                        scale: [1, 1.05, 1],
                        rotate: [-2, 2, -2]
                    } : {
                        y: [20, 18, 20]
                    }}
                    transition={{
                        duration: isHovering ? 1 : 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ transformOrigin: '50px 37.5px' }}
                />

                {/* Eyes */}
                <motion.g>
                    {/* Left Eye */}
                    <motion.ellipse
                        cx={isThinking ? undefined : "40"}
                        cy="35" rx="4" ry="5"
                        fill="url(#eyeGlow)"
                        animate={isThinking ? {
                            cx: [40, 42, 38, 40],
                        } : isHovering ? {
                            ry: [5, 7, 5]
                        } : {
                            ry: [5, 5, 1, 5]  // Blink
                        }}
                        transition={isThinking ? {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } : isHovering ? {
                            duration: 0.3
                        } : {
                            duration: 0.3,
                            repeat: Infinity,
                            repeatDelay: 4
                        }}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.8))' }}
                    />

                    {/* Right Eye */}
                    <motion.ellipse
                        cx={isThinking ? undefined : "60"}
                        cy="35" rx="4" ry="5"
                        fill="url(#eyeGlow)"
                        animate={isThinking ? {
                            cx: [60, 62, 58, 60],
                        } : isHovering ? {
                            ry: [5, 7, 5]
                        } : {
                            ry: [5, 5, 1, 5]  // Blink
                        }}
                        transition={isThinking ? {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } : isHovering ? {
                            duration: 0.3
                        } : {
                            duration: 0.3,
                            repeat: Infinity,
                            repeatDelay: 4
                        }}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.8))' }}
                    />
                </motion.g>

                {/* Body */}
                <motion.rect
                    x="25" y="58" width="50" height="35" rx="10"
                    fill="rgba(30, 41, 59, 0.9)"
                    stroke="#f97316"
                    strokeWidth="2"
                    animate={{
                        y: isHovering ? [58, 56, 58] : [58, 60, 58]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Core (Glowing Circle in Body) */}
                <motion.circle
                    cx="50" cy="75" r="8"
                    fill="url(#coreGlow)"
                    animate={{
                        scale: isThinking ? [1, 1.3, 1] : [1, 1.15, 1],
                        opacity: [0.8, 1, 0.8],
                        rotate: isThinking ? [0, 360] : 0
                    }}
                    transition={{
                        scale: { duration: isThinking ? 1 : 2, repeat: Infinity },
                        opacity: { duration: isThinking ? 1 : 2, repeat: Infinity },
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" }
                    }}
                    style={{
                        filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.9))',
                        transformOrigin: '50px 75px'
                    }}
                />

                {/* Gradients */}
                <defs>
                    <linearGradient id="gradient-head" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                </defs>
            </svg>
        </motion.div>
    );
}

export default AnimatedBot;
