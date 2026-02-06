'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { BrainLogo3 } from '@/components/BrainLogo3';

export default function RegisterPage() {
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register({ username, email, password });
        } catch (err: any) {
            const data = err.response?.data;
            if (data) {
                const firstError = Object.values(data)[0];
                setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
            } else {
                setError('Registration failed. Please try again.');
            }
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
                        className="absolute w-1 h-1 rounded-full bg-purple-400/30"
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
                className="w-full max-w-md space-y-6 rounded-3xl border border-purple-500/20 bg-[#0a1628]/80 p-8 backdrop-blur-2xl shadow-2xl relative z-10"
                style={{
                    boxShadow: '0 0 60px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
            >
                {/* Logo */}
                <div className="flex justify-center -mt-4 mb-2">
                    <BrainLogo3 size="md" showText={true} />
                </div>

                <div className="text-center">
                    <p className="text-sm text-purple-300/70">Create your private knowledge assistant.</p>
                </div>

                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/30 backdrop-blur"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-cyan-300/80 mb-1">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full rounded-xl border border-cyan-500/20 bg-[#0c1a2e]/80 p-2.5 text-white placeholder-gray-500 
                                         focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 
                                         transition-all duration-300 backdrop-blur text-sm"
                                placeholder="Choose a username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyan-300/80 mb-1">Email (Optional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border border-cyan-500/20 bg-[#0c1a2e]/80 p-2.5 text-white placeholder-gray-500 
                                         focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 
                                         transition-all duration-300 backdrop-blur text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyan-300/80 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-cyan-500/20 bg-[#0c1a2e]/80 p-2.5 text-white placeholder-gray-500 
                                         focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 
                                         transition-all duration-300 backdrop-blur text-sm"
                                placeholder="Create a password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-cyan-300/80 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full rounded-xl border border-cyan-500/20 bg-[#0c1a2e]/80 p-2.5 text-white placeholder-gray-500 
                                         focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 
                                         transition-all duration-300 backdrop-blur text-sm"
                                placeholder="Repeat password"
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="relative flex w-full justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg mt-6
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden group"
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
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
                        <span className="relative z-10">{loading ? 'Creating account...' : 'Create account'}</span>
                    </motion.button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
