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
                className="absolute w-64 h-64 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)'
                }}
                animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            <AnimatedBot mode={isHovering ? 'hover' : 'idle'} size="huge" />
        </div>
    );
}

export default BrainAvatar;
