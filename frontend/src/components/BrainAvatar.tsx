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
            <motion.div
                className="relative w-28 h-28"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <motion.img
                    src="/logo_bot_brain.png"
                    alt="KnowBot Brain"
                    className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(34,211,238,0.6)]"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Neural Pulse Overlay */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(232, 121, 249, 0.2) 0%, transparent 60%)' }}
                    animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </motion.div>

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
