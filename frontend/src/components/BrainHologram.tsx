'use client';

import { motion } from 'framer-motion';

export function BrainHologram() {
    return (
        <div className="relative w-96 h-96 flex items-center justify-center">
            {/* Ambient Glow */}
            <motion.div
                className="absolute inset-0 bg-blue-500/10 rounded-full blur-[80px]"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Core Neural Network - Dynamic Particles */}
            <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-[1px]"
                        initial={{
                            x: 192, // center (w-96 is 384px, /2 = 192)
                            y: 192,
                            scale: 0,
                            opacity: 0
                        }}
                        animate={{
                            x: 192 + Math.cos(i * 30 * Math.PI / 180) * 120, // Orbit radius
                            y: 192 + Math.sin(i * 30 * Math.PI / 180) * 120,
                            scale: [0, 1.5, 0],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Rotating Rings (Hologram Effect) */}
            <svg viewBox="0 0 400 400" className="w-full h-full absolute animate-spin-slow">
                <defs>
                    <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                        <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Outer Ring */}
                <motion.circle
                    cx="200" cy="200" r="160"
                    fill="none"
                    stroke="url(#holoGradient)"
                    strokeWidth="1"
                    strokeDasharray="20 40"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner Ring */}
                <motion.circle
                    cx="200" cy="200" r="120"
                    fill="none"
                    stroke="rgba(147, 197, 253, 0.2)"
                    strokeWidth="2"
                    strokeDasharray="4 8"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
            </svg>

            {/* Central Brain SVG wireframe */}
            <svg viewBox="0 0 100 100" className="w-64 h-64 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                <motion.path
                    d="M30,50 Q30,20 50,20 Q70,20 70,50 Q70,80 50,80 Q30,80 30,50"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
                {/* Synapses */}
                <motion.path
                    d="M40,50 L60,50 M50,40 L50,60 M42,42 L58,58 M42,58 L58,42"
                    stroke="#93c5fd"
                    strokeWidth="0.5"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
                <circle cx="50" cy="50" r="28" fill="url(#holoGradient)" opacity="0.1" />
            </svg>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-1 bg-blue-500/50 blur-xl"></div>
            </div>
        </div>
    );
}
