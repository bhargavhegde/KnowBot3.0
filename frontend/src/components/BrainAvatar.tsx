'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedBot } from './AnimatedBot';

export function BrainAvatar() {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div
            className="relative flex items-center justify-center group cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Outer Glow Ring */}
            <motion.div
                className="absolute w-32 h-32 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)'
                }}
                animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            <AnimatedBot mode={isHovering ? 'hover' : 'idle'} size="lg" />

            {/* Hover Label */}
            <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: -5 }}
                whileHover={{ opacity: 1, y: 0 }}
                animate={{ opacity: isHovering ? 1 : 0, y: isHovering ? 0 : -5 }}
            >
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">
                    KnowBot 3.0
                </span>
            </motion.div>
        </div>
    );
}

export default BrainAvatar;
