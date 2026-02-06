/**
 * AnimatedBot Component V3
 * Pure SVG geometric robot with:
 * - "Pop-Up" Antennae
 * - Mouse Tracking Eyes
 * - Random Idle Animations (Blinking, Expressions)
 * - Improved ViewBox framing
 */

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

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

    // Mouse Tracking State
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const botRef = useRef<HTMLDivElement>(null);

    // Random Idle State
    const [idleExpression, setIdleExpression] = useState<'neutral' | 'blink' | 'happy'>('neutral');

    // Mouse Tracking Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!botRef.current) return;

            const rect = botRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate max offset (limit movement to keep eyes in sockets)
            const maxOffset = 3;
            const deltaX = Math.min(Math.max((e.clientX - centerX) / 20, -maxOffset), maxOffset);
            const deltaY = Math.min(Math.max((e.clientY - centerY) / 20, -maxOffset), maxOffset);

            setEyePosition({ x: deltaX, y: deltaY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Random Idle Animations (Blinking & Expressions)
    useEffect(() => {
        if (isHovering || isThinking) return;

        const interval = setInterval(() => {
            const random = Math.random();
            if (random > 0.7) {
                setIdleExpression('blink');
                setTimeout(() => setIdleExpression('neutral'), 150);
            } else if (random > 0.9) {
                setIdleExpression('happy');
                setTimeout(() => setIdleExpression('neutral'), 2000);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isHovering, isThinking]);

    return (
        <motion.div
            ref={botRef}
            className={`relative ${className}`}
            style={{ width: dimension, height: dimension }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <svg
                viewBox="-25 -25 150 150" // Expanded viewBox to prevent cropping
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

                {/* --- Hardware Layer (Antennae - Fixed "Cut Off" Issue) --- */}
                <motion.g
                    initial={{ y: 0 }}
                    animate={{ y: isHovering || isThinking ? -25 : 0 }} // Higher pop-up
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                    {/* Left Antenna */}
                    <line x1="30" y1="30" x2="20" y2="0" stroke="url(#metalGradient)" strokeWidth="3" strokeLinecap="round" />
                    <motion.circle
                        cx="20" cy="0" r="5"
                        fill="#fbbf24"
                        animate={{
                            fillOpacity: isThinking ? [0.6, 1, 0.6] : 1,
                            scale: isThinking ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}
                    />

                    {/* Right Antenna */}
                    <line x1="70" y1="30" x2="80" y2="0" stroke="url(#metalGradient)" strokeWidth="3" strokeLinecap="round" />
                    <motion.circle
                        cx="80" cy="0" r="5"
                        fill="#fbbf24"
                        animate={{
                            fillOpacity: isThinking ? [0.6, 1, 0.6] : 1,
                            scale: isThinking ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}
                    />
                </motion.g>


                {/* --- Body Layer --- */}
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

                    {/* --- Face Features Group (Moves with Mouse) --- */}
                    <motion.g
                        animate={{ x: eyePosition.x, y: eyePosition.y }}
                        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                    >
                        {/* Left Eye */}
                        <motion.ellipse
                            cx="38" cy="45"
                            rx="6" ry="6"
                            fill="url(#eyeGlow)"
                            animate={{
                                ry: idleExpression === 'blink' ? 0.5 : (isHovering ? 7 : 6),
                                scale: isHovering ? 1.1 : 1
                            }}
                            transition={{ duration: 0.1 }}
                            style={{ filter: 'drop-shadow(0 0 5px #22d3ee)' }}
                        />

                        {/* Right Eye */}
                        <motion.ellipse
                            cx="62" cy="45"
                            rx="6" ry="6"
                            fill="url(#eyeGlow)"
                            animate={{
                                ry: idleExpression === 'blink' ? 0.5 : (isHovering ? 7 : 6),
                                scale: isHovering ? 1.1 : 1
                            }}
                            transition={{ duration: 0.1 }}
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
                </motion.g>

            </svg>
        </motion.div>
    );
}

export default AnimatedBot;
