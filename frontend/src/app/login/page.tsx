'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { NeuralBackground } from '@/components/NeuralBackground';

export default function LoginPage() {
    const { login, loading } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ username, password });
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#030810]">

            {/* Constellation Background */}
            <NeuralBackground />

            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-md px-4">

                {/* Floating Bot */}
                <div className="flex justify-center mb-8">
                    <motion.div
                        className="w-32 h-32 relative"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", duration: 1.5 }}
                    >
                        <img
                            src="/bot_red_idle_black.png"
                            alt="KnowBot Login"
                            className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(255,215,0,0.6)]"
                            style={{ mixBlendMode: 'screen' }}
                        />
                        {/* Waving Hand Overlay Animation on Load */}
                        <motion.img
                            src="/bot_red_wave_black.png"
                            alt="Waving"
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ mixBlendMode: 'screen' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 2, delay: 1, repeat: 0 }}
                        />
                    </motion.div>
                </div>

                {/* Glass Card */}
                <motion.div
                    className="backdrop-blur-xl bg-slate-900/40 border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Glow Effects behind card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-3xl blur-xl -z-10" />

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                            KnowBot 3.0
                        </h1>
                        <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mt-2">
                            Secure Neural Uplink
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-xs text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/20 transition-all text-sm font-medium"
                                    placeholder="Username / ID"
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-400/50 focus:ring-1 focus:ring-red-400/20 transition-all text-sm font-medium"
                                    placeholder="Passphrase"
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-slate-900 shadow-lg relative overflow-hidden group"
                            style={{
                                background: 'linear-gradient(135deg, #fbbf24, #f87171)' // Amber to Red
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? 'Authenticating...' : 'Login'}
                                {!loading && <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-xs">
                            New user? <Link href="/register" className="text-orange-400 hover:text-orange-300 transition-colors">Sign Up</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
