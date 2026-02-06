'use client';

import { motion } from 'framer-motion';

export function BrainHologram({ className }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center pointer-events-none select-none ${className || 'w-[600px] h-[600px]'}`}>
            {/* Ambient Nebula Glow */}
            <motion.div
                className="absolute w-full h-full rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 60%)'
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <svg viewBox="0 0 400 450" className="w-full h-full drop-shadow-[0_0_40px_rgba(34,211,238,0.2)] overflow-visible">
                <defs>
                    {/* Holographic Wing Gradient */}
                    <linearGradient id="holoWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                    </linearGradient>

                    {/* Brain Gradient */}
                    <linearGradient id="holoBrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4" />
                    </linearGradient>

                    {/* Mechanical Gradient */}
                    <linearGradient id="holoMechGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>

                    {/* Glow Filters */}
                    <filter id="holoGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="6" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Scan Line Pattern */}
                    <pattern id="scanLines" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="4" y2="0" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.1" />
                    </pattern>
                </defs>

                {/* Background Hex Grid */}
                <motion.g opacity="0.15">
                    {[...Array(8)].map((_, i) => (
                        <motion.circle
                            key={i}
                            cx="200"
                            cy="180"
                            r={50 + i * 30}
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="0.5"
                            strokeDasharray="4 8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </motion.g>

                {/* Rotating Outer Ring */}
                <motion.circle
                    cx="200" cy="180" r="140"
                    fill="none"
                    stroke="url(#holoMechGrad)"
                    strokeWidth="1.5"
                    strokeDasharray="10 5"
                    strokeOpacity="0.4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: '200px 180px' }}
                />

                {/* Wing Structures */}
                <g transform="translate(0, -20)">
                    {/* Left Wing */}
                    <motion.g filter="url(#holoGlow)">
                        <motion.path
                            d="M 150,200 L 80,100 L 160,150 Z"
                            fill="url(#holoWingGrad)"
                            stroke="rgba(34, 211, 238, 0.4)"
                            strokeWidth="1"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.5, delay: 0.1 }}
                        />
                        <motion.path
                            d="M 80,100 L 30,60 L 100,130 Z"
                            fill="url(#holoWingGrad)"
                            stroke="rgba(34, 211, 238, 0.3)"
                            strokeWidth="1"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                        />
                        <motion.path
                            d="M 160,150 L 80,250 L 140,270 Z"
                            fill="url(#holoWingGrad)"
                            stroke="rgba(34, 211, 238, 0.3)"
                            strokeWidth="1"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                        />
                    </motion.g>

                    {/* Right Wing */}
                    <motion.g filter="url(#holoGlow)">
                        <motion.path
                            d="M 250,200 L 320,100 L 240,150 Z"
                            fill="url(#holoWingGrad)"
                            stroke="rgba(34, 211, 238, 0.4)"
                            strokeWidth="1"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.5, delay: 0.1 }}
                        />
                        <motion.path
                            d="M 320,100 L 370,60 L 300,130 Z"
                            fill="url(#holoWingGrad)"
                            stroke="rgba(34, 211, 238, 0.3)"
                            strokeWidth="1"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                        />
                        <motion.path
                            d="M 240,150 L 320,250 L 260,270 Z"
                            fill="url(#holoWingGrad)"
                            stroke="rgba(34, 211, 238, 0.3)"
                            strokeWidth="1"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                        />
                    </motion.g>

                    {/* Central Hybrid Brain */}
                    <g transform="translate(200, 180)" filter="url(#holoGlow)">
                        {/* Left Hemisphere */}
                        <motion.path
                            d="M -5,0 
                               C -5,-40 -55,-50 -60,-22
                               C -65,6 -65,28 -52,45
                               C -40,62 -15,62 -5,50
                               C -5,33 -5,17 -5,0"
                            fill="url(#holoBrainGrad)"
                            stroke="#67e8f9"
                            strokeWidth="1.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1, ease: "backOut" }}
                        />

                        {/* Right Hemisphere */}
                        <motion.path
                            d="M 5,0 
                               C 5,-40 55,-50 60,-22
                               C 65,6 65,28 52,45
                               C 40,62 15,62 5,50
                               C 5,33 5,17 5,0"
                            fill="url(#holoBrainGrad)"
                            stroke="#67e8f9"
                            strokeWidth="1.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1, ease: "backOut" }}
                        />

                        {/* Brain Folds */}
                        <g strokeOpacity="0.5">
                            <path d="M -15,-28 Q -35,-24 -42,-8" stroke="#cffafe" strokeWidth="1" fill="none" />
                            <path d="M -12,5 Q -35,10 -48,25" stroke="#cffafe" strokeWidth="1" fill="none" />
                            <path d="M -10,25 Q -30,30 -38,42" stroke="#cffafe" strokeWidth="1" fill="none" />
                            <path d="M 15,-28 Q 35,-24 42,-8" stroke="#cffafe" strokeWidth="1" fill="none" />
                            <path d="M 12,5 Q 35,10 48,25" stroke="#cffafe" strokeWidth="1" fill="none" />
                            <path d="M 10,25 Q 30,30 38,42" stroke="#cffafe" strokeWidth="1" fill="none" />
                        </g>

                        {/* Circuit Lines */}
                        <motion.path
                            d="M -50,-15 L -30,-15 L -30,10 L -15,10"
                            stroke="#22d3ee"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 4 }}
                        />
                        <motion.path
                            d="M 50,-15 L 30,-15 L 30,10 L 15,10"
                            stroke="#22d3ee"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatDelay: 4 }}
                        />
                        <motion.path
                            d="M -42,35 L -25,35 L -25,45"
                            stroke="#8b5cf6"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 2, repeat: Infinity, repeatDelay: 4 }}
                        />
                        <motion.path
                            d="M 42,35 L 25,35 L 25,45"
                            stroke="#8b5cf6"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 2.5, repeat: Infinity, repeatDelay: 4 }}
                        />

                        {/* LED Nodes */}
                        <motion.circle cx="-50" cy="-15" r="4" fill="#22d3ee"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle cx="50" cy="-15" r="4" fill="#22d3ee"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        />
                        <motion.circle cx="-42" cy="35" r="3" fill="#8b5cf6"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        />
                        <motion.circle cx="42" cy="35" r="3" fill="#8b5cf6"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                        />

                        {/* Central Core */}
                        <motion.circle
                            cx="0" cy="8" r="15"
                            fill="#0c4a6e"
                            stroke="#22d3ee"
                            strokeWidth="2"
                            animate={{ scale: [1, 1.03, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                        <motion.circle
                            cx="0" cy="8" r="8"
                            fill="#06b6d4"
                            animate={{ opacity: [0.5, 0.9, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <path d="M -5,8 L 5,8 M 0,3 L 0,13" stroke="#a5f3fc" strokeWidth="2" />

                        {/* Mechanical Gears */}
                        <motion.g
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '-35px -35px' }}
                        >
                            <circle cx="-35" cy="-35" r="10" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
                            <path d="M -35,-45 L -35,-40 M -35,-25 L -35,-30 M -45,-35 L -40,-35 M -25,-35 L -30,-35"
                                stroke="#0ea5e9" strokeWidth="2" />
                        </motion.g>
                        <motion.g
                            animate={{ rotate: -360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '35px -35px' }}
                        >
                            <circle cx="35" cy="-35" r="8" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
                            <path d="M 35,-43 L 35,-39 M 35,-27 L 35,-31 M 43,-35 L 39,-35 M 27,-35 L 31,-35"
                                stroke="#8b5cf6" strokeWidth="1.5" />
                        </motion.g>

                        {/* Pulse Ring */}
                        <motion.circle
                            cx="0" cy="8" r="45"
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="1"
                            initial={{ scale: 0.7, opacity: 0.6 }}
                            animate={{ scale: 1.4, opacity: 0 }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </g>
                </g>

                {/* KNOWBOT 3.0 Text */}
                <g filter="url(#strongGlow)">
                    <text x="200" y="380" textAnchor="middle" fill="url(#holoMechGrad)"
                        style={{ fontSize: '38px', fontWeight: '900', letterSpacing: '0.12em', fontFamily: 'system-ui' }}>
                        KNOWBOT
                    </text>
                    <motion.text
                        x="200" y="410" textAnchor="middle" fill="#22d3ee"
                        style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.4em', fontFamily: 'system-ui' }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        3.0
                    </motion.text>
                </g>

                {/* Holographic Scan Line Effect */}
                <motion.rect
                    x="0" y="0" width="400" height="10"
                    fill="url(#scanLines)"
                    opacity="0.3"
                    animate={{ y: [0, 450, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
            </svg>
        </div>
    );
}

export default BrainHologram;
