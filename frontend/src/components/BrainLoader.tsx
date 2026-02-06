'use client';

import { motion } from 'framer-motion';

export function BrainLoader() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#030810] text-cyan-500 font-mono relative overflow-hidden z-[100]">

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Spinning Core */}
                <motion.div
                    className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-purple-500 border-l-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />

                {/* Boot Log Text */}
                <div className="h-12 flex flex-col items-center justify-center space-y-1">
                    <motion.p
                        className="text-xs uppercase tracking-[0.2em] text-cyan-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2, times: [0, 0.1, 0.9, 1], repeat: Infinity }}
                    >
                        Initializing Neural Core...
                    </motion.p>
                    <motion.p
                        className="text-[10px] uppercase tracking-widest text-fuchsia-400/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2, delay: 1, times: [0, 0.1, 0.9, 1], repeat: Infinity }}
                    >
                        Establishing Uplink...
                    </motion.p>
                </div>

                {/* Loading Bar */}
                <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mt-4">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                </div>
            </div>
        </div>
    );
}

export default BrainLoader;
