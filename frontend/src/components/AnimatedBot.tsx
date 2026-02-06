/**
 * AnimatedBot Component V4
 * Pure SVG geometric robot with:
 * - "Pop-Up" Antennae (Fixed Anatomy/Cropping)
 * - Aggressive Mouse Tracking Eyes
 * - Random Hover Expressions (Happy, Sad, Surprised, Skeptical)
 * - Random Idle Animations (Blinking, Expressions)
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

    // Expression State
    const [idleExpression, setIdleExpression] = useState<'neutral' | 'blink' | 'happy'>('neutral');
    const [hoverExpression, setHoverExpression] = useState<'happy' | 'sad' | 'surprised' | 'skeptical'>('happy');

    // Randomize expression on hover enter
    useEffect(() => {
        if (isHovering) {
            const expressions: ('happy' | 'sad' | 'surprised' | 'skeptical')[] = ['happy', 'happy', 'surprised', 'skeptical', 'sad']; // Weighted towards happy
            const random = expressions[Math.floor(Math.random() * expressions.length)];
            setHoverExpression(random);
        }
    }, [isHovering]);

    // Mouse Tracking Logic (Aggressive)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!botRef.current) return;

            const rect = botRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate max offset (More aggressive tracking)
            const maxOffset = 6;
            const deltaX = Math.min(Math.max((e.clientX - centerX) / 10, -maxOffset), maxOffset); // Sensitivity / 10
            const deltaY = Math.min(Math.max((e.clientY - centerY) / 10, -maxOffset), maxOffset);

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

    // Get mouth path based on current state
    const getMouthPath = () => {
        if (isThinking) return "M 40 62 L 45 58 L 50 62 L 55 58 L 60 62"; // Zig Zag
        if (isHovering) {
            switch (hoverExpression) {
                case 'happy': return "M 38 60 Q 50 70 62 60"; // Smile
                case 'sad': return "M 38 65 Q 50 55 62 65"; // Frown
                case 'surprised': return "M 45 60 A 5 5 0 1 0 55 60 A 5 5 0 1 0 45 60"; // Open O
                case 'skeptical': return "M 40 65 L 60 55"; // Slant
                default: return "M 38 60 Q 50 70 62 60";
            }
        }
        if (idleExpression === 'happy') return "M 40 60 Q 50 65 60 60"; // Small Smile
        return "M 40 60 Q 50 60 60 60"; // Neutral
    };

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
                viewBox="-30 -50 160 200" // Significantly expanded viewBox to prevent cropping
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

                {/* --- Hardware Layer (Antennae - Fixed Visual Detachment) --- */}
                <motion.g
                    initial={{ y: 0 }}
                    animate={{ y: isHovering || isThinking ? -30 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                    {/* Left Antenna - Stems extended deeper into body */}
                    <line x1="30" y1="50" x2="20" y2="0" stroke="url(#metalGradient)" strokeWidth="3" strokeLinecap="round" />
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

                    {/* Right Antenna - Stems extended deeper into body */}
                    <line x1="70" y1="50" x2="80" y2="0" stroke="url(#metalGradient)" strokeWidth="3" strokeLinecap="round" />
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
                        transition={{ type: "tween", ease: "linear", duration: 0.05 }} // Faster tracking
                    >
                        {/* Left Eye */}
                        <motion.ellipse
                            cx="38" cy="45"
                            rx="6" ry="6"
                            fill="url(#eyeGlow)"
                            animate={{
                                ry: idleExpression === 'blink' ? 0.5 : (isHovering && hoverExpression === 'surprised' ? 7 : 6),
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
                                ry: idleExpression === 'blink' ? 0.5 : (isHovering && hoverExpression === 'surprised' ? 7 : 6),
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
                            animate={{
                                d: getMouthPath()
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
