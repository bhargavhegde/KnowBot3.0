'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { NeuralBackground } from '@/components/NeuralBackground';

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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#030810]">

            {/* Constellation Background */}
            <NeuralBackground />

            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-md px-4">

                {/* Floating Bot Icon (Small version for register) */}
                <div className="flex justify-center mb-6">
                    <motion.div
                        className="w-20 h-20 relative"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <img
                            src="/bot_red_idle_black.png"
                            alt="KnowBot Register"
                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                            style={{ mixBlendMode: 'screen' }}
                        />
                    </motion.div>
                </div>

                <motion.div
                    className="backdrop-blur-xl bg-slate-900/40 border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Glow Effects behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10" />

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                            Initialize Identity
                        </h1>
                        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] mt-2">
                            New Knowledge Core Registration
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-xs text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-3">
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all text-sm"
                                placeholder="Username"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition-all text-sm"
                                placeholder="Email (Optional)"
                            />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all text-sm"
                                placeholder="Create Passphrase"
                            />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all text-sm"
                                placeholder="Confirm Passphrase"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white shadow-lg relative overflow-hidden group mt-2"
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' // Purple to Blue
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? 'Initializing...' : 'Create Account'}
                                {!loading && <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-xs">
                            Already have an account? <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
