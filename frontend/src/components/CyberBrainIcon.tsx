'use client';

import { motion } from 'framer-motion';

export function CyberBrainIcon({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="cyberIconGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <filter id="iconGlow">
                    <feGaussianBlur stdDeviation="2" result="glow" />
                    <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Outer Ring */}
            <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1"
                strokeOpacity="0.3"
                strokeDasharray="4 2"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: '50px 50px' }}
            />

            {/* Brain Shape - Left Hemisphere */}
            <motion.path
                d="M 48,50 
                   C 48,30 25,25 22,42
                   C 20,55 22,68 32,75
                   C 40,80 48,72 48,60
                   C 48,55 48,50 48,50"
                fill="url(#cyberIconGrad3)"
                stroke="#67e8f9"
                strokeWidth="1.5"
                filter="url(#iconGlow)"
            />

            {/* Brain Shape - Right Hemisphere */}
            <motion.path
                d="M 52,50 
                   C 52,30 75,25 78,42
                   C 80,55 78,68 68,75
                   C 60,80 52,72 52,60
                   C 52,55 52,50 52,50"
                fill="url(#cyberIconGrad3)"
                stroke="#67e8f9"
                strokeWidth="1.5"
                filter="url(#iconGlow)"
            />

            {/* Brain Folds */}
            <path d="M 35,40 Q 28,45 26,55" stroke="#a5f3fc" strokeWidth="0.8" fill="none" strokeOpacity="0.6" />
            <path d="M 38,58 Q 30,62 32,72" stroke="#a5f3fc" strokeWidth="0.8" fill="none" strokeOpacity="0.6" />
            <path d="M 65,40 Q 72,45 74,55" stroke="#a5f3fc" strokeWidth="0.8" fill="none" strokeOpacity="0.6" />
            <path d="M 62,58 Q 70,62 68,72" stroke="#a5f3fc" strokeWidth="0.8" fill="none" strokeOpacity="0.6" />

            {/* Circuit Lines */}
            <motion.path
                d="M 25,45 L 38,45"
                stroke="#22d3ee"
                strokeWidth="1"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            />
            <motion.path
                d="M 75,45 L 62,45"
                stroke="#22d3ee"
                strokeWidth="1"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.3, repeat: Infinity, repeatDelay: 2 }}
            />

            {/* LED Nodes */}
            <motion.circle
                cx="25" cy="45" r="2"
                fill="#22d3ee"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.circle
                cx="75" cy="45" r="2"
                fill="#22d3ee"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
            />

            {/* Central Core */}
            <motion.circle
                cx="50" cy="52" r="8"
                fill="#0c4a6e"
                stroke="#22d3ee"
                strokeWidth="1.5"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
                cx="50" cy="52" r="4"
                fill="#06b6d4"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />
            <path d="M 47,52 L 53,52 M 50,49 L 50,55" stroke="#a5f3fc" strokeWidth="1" />

            {/* Mini Gears */}
            <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: '32px 32px' }}
            >
                <circle cx="32" cy="32" r="4" fill="none" stroke="#0ea5e9" strokeWidth="1" />
                <path d="M 32,28 L 32,30 M 32,36 L 32,34 M 28,32 L 30,32 M 36,32 L 34,32" stroke="#0ea5e9" strokeWidth="1" />
            </motion.g>
            <motion.g
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: '68px 32px' }}
            >
                <circle cx="68" cy="32" r="3" fill="none" stroke="#8b5cf6" strokeWidth="1" />
                <path d="M 68,29 L 68,30.5 M 68,35 L 68,33.5 M 65,32 L 66.5,32 M 71,32 L 69.5,32" stroke="#8b5cf6" strokeWidth="1" />
            </motion.g>

            {/* Pulse Ring */}
            <motion.circle
                cx="50" cy="52" r="20"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="0.5"
                initial={{ scale: 0.7, opacity: 0.6 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </svg>
    );
}

export default CyberBrainIcon;
