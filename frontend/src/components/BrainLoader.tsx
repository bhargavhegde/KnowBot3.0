'use client';

import { motion } from 'framer-motion';

export function BrainLoader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030810]">
            {/* Background Nebula Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 60%)'
                    }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute w-[400px] h-[400px] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
                    }}
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="relative">
                {/* Main Brain Container */}
                <div className="relative w-72 h-72">
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(34,211,238,0.4)] overflow-visible">
                        <defs>
                            {/* Brain Gradient */}
                            <linearGradient id="loaderBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.85" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                            </linearGradient>

                            {/* Mechanical Gradient */}
                            <linearGradient id="loaderMechGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="100%" stopColor="#22d3ee" />
                            </linearGradient>

                            {/* Glow Filter */}
                            <filter id="loaderGlow">
                                <feGaussianBlur stdDeviation="3" result="glow" />
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Outer Rotating Ring */}
                        <motion.circle
                            cx="100" cy="100" r="90"
                            fill="none"
                            stroke="url(#loaderMechGrad)"
                            strokeWidth="2"
                            strokeDasharray="12 6"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '100px 100px' }}
                        />
                        <motion.circle
                            cx="100" cy="100" r="82"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="1"
                            strokeOpacity="0.4"
                            strokeDasharray="6 12"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '100px 100px' }}
                        />

                        {/* Brain - Assembled from parts */}
                        <g transform="translate(100, 100)" filter="url(#loaderGlow)">
                            {/* Left Hemisphere */}
                            <motion.path
                                d="M -5,0 
                                   C -5,-35 -50,-45 -55,-18
                                   C -60,8 -60,28 -48,42
                                   C -35,55 -15,55 -5,45
                                   C -5,30 -5,15 -5,0"
                                fill="url(#loaderBrainGrad)"
                                stroke="#67e8f9"
                                strokeWidth="1.5"
                                initial={{ x: -50, opacity: 0, rotate: -30 }}
                                animate={{ x: 0, opacity: 1, rotate: 0 }}
                                transition={{ duration: 1.2, ease: "backOut", delay: 0.3 }}
                            />

                            {/* Right Hemisphere */}
                            <motion.path
                                d="M 5,0 
                                   C 5,-35 50,-45 55,-18
                                   C 60,8 60,28 48,42
                                   C 35,55 15,55 5,45
                                   C 5,30 5,15 5,0"
                                fill="url(#loaderBrainGrad)"
                                stroke="#67e8f9"
                                strokeWidth="1.5"
                                initial={{ x: 50, opacity: 0, rotate: 30 }}
                                animate={{ x: 0, opacity: 1, rotate: 0 }}
                                transition={{ duration: 1.2, ease: "backOut", delay: 0.5 }}
                            />

                            {/* Brain Folds - Animate in */}
                            <motion.g
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1, duration: 0.5 }}
                            >
                                <path d="M -12,-25 Q -28,-20 -35,-5" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                                <path d="M -10,5 Q -30,10 -42,22" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                                <path d="M 12,-25 Q 28,-20 35,-5" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                                <path d="M 10,5 Q 30,10 42,22" stroke="#a5f3fc" strokeWidth="1" fill="none" strokeOpacity="0.6" />
                            </motion.g>

                            {/* Circuit Lines - Draw in */}
                            <motion.path
                                d="M -45,-12 L -28,-12 L -28,8 L -15,8"
                                stroke="#22d3ee"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 1.5 }}
                            />
                            <motion.path
                                d="M 45,-12 L 28,-12 L 28,8 L 15,8"
                                stroke="#22d3ee"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 1.7 }}
                            />

                            {/* LED Nodes - Blink on */}
                            <motion.circle cx="-45" cy="-12" r="4" fill="#22d3ee"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: [0, 1, 0.5, 1], scale: 1 }}
                                transition={{ duration: 0.5, delay: 2 }}
                            />
                            <motion.circle cx="45" cy="-12" r="4" fill="#22d3ee"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: [0, 1, 0.5, 1], scale: 1 }}
                                transition={{ duration: 0.5, delay: 2.2 }}
                            />
                            <motion.circle cx="-38" cy="30" r="3" fill="#8b5cf6"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: [0, 1, 0.5, 1], scale: 1 }}
                                transition={{ duration: 0.5, delay: 2.4 }}
                            />
                            <motion.circle cx="38" cy="30" r="3" fill="#8b5cf6"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: [0, 1, 0.5, 1], scale: 1 }}
                                transition={{ duration: 0.5, delay: 2.6 }}
                            />

                            {/* Central Core - Power up */}
                            <motion.circle
                                cx="0" cy="6" r="14"
                                fill="#0c4a6e"
                                stroke="#22d3ee"
                                strokeWidth="2"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 1.8, type: "spring" }}
                            />
                            <motion.circle
                                cx="0" cy="6" r="7"
                                fill="#06b6d4"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: [0, 1, 0.6, 1] }}
                                transition={{ duration: 0.8, delay: 2 }}
                            />
                            <motion.path
                                d="M -4,6 L 4,6 M 0,2 L 0,10"
                                stroke="#a5f3fc"
                                strokeWidth="2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2.2 }}
                            />

                            {/* Gears - Spin in */}
                            <motion.g
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
                            >
                                <motion.g
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2.5 }}
                                    style={{ transformOrigin: '-32px -32px' }}
                                >
                                    <circle cx="-32" cy="-32" r="10" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
                                    <path d="M -32,-42 L -32,-38 M -32,-22 L -32,-26 M -42,-32 L -38,-32 M -22,-32 L -26,-32"
                                        stroke="#0ea5e9" strokeWidth="2" />
                                </motion.g>
                            </motion.g>
                            <motion.g
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, delay: 1, type: "spring" }}
                            >
                                <motion.g
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2.5 }}
                                    style={{ transformOrigin: '32px -32px' }}
                                >
                                    <circle cx="32" cy="-32" r="8" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
                                    <path d="M 32,-40 L 32,-37 M 32,-24 L 32,-27 M 40,-32 L 37,-32 M 24,-32 L 27,-32"
                                        stroke="#8b5cf6" strokeWidth="1.5" />
                                </motion.g>
                            </motion.g>

                            {/* Pulse after assembly */}
                            <motion.circle
                                cx="0" cy="6" r="40"
                                fill="none"
                                stroke="#22d3ee"
                                strokeWidth="1"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 2.8 }}
                            />
                        </g>
                    </svg>
                </div>

                {/* Loading Text */}
                <motion.div
                    className="absolute -bottom-4 left-0 right-0 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5 }}
                >
                    <motion.span
                        className="text-cyan-400 font-semibold tracking-[0.3em] text-sm uppercase"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        Initializing KnowBot 3.0
                    </motion.span>
                    <motion.span
                        className="text-cyan-400"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >...</motion.span>
                </motion.div>
            </div>
        </div>
    );
}

export default BrainLoader;
