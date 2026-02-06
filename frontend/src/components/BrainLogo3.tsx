'use client';

import { motion } from 'framer-motion';

interface BrainLogo3Props {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    className?: string;
}

export function BrainLogo3({ size = 'lg', showText = true, className = '' }: BrainLogo3Props) {
    const sizeMap = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-40 h-40',
        xl: 'w-56 h-56'
    };

    const textSizeMap = {
        sm: '14px',
        md: '18px',
        lg: '28px',
        xl: '36px'
    };

    return (
        <div className={`relative flex flex-col items-center justify-center ${className}`}>
            {/* Ambient Glow */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className={`relative ${sizeMap[size]}`}>
                <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                    <defs>
                        {/* Brain Organic Gradient */}
                        <linearGradient id="brainOrganicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.85" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                        </linearGradient>

                        {/* Mechanical Gradient */}
                        <linearGradient id="mechGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0ea5e9" />
                            <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>

                        {/* Circuit Glow */}
                        <filter id="circuitGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Outer Glow */}
                        <filter id="outerGlow">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Circuit Pattern */}
                        <pattern id="circuitPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M0 10 H8 M12 10 H20 M10 0 V8 M10 12 V20"
                                stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
                            <circle cx="10" cy="10" r="1.5" fill="#22d3ee" fillOpacity="0.4" />
                        </pattern>
                    </defs>

                    {/* Outer Mechanical Ring */}
                    <motion.g filter="url(#outerGlow)">
                        <motion.circle
                            cx="100" cy="100" r="90"
                            fill="none"
                            stroke="url(#mechGrad)"
                            strokeWidth="2"
                            strokeDasharray="8 4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '100px 100px' }}
                        />
                        <motion.circle
                            cx="100" cy="100" r="85"
                            fill="none"
                            stroke="#0ea5e9"
                            strokeWidth="1"
                            strokeOpacity="0.3"
                            strokeDasharray="4 8"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '100px 100px' }}
                        />
                    </motion.g>

                    {/* Brain Base - Organic Shape */}
                    <g transform="translate(100, 100)">
                        {/* Left Hemisphere - Organic */}
                        <motion.path
                            d="M -5,0 
                               C -5,-35 -45,-45 -50,-20
                               C -55,5 -55,25 -45,40
                               C -35,55 -15,55 -5,45
                               C -5,30 -5,15 -5,0"
                            fill="url(#brainOrganicGrad)"
                            stroke="#67e8f9"
                            strokeWidth="1.5"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1, ease: "backOut" }}
                        />

                        {/* Right Hemisphere - Organic */}
                        <motion.path
                            d="M 5,0 
                               C 5,-35 45,-45 50,-20
                               C 55,5 55,25 45,40
                               C 35,55 15,55 5,45
                               C 5,30 5,15 5,0"
                            fill="url(#brainOrganicGrad)"
                            stroke="#67e8f9"
                            strokeWidth="1.5"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1, ease: "backOut" }}
                        />

                        {/* Brain Folds - Left */}
                        <motion.g filter="url(#circuitGlow)">
                            <path d="M -15,-25 Q -30,-20 -35,-5" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                            <path d="M -12,0 Q -28,5 -38,20" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                            <path d="M -10,20 Q -25,25 -30,35" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                        </motion.g>

                        {/* Brain Folds - Right */}
                        <motion.g filter="url(#circuitGlow)">
                            <path d="M 15,-25 Q 30,-20 35,-5" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                            <path d="M 12,0 Q 28,5 38,20" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                            <path d="M 10,20 Q 25,25 30,35" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                        </motion.g>

                        {/* Mechanical Overlay - Circuit Lines */}
                        <g filter="url(#circuitGlow)">
                            {/* Left circuits */}
                            <motion.path
                                d="M -40,-15 L -25,-15 L -25,5 L -15,5"
                                stroke="#22d3ee"
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
                            />
                            <motion.path
                                d="M -35,25 L -20,25 L -20,35"
                                stroke="#22d3ee"
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 3 }}
                            />

                            {/* Right circuits */}
                            <motion.path
                                d="M 40,-15 L 25,-15 L 25,5 L 15,5"
                                stroke="#22d3ee"
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, delay: 0.8, repeat: Infinity, repeatDelay: 3 }}
                            />
                            <motion.path
                                d="M 35,25 L 20,25 L 20,35"
                                stroke="#22d3ee"
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 1.2, repeat: Infinity, repeatDelay: 3 }}
                            />
                        </g>

                        {/* Circuit Nodes / LED Lights */}
                        <motion.circle cx="-40" cy="-15" r="3" fill="#22d3ee"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        />
                        <motion.circle cx="40" cy="-15" r="3" fill="#22d3ee"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.circle cx="-35" cy="25" r="2.5" fill="#a855f7"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        />
                        <motion.circle cx="35" cy="25" r="2.5" fill="#a855f7"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
                        />

                        {/* Central Core - Mechanical Heart */}
                        <motion.g>
                            <motion.circle
                                cx="0" cy="5" r="12"
                                fill="#0c4a6e"
                                stroke="#22d3ee"
                                strokeWidth="2"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.circle
                                cx="0" cy="5" r="6"
                                fill="#06b6d4"
                                animate={{ opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            {/* Inner tech detail */}
                            <path d="M -4,5 L 4,5 M 0,1 L 0,9" stroke="#a5f3fc" strokeWidth="1.5" />
                        </motion.g>

                        {/* Mechanical Gear - Left */}
                        <motion.g
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '-30px -30px' }}
                        >
                            <circle cx="-30" cy="-30" r="8" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
                            <path d="M -30,-38 L -30,-35 M -30,-22 L -30,-25 M -38,-30 L -35,-30 M -22,-30 L -25,-30"
                                stroke="#0ea5e9" strokeWidth="2" />
                        </motion.g>

                        {/* Mechanical Gear - Right */}
                        <motion.g
                            animate={{ rotate: -360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '30px -30px' }}
                        >
                            <circle cx="30" cy="-30" r="6" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
                            <path d="M 30,-36 L 30,-33 M 30,-24 L 30,-27 M 36,-30 L 33,-30 M 24,-30 L 27,-30"
                                stroke="#8b5cf6" strokeWidth="1.5" />
                        </motion.g>

                        {/* Data Pulse Ring */}
                        <motion.circle
                            cx="0" cy="5" r="35"
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="1"
                            initial={{ scale: 0.8, opacity: 0.8 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                        />
                    </g>

                    {/* Corner Connection Ports */}
                    <g filter="url(#circuitGlow)">
                        <rect x="15" y="95" width="8" height="10" rx="2" fill="#0c4a6e" stroke="#22d3ee" strokeWidth="1" />
                        <rect x="177" y="95" width="8" height="10" rx="2" fill="#0c4a6e" stroke="#22d3ee" strokeWidth="1" />
                    </g>
                </svg>
            </div>

            {/* Text */}
            {showText && (
                <motion.div
                    className="mt-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h1
                        className="font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg"
                        style={{ fontSize: textSizeMap[size], letterSpacing: '0.15em' }}
                    >
                        KNOWBOT
                    </h1>
                    <motion.p
                        className="text-cyan-400/80 font-bold tracking-[0.3em] uppercase mt-1"
                        style={{ fontSize: `calc(${textSizeMap[size]} * 0.4)` }}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        3.0
                    </motion.p>
                </motion.div>
            )}
        </div>
    );
}

export default BrainLogo3;
