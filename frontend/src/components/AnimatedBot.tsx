/**
 * AnimatedBot Component V2
 * Pure SVG geometric robot with "Pop-Up" mechanics and expressive face.
 */

'use client';

import { motion } from 'framer-motion';

interface AnimatedBotProps {
    mode?: 'idle' | 'hover' | 'thinking';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

export function AnimatedBot({ mode = 'idle', size = 'md', className = '' }: AnimatedBotProps) {
    const sizes = {
        xs: 40,
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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 0 15px rgba(234, 88, 12, 0.3))' }}
            >
                {/* Gradients */}
                <defs>
                    <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
                    </radialGradient>
                    <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="50%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                </defs>

                {/* --- Hardware Layer (Antennae) --- */}
                {/* Positioned behind head so they "pop up" from behind */}
                <motion.g
                    initial={{ y: 15 }} // Start retracted (hidden behind head top)
                    animate={{ y: isHovering || isThinking ? -10 : 15 }} // Pop UP on hover
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                    {/* Left Antenna Stem */}
                    <line x1="30" y1="30" x2="25" y2="10" stroke="url(#metalGradient)" strokeWidth="3" strokeLinecap="round" />
                    {/* Left Bulb */}
                    <motion.circle
                        cx="25" cy="10" r="4"
                        fill="#fbbf24"
                        animate={{
                            fillOpacity: isThinking ? [0.6, 1, 0.6] : 1,
                            scale: isThinking ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}
                    />

                    {/* Right Antenna Stem */}
                    <line x1="70" y1="30" x2="75" y2="10" stroke="url(#metalGradient)" strokeWidth="3" strokeLinecap="round" />
                    {/* Right Bulb */}
                    <motion.circle
                        cx="75" cy="10" r="4"
                        fill="#fbbf24"
                        animate={{
                            fillOpacity: isThinking ? [0.6, 1, 0.6] : 1,
                            scale: isThinking ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}
                    />
                </motion.g>


                {/* --- Body Layer (Neck & Shoulders) --- */}
                <motion.path
                    d="M 35 75 L 35 90 Q 50 95 65 90 L 65 75"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                />


                {/* --- Head Layer --- */}
                <motion.g
                    animate={isHovering ? { y: -2 } : { y: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {/* Main Head Shape (Rounded Rect) */}
                    <rect
                        x="15" y="25" width="70" height="55" rx="12"
                        fill="url(#headGradient)"
                        stroke="#f97316" // Orange accent border
                        strokeWidth="2.5"
                        style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.5))' }}
                    />

                    {/* Face Screen (Darker inset) */}
                    <rect
                        x="22" y="32" width="56" height="40" rx="6"
                        fill="#020617"
                        stroke="#1e293b"
                        strokeWidth="1"
                    />

                    {/* --- Face Features --- */}

                    {/* Left Eye */}
                    <motion.ellipse
                        cx="38" cy="45"
                        rx="6" ry="6"
                        fill="url(#eyeGlow)"
                        animate={{
                            ry: isHovering ? 7 : [6, 1, 6], // Blink in idle
                            scale: isHovering ? 1.1 : 1
                        }}
                        transition={{
                            ry: isHovering ? { duration: 0.2 } : { duration: 0.15, repeat: Infinity, repeatDelay: 3.5 },
                        }}
                        style={{ filter: 'drop-shadow(0 0 5px #22d3ee)' }}
                    />

                    {/* Right Eye */}
                    <motion.ellipse
                        cx="62" cy="45"
                        rx="6" ry="6"
                        fill="url(#eyeGlow)"
                        animate={{
                            ry: isHovering ? 7 : [6, 1, 6], // Blink in idle
                            scale: isHovering ? 1.1 : 1
                        }}
                        transition={{
                            ry: isHovering ? { duration: 0.2 } : { duration: 0.15, repeat: Infinity, repeatDelay: 3.5 },
                        }}
                        style={{ filter: 'drop-shadow(0 0 5px #22d3ee)' }}
                    />

                    {/* Expressive Mouth */}
                    <motion.path
                        stroke="#22d3ee"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="transparent"
                        style={{ filter: 'drop-shadow(0 0 2px #22d3ee)' }}
                        initial={{ d: "M 40 60 Q 50 60 60 60" }} // Neutral line
                        animate={{
                            d: isHovering
                                ? "M 38 60 Q 50 70 62 60" // Smile (Curve Down)
                                : isThinking
                                    ? "M 40 62 L 45 58 L 50 62 L 55 58 L 60 62" // Zig Zag
                                    : "M 42 62 Q 50 62 58 62" // Small Neutral
                        }}
                        transition={{ duration: 0.4, type: "spring" }}
                    />
                </motion.g>

            </svg>
        </motion.div>
    );
}

export default AnimatedBot;
