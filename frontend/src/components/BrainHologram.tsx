'use client';

import { motion } from 'framer-motion';

export function BrainHologram({ className }: { className?: string }) {
    // Cybernetic Wing shapes
    const leftWing = [
        "M 150,200 L 80,80 L 160,140 Z",
        "M 80,80 L 20,40 L 90,120 Z",
        "M 160,140 L 70,240 L 140,260 Z"
    ];

    const rightWing = [
        "M 250,200 L 320,80 L 240,140 Z",
        "M 320,80 L 380,40 L 310,120 Z",
        "M 240,140 L 330,240 L 260,260 Z"
    ];

    return (
        <div className={`relative flex items-center justify-center pointer-events-none select-none ${className || 'w-[500px] h-[500px]'}`}>
            {/* Ambient Nebula - subtle */}
            <motion.div
                className="absolute inset-0 bg-cyan-500/5 rounded-full blur-[100px]"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.3)] overflow-visible">
                <defs>
                    <linearGradient id="holoWing" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="cyberBrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a5f3fc" />
                        <stop offset="100%" stopColor="#0891b2" />
                    </linearGradient>
                    <filter id="cyber-glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34, 211, 238, 0.1)" strokeWidth="0.5" />
                    </pattern>
                </defs>

                <g transform="translate(0, -20)">
                    {/* Circuit Wings L */}
                    <g>
                        {leftWing.map((path, i) => (
                            <motion.path
                                key={`l-${i}`}
                                d={path}
                                fill="url(#holoWing)"
                                stroke="rgba(34, 211, 238, 0.4)"
                                strokeWidth="1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                            />
                        ))}
                    </g>
                    {/* Circuit Wings R */}
                    <g>
                        {rightWing.map((path, i) => (
                            <motion.path
                                key={`r-${i}`}
                                d={path}
                                fill="url(#holoWing)"
                                stroke="rgba(34, 211, 238, 0.4)"
                                strokeWidth="1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                            />
                        ))}
                    </g>

                    {/* Central Cybernetic Brain */}
                    <g transform="translate(140, 140) scale(1.2)" filter="url(#cyber-glow)">
                        {/* Base Shape */}
                        <motion.path
                            d="M30,50 Q30,20 50,20 Q70,20 70,50 Q70,80 50,80 Q30,80 30,50"
                            fill="url(#cyberBrainGrad)"
                            stroke="#67e8f9"
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1, ease: "backOut" }}
                        />
                        {/* Internal Circuitry */}
                        <path d="M40,30 L60,30 L60,70 L40,70 Z" fill="url(#grid)" opacity="0.5" />
                        <path d="M30,50 L45,50 M55,50 L70,50 M50,20 L50,40 M50,60 L50,80" stroke="#cffafe" strokeWidth="1" />
                        <circle cx="50" cy="50" r="8" fill="#ec4899" fillOpacity="0.2" stroke="#ec4899" strokeWidth="1" />
                        <circle cx="50" cy="50" r="4" fill="#ec4899" />

                        {/* Data Pulses */}
                        <motion.circle cx="50" cy="50" r="30" fill="none" stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="1"
                            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </g>
                </g>

                {/* SVG Text - Just KNOWBOT */}
                <text x="200" y="360" textAnchor="middle" fill="#ec4899"
                    style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '0.2em', fontFamily: 'system-ui' }}
                    filter="url(#cyber-glow)">
                    KNOWBOT
                </text>
            </svg>
        </div>
    );
}
