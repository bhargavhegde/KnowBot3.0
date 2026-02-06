'use client';

import { motion } from 'framer-motion';

export function BrainLoader() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#030810] text-amber-500 font-mono relative overflow-hidden z-[100]">

            {/* Animated Background Grid */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

                {/* Scan Lines */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/10 to-transparent h-32"
                    animate={{ y: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, -200],
                            opacity: [0, 0.8, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: 'easeOut',
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* 3D Hologram Effect */}
                <div className="relative w-40 h-40">
                    {/* Rotating Rings */}
                    <motion.div
                        className="absolute inset-0 border-4 border-amber-400/30 rounded-full"
                        animate={{ rotateY: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        style={{ transformStyle: 'preserve-3d' }}
                    />
                    <motion.div
                        className="absolute inset-4 border-4 border-orange-500/30 rounded-full"
                        animate={{ rotateX: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        style={{ transformStyle: 'preserve-3d' }}
                    />
                    <motion.div
                        className="absolute inset-8 border-4 border-red-500/30 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Center Core */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full blur-xl opacity-60" />
                    </motion.div>

                    {/* Spinning Core */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="w-12 h-12 border-4 border-t-amber-400 border-r-transparent border-b-red-500 border-l-transparent rounded-full" />
                    </motion.div>
                </div>

                {/* Boot Log Text with Typewriter Effect */}
                <div className="h-16 flex flex-col items-center justify-center space-y-2">
                    <motion.p
                        className="text-sm uppercase tracking-[0.3em] text-amber-300 font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0.3, 1, 1, 0] }}
                        transition={{ duration: 3, times: [0, 0.1, 0.4, 0.5, 0.6, 0.9, 1], repeat: Infinity }}
                    >
                        ⟨ Initializing Neural Core ⟩
                    </motion.p>
                    <motion.p
                        className="text-xs uppercase tracking-widest text-orange-400/90"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0.3, 1, 1, 0] }}
                        transition={{ duration: 3, delay: 1.5, times: [0, 0.1, 0.4, 0.5, 0.6, 0.9, 1], repeat: Infinity }}
                    >
                        ⟨ Establishing Quantum Link ⟩
                    </motion.p>
                </div>

                {/* Fancy Progress Bar */}
                <div className="w-80 relative">
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-amber-500/20">
                        <motion.div
                            className="h-full relative"
                            style={{
                                background: 'linear-gradient(90deg, #fbbf24, #f97316, #ef4444, #fbbf24)',
                                backgroundSize: '200% 100%',
                            }}
                            animate={{
                                width: ["0%", "100%"],
                                backgroundPosition: ['0% 0%', '200% 0%']
                            }}
                            transition={{
                                width: { duration: 3, ease: "easeInOut", repeat: Infinity },
                                backgroundPosition: { duration: 2, ease: "linear", repeat: Infinity }
                            }}
                        >
                            {/* Glow Trail */}
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/50 to-transparent" />
                        </motion.div>
                    </div>

                    {/* Percentage */}
                    <motion.p
                        className="text-xs text-center mt-3 text-amber-400/80 font-mono"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        Loading Experience...
                    </motion.p>
                </div>
            </div>
        </div>
    );
}

export default BrainLoader;
