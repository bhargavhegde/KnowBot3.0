'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export function BrainAvatar() {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div
            className="relative flex items-center justify-center group cursor-pointer overflow-visible"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Outer Glow Ring */}
            <motion.div
                className="absolute w-24 h-24 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)'
                }}
                animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main Container */}
            <motion.div
                className="relative w-32 h-32"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                {/* POP OUT BRAIN Layer */}
                <motion.img
                    src="/bot_brain_gold.png"
                    alt="Golden Brain"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_25px_rgba(255,215,0,0.8)] z-0"
                    style={{ mixBlendMode: 'screen' }}
                    initial={{ y: 0, opacity: 0, scale: 0.8 }}
                    animate={{
                        y: isHovering ? -35 : 0,
                        opacity: isHovering ? 1 : 0,
                        scale: isHovering ? 1.1 : 0.8
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                />

                {/* IDLE State */}
                <motion.img
                    src="/bot_red_idle_black.png"
                    alt="KnowBot Idle"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.3)] z-10"
                    style={{ mixBlendMode: 'screen' }}
                    initial={{ opacity: 1 }}
                    animate={{
                        opacity: isHovering ? 0 : 1,
                        y: isHovering ? 0 : [0, -6, 0] // Only float when idle
                    }}
                    transition={{ opacity: { duration: 0.2 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                />

                {/* WAVE State */}
                <motion.img
                    src="/bot_red_wave_black.png"
                    alt="KnowBot Waving"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] z-10"
                    style={{ mixBlendMode: 'screen' }}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isHovering ? 1 : 0, // Slight transparency to show brain pop better? No, keep solid.
                        rotate: isHovering ? [0, -5, 5, 0] : 0
                    }}
                    transition={{ opacity: { duration: 0.2 }, rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 1 } }}
                />

                {/* Neural Golden Pulse Overlay */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 60%)' }}
                    animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
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
