'use client';

import { motion } from 'framer-motion';

export function BrainAvatar() {
    return (
        <div className="relative w-12 h-12 flex items-center justify-center group cursor-pointer overflow-visible">
            {/* Glow */}
            <motion.div
                className="absolute inset-0 bg-blue-500/30 rounded-full blur-md"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-2xl overflow-visible" style={{ marginLeft: '-8px', marginTop: '-8px' }}>
                <defs>
                    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Brain Body with Animated "Cyber Lobes" */}
                <g filter="url(#glow)">
                    {/* Left Cyber Lobe */}
                    <motion.path
                        d="M30,50 Q30,20 50,20 L 50,80 Q30,80 30,50"
                        fill="url(#avatarGrad)"
                        stroke="rgba(147, 197, 253, 0.5)"
                        strokeWidth="1.5"
                        initial={{ rotate: 0, transformOrigin: "50px 80px" }}
                        whileHover={{ rotate: -15 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    />
                    {/* Left Tech Detail */}
                    <motion.path
                        d="M35,30 L45,30 M35,70 L45,70"
                        stroke="white" strokeOpacity="0.3" strokeWidth="1"
                        initial={{ rotate: 0, transformOrigin: "50px 80px" }}
                        whileHover={{ rotate: -15 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    />

                    {/* Right Cyber Lobe */}
                    <motion.path
                        d="M70,50 Q70,20 50,20 L 50,80 Q70,80 70,50"
                        fill="url(#avatarGrad)"
                        stroke="rgba(147, 197, 253, 0.5)"
                        strokeWidth="1.5"
                        initial={{ rotate: 0, transformOrigin: "50px 80px" }}
                        whileHover={{ rotate: 15 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    />
                    {/* Right Tech Detail */}
                    <motion.path
                        d="M55,30 L65,30 M55,70 L65,70"
                        stroke="white" strokeOpacity="0.3" strokeWidth="1"
                        initial={{ rotate: 0, transformOrigin: "50px 80px" }}
                        whileHover={{ rotate: 15 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    />

                    {/* Central Connector/Face Base */}
                    <path d="M48,20 L52,20 L52,80 L48,80 Z" fill="#3b82f6" opacity="0.5" />

                    {/* Eyes Container - Cyber Style */}
                    <g transform="translate(0, 5)">
                        {/* Left Eye - Digital */}
                        <motion.rect
                            x="40" y="42" width="6" height="6" rx="1" fill="#cffafe"
                            animate={{ height: [6, 6, 1, 6] }} // Digital Blink
                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
                        />
                        <motion.rect
                            x="42" y="44" width="2" height="2" fill="#0891b2"
                        />

                        {/* Right Eye - Digital */}
                        <motion.rect
                            x="54" y="42" width="6" height="6" rx="1" fill="#cffafe"
                            animate={{ height: [6, 6, 1, 6] }} // Digital Blink
                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
                        />
                        <motion.rect
                            x="56" y="44" width="2" height="2" fill="#0891b2"
                        />
                    </g>
                    {/* Cyber Cheek Nodes */}
                    <circle cx="35" cy="62" r="2" fill="#22d3ee" opacity="0.6" />
                    <circle cx="65" cy="62" r="2" fill="#22d3ee" opacity="0.6" />
                </g>
            </svg>
        </div>
    );
}
