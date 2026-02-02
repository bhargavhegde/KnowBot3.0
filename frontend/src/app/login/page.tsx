'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

import { BrainHologram } from '@/components/BrainHologram';

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
        <div className="flex min-h-screen items-center justify-center bg-[#0e1117] px-4 overflow-hidden relative">
            {/* Background Effect */}
            <div className="aurora-bg"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl shadow-2xl relative z-10"
            >
                <div className="flex justify-center -mt-12 -mb-6 pointer-events-none">
                    <div className="scale-75">
                        <BrainHologram className="w-64 h-64" />
                    </div>
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white relative z-20">KnowBot</h1>
                    <p className="mt-2 text-sm text-gray-400">Welcome back! Please login to your account.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-400/10 p-3 text-sm text-red-400 border border-red-400/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-white/10 bg-black/20 p-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Enter username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-white/10 bg-black/20 p-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Enter password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Logging in...' : 'Sign in'}
                    </button>
                </form>

                <div className="text-center space-y-4">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                            Sign up
                        </Link>
                    </p>

                    <div className="pt-4 border-t border-white/5">
                        <a
                            href="http://localhost:8000/admin/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            Admin Dashboard
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
