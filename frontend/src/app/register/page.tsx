'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

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
                // Handle common DRF field errors
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
        <div className="flex min-h-screen items-center justify-center bg-[#0e1117] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Join KnowBot</h1>
                    <p className="mt-2 text-sm text-gray-400">Create your private knowledge assistant.</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
                                placeholder="Choose a username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Email (Optional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-white/10 bg-black/20 p-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="you@example.com"
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
                                placeholder="Create a password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-white/10 bg-black/20 p-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Repeat password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
