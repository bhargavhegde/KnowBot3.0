/**
 * Sidebar Component
 * Document management and system prompt customization
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { apiService, Document } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
    const { user, logout } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showPromptEditor, setShowPromptEditor] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [hasActivePrompt, setHasActivePrompt] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch documents on mount
    useEffect(() => {
        if (user) {
            fetchDocuments();
            fetchActivePrompt();
        }
    }, [user]);

    const fetchDocuments = async () => {
        try {
            const resp = await apiService.getDocuments();
            setDocuments(resp.data);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        }
    };

    const fetchActivePrompt = async () => {
        try {
            const resp = await apiService.getActivePrompt();
            const prompt = resp.data;
            setHasActivePrompt(!!prompt && 'id' in prompt);
            if (prompt && 'content' in prompt) {
                setCustomPrompt(prompt.content);
            }
        } catch (err) {
            console.error('Failed to fetch active prompt:', err);
        }
    };

    // Poll for document status updates
    useEffect(() => {
        const pendingDocs = documents.filter(d =>
            d.index_status === 'pending' || d.index_status === 'processing'
        );

        if (pendingDocs.length === 0) return;

        const interval = setInterval(async () => {
            for (const doc of pendingDocs) {
                try {
                    const resp = await apiService.getDocumentStatus(doc.id);
                    const status = resp.data;
                    if (status.index_status !== doc.index_status) {
                        fetchDocuments();
                        break;
                    }
                } catch (err) {
                    console.error(`Failed to get status for doc ${doc.id}:`, err);
                }
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [documents]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsUploading(true);
        setError(null);

        for (const file of acceptedFiles) {
            try {
                await apiService.uploadDocument(file);
            } catch (err: any) {
                setError(err?.response?.data?.error || `Failed to upload ${file.name}`);
            }
        }

        setIsUploading(false);
        fetchDocuments();
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
        },
    });

    const handleDeleteDocument = async (id: number) => {
        try {
            await apiService.deleteDocument(id);
            fetchDocuments();
        } catch (err) {
            setError('Failed to delete document');
        }
    };

    const handleApplyPrompt = async () => {
        try {
            if (customPrompt.trim()) {
                await apiService.createPrompt({ name: 'Custom Prompt', content: customPrompt.trim(), is_active: true });
                setHasActivePrompt(true);
            } else {
                await apiService.resetPrompt();
                setHasActivePrompt(false);
            }
            setShowPromptEditor(false);
        } catch (err) {
            setError('Failed to update prompt');
        }
    };

    const handleResetPrompt = async () => {
        try {
            await apiService.resetPrompt();
            setCustomPrompt('');
            setHasActivePrompt(false);
        } catch (err) {
            setError('Failed to reset prompt');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; text: string }> = {
            pending: { color: 'bg-yellow-600', text: '⏳ Pending' },
            processing: { color: 'bg-blue-600', text: '⚡ Processing' },
            indexed: { color: 'bg-green-600', text: '✓ Ready' },
            failed: { color: 'bg-red-600', text: '✗ Failed' },
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    return (
        <div className="w-80 bg-[#161b22] border-r border-white/5 flex flex-col h-full shadow-2xl">
            {/* Header */}
            <div className="px-6 py-6 border-b border-white/5">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="text-indigo-400">●</span> KnowBot
                </h2>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-500/10 border-l-2 border-red-500 px-4 py-2 text-xs text-red-200"
                    >
                        {error}
                        <button onClick={() => setError(null)} className="float-right hover:text-white">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Area */}
            <div className="px-6 py-6 border-b border-white/5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Documents</h3>
                <div
                    {...getRootProps()}
                    className={`border border-dashed rounded-xl p-6 text-center cursor-pointer
                    transition-all duration-200 ${isDragActive
                            ? 'border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/10'
                            : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'}`}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <div className="text-sm font-medium text-indigo-400">Uploading...</div>
                    ) : (
                        <div className="text-gray-400 text-sm">
                            <span className="text-xl block mb-2">📁</span>
                            <div className="font-medium text-gray-300 mb-1">Upload File</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-tighter">PDF, TXT, MD</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {documents.length > 0 && (
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/5 hover:bg-white/[0.08] rounded-xl p-3 border border-white/5 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-200 truncate" title={doc.original_filename}>
                                            {doc.original_filename}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {getStatusBadge(doc.index_status)}
                                            {doc.chunk_count > 0 && (
                                                <span className="text-[10px] font-medium text-gray-500">
                                                    {doc.chunk_count} chunks
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDocument(doc.id);
                                        }}
                                        className="text-gray-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* System Prompt Section */}
            <div className="border-t border-white/5 px-6 py-6 bg-black/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Prompt</h3>
                    <div className={`w-2 h-2 rounded-full ${hasActivePrompt ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                </div>

                {showPromptEditor ? (
                    <div className="space-y-3">
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Enter custom instructions..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 
                                     text-xs text-white placeholder-gray-600 resize-none 
                                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            rows={4}
                        />
                        <div className="flex gap-2">
                            <button onClick={handleApplyPrompt} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors">
                                Apply
                            </button>
                            <button
                                onClick={() => setShowPromptEditor(false)}
                                className="px-3 bg-white/5 hover:bg-white/10 text-gray-400 text-xs rounded-lg border border-white/10 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPromptEditor(true)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg border border-white/10 transition-all"
                        >
                            Customize
                        </button>
                        {hasActivePrompt && (
                            <button
                                onClick={handleResetPrompt}
                                className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                                title="Reset"
                            >
                                ⟲
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* User Profile / Logout */}
            <div className="border-t border-white/5 py-4 px-6 bg-black/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user?.username || 'User'}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user?.email || 'Authenticated'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="text-gray-500 hover:text-white p-2 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
