'use client';

import { motion } from 'framer-motion';

export function CyberBrainIcon({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="cyberIconGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
            {/* Upgraded Cyber Brain Shape */}
            <path
                d="M30,50 Q30,20 50,20 Q70,20 70,50 Q70,80 50,80 Q30,80 30,50"
                fill="url(#cyberIconGrad)"
                stroke="#67e8f9"
                strokeWidth="2"
            />
            {/* Tech Lines & Nodes */}
            <path d="M40,30 L60,30 L60,70 L40,70 Z" fill="white" fillOpacity="0.1" />
            <path d="M30,50 L45,50 M55,50 L70,50 M50,20 L50,40 M50,60 L50,80" stroke="#cffafe" strokeWidth="1" />
            <circle cx="50" cy="50" r="8" fill="#ec4899" fillOpacity="0.2" stroke="#ec4899" strokeWidth="1" />
            <circle cx="50" cy="50" r="3" fill="#ec4899" />

            {/* Small Nodes */}
            <circle cx="40" cy="30" r="1.5" fill="#cffafe" />
            <circle cx="60" cy="30" r="1.5" fill="#cffafe" />
            <circle cx="40" cy="70" r="1.5" fill="#cffafe" />
            <circle cx="60" cy="70" r="1.5" fill="#cffafe" />
        </svg>
    );
}
