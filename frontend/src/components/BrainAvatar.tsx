'use client';

import { motion } from 'framer-motion';

export function BrainAvatar() {
    return (
        <div className="relative flex items-center justify-center group cursor-pointer overflow-visible">
            {/* Outer Glow Ring */}
            <motion.div
                className="absolute w-20 h-20 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)'
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main Container */}
            <div className="relative w-16 h-16">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                    <defs>
                        {/* Brain Gradient */}
                        <linearGradient id="avatarBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>

                        {/* Mechanical Gradient */}
                        <linearGradient id="avatarMechGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0ea5e9" />
                            <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>

                        {/* Glow Filter */}
                        <filter id="avatarGlow">
                            <feGaussianBlur stdDeviation="2" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Rotating Outer Ring */}
                    <motion.circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="url(#avatarMechGrad)"
                        strokeWidth="1.5"
                        strokeDasharray="6 3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: '50px 50px' }}
                    />

                    {/* Brain Body */}
                    <g filter="url(#avatarGlow)" transform="translate(50, 50)">
                        {/* Left Hemisphere */}
                        <motion.path
                            d="M -3,0 
                               C -3,-20 -25,-25 -28,-12
                               C -30,3 -30,14 -25,22
                               C -20,30 -8,30 -3,25
                               C -3,17 -3,8 -3,0"
                            fill="url(#avatarBrainGrad)"
                            stroke="#67e8f9"
                            strokeWidth="1"
                            whileHover={{ x: -3 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />

                        {/* Right Hemisphere */}
                        <motion.path
                            d="M 3,0 
                               C 3,-20 25,-25 28,-12
                               C 30,3 30,14 25,22
                               C 20,30 8,30 3,25
                               C 3,17 3,8 3,0"
                            fill="url(#avatarBrainGrad)"
                            stroke="#67e8f9"
                            strokeWidth="1"
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />

                        {/* Brain Folds */}
                        <path d="M -10,-12 Q -18,-10 -22,-3" stroke="#a5f3fc" strokeWidth="0.8" fill="none" strokeOpacity="0.7" />
                        <path d="M -8,5 Q -18,8 -24,15" stroke="#a5f3fc" strokeWidth="0.8" fill="none" strokeOpacity="0.7" />
                        <path d="M 10,-12 Q 18,-10 22,-3" stroke="#a5f3fc" strokeWidth="0.8" fill="none" strokeOpacity="0.7" />
                        <path d="M 8,5 Q 18,8 24,15" stroke="#a5f3fc" strokeWidth="0.8" fill="none" strokeOpacity="0.7" />

                        {/* Circuit Lines */}
                        <motion.path
                            d="M -22,0 L -15,0 L -15,10"
                            stroke="#22d3ee"
                            strokeWidth="1"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0.5 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                        />
                        <motion.path
                            d="M 22,0 L 15,0 L 15,10"
                            stroke="#22d3ee"
                            strokeWidth="1"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0.5 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        />

                        {/* LED Nodes */}
                        <motion.circle cx="-22" cy="0" r="2" fill="#22d3ee"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.circle cx="22" cy="0" r="2" fill="#22d3ee"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        />

                        {/* Central Core */}
                        <motion.circle
                            cx="0" cy="3" r="7"
                            fill="#0c4a6e"
                            stroke="#22d3ee"
                            strokeWidth="1.5"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle
                            cx="0" cy="3" r="3.5"
                            fill="#06b6d4"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />

                        {/* Mini Gear */}
                        <motion.g
                            animate={{ rotate: 360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '-18px -15px' }}
                        >
                            <circle cx="-18" cy="-15" r="4" fill="none" stroke="#0ea5e9" strokeWidth="1" />
                            <path d="M -18,-19 L -18,-17 M -18,-11 L -18,-13 M -22,-15 L -20,-15 M -14,-15 L -16,-15"
                                stroke="#0ea5e9" strokeWidth="1" />
                        </motion.g>

                        <motion.g
                            animate={{ rotate: -360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '18px -15px' }}
                        >
                            <circle cx="18" cy="-15" r="3" fill="none" stroke="#8b5cf6" strokeWidth="1" />
                            <path d="M 18,-18 L 18,-16 M 18,-12 L 18,-14 M 21,-15 L 19,-15 M 15,-15 L 17,-15"
                                stroke="#8b5cf6" strokeWidth="1" />
                        </motion.g>

                        {/* Data Pulse */}
                        <motion.circle
                            cx="0" cy="3" r="20"
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="0.5"
                            initial={{ scale: 0.6, opacity: 0.6 }}
                            animate={{ scale: 1.3, opacity: 0 }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </g>

                    {/* "3.0" Badge */}
                    <g transform="translate(78, 78)">
                        <circle cx="0" cy="0" r="10" fill="#0c4a6e" stroke="#22d3ee" strokeWidth="1" />
                        <text x="0" y="1" textAnchor="middle" dominantBaseline="middle"
                            fill="#22d3ee" fontSize="6" fontWeight="bold">3.0</text>
                    </g>
                </svg>
            </div>

            {/* Hover Label */}
            <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: -5 }}
                whileHover={{ opacity: 1, y: 0 }}
            >
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">
                    KnowBot 3.0
                </span>
            </motion.div>
        </div>
    );
}

export default BrainAvatar;
