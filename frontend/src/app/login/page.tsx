'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { BrainLogo3 } from '@/components/BrainLogo3';

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ username, password });
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 overflow-hidden relative">
            {/* Background Effect */}
            <div className="aurora-bg"></div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.6, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-6 rounded-3xl border border-cyan-500/20 bg-[#0a1628]/80 p-8 backdrop-blur-2xl shadow-2xl relative z-10"
                style={{
                    boxShadow: '0 0 60px rgba(34, 211, 238, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
            >
                {/* Logo */}
                <div className="flex justify-center -mt-4 mb-2">
                    <BrainLogo3 size="lg" showText={true} />
                </div>

                <div className="text-center relative z-20">
                    <p className="text-sm text-cyan-300/70 mb-6">Welcome back! Please login to your account.</p>

                    <div className="flex flex-col items-center gap-4 mb-2">
                        <motion.div
                            className="w-24 h-24 relative"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                            transition={{ type: "spring", duration: 1.5, rotate: { repeat: Infinity, duration: 4 } }}
                        >
                            <img
                                src="/bot_red_idle.png"
                                alt="KnowBot Login"
                                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                            />
                        </motion.div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                    </div>
                </div>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/30 backdrop-blur"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-cyan-300/80 mb-1.5">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full rounded-xl border border-cyan-500/20 bg-[#0c1a2e]/80 p-3 text-white placeholder-gray-500
                                         focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20
                                         transition-all duration-300 backdrop-blur"
                                placeholder="Enter username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyan-300/80 mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-cyan-500/20 bg-[#0c1a2e]/80 p-3 text-white placeholder-gray-500 
                                         focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 
                                         transition-all duration-300 backdrop-blur"
                                placeholder="Enter password"
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="relative flex w-full justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden group"
                        style={{
                            background: 'linear-gradient(135deg, #0ea5e9, #3b82f6, #8b5cf6)',
                            backgroundSize: '200% 200%',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10">{loading ? 'Logging in...' : 'Sign in'}</span>
                    </motion.button>
                </form>

                <div className="text-center space-y-4">
                    <p className="text-sm text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                            Sign up
                        </Link>
                    </p>

                    <div className="pt-4 border-t border-cyan-500/10">
                        <a
                            href="http://localhost:8000/admin/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-xs font-medium text-cyan-400/60 hover:text-cyan-300 transition-colors"
                        >
                            <span>🔧</span> Admin Dashboard
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
