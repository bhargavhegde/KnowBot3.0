/**
 * Sidebar Component
 * Document management and system prompt customization
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { apiService, Document, ChatSession } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { BrainAvatar } from './BrainAvatar';

export function Sidebar() {
    const { user, logout } = useAuth();
    const { sessions, currentSessionId, createNewSession, selectSession, deleteSession } = useChat();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch documents on mount
    useEffect(() => {
        if (user) {
            fetchDocuments();
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

    const handleSyncKnowledge = async () => {
        setIsSyncing(true);
        try {
            await fetchDocuments();
            setTimeout(() => setIsSyncing(false), 1500);
        } catch (err) {
            setIsSyncing(false);
        }
    };

    const handleHardReset = async () => {
        if (!window.confirm('WARNING: This will permanently wipe all uploaded documents and neural memory for your account. Continue?')) {
            return;
        }
        setIsSyncing(true);
        try {
            await apiService.resetKnowledge();
            setDocuments([]);
            setError(null);
            alert('Knowledge base cleared successfully.');
        } catch (err) {
            console.error('Failed to reset knowledge:', err);
            setError('Failed to clear knowledge base');
        } finally {
            setIsSyncing(false);
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
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/tiff': ['.tiff', '.tif'],
            'image/bmp': ['.bmp'],
        },
    });

    const handlePreview = async (doc: Document) => {
        try {
            const response = await apiService.previewDocument(doc.id);
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Failed to preview document:', err);
            setError('Failed to preview document');
        }
    };

    const handleDeleteDocument = async (id: number) => {
        try {
            await apiService.deleteDocument(id);
            fetchDocuments();
        } catch (err) {
            setError('Failed to delete document');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; text: string }> = {
            pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', text: '⏳ Pending' },
            processing: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: '⚡ Processing' },
            indexed: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: '✓ Ready' },
            failed: { color: 'bg-red-500/20 text-red-300 border-red-500/30', text: '✗ Failed' },
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    return (
        <div
            className="w-80 flex flex-col h-full shadow-2xl border-r border-fuchsia-500/20 relative z-10 overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, rgba(40, 0, 40, 0.95) 0%, rgba(20, 0, 30, 0.98) 100%)',
                backdropFilter: 'blur(20px)'
            }}
        >
            {/* Header */}
            <div className="px-6 py-5 border-b border-fuchsia-500/20 flex flex-col items-center gap-3 relative overflow-hidden"
                style={{ background: 'linear-gradient(180deg, rgba(232, 121, 249, 0.05) 0%, transparent 100%)' }}>

                {/* Animated top border */}
                <motion.div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                        background: 'linear-gradient(90deg, transparent, #e879f9, #22d3ee, transparent)',
                        backgroundSize: '200% 100%'
                    }}
                    animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />

                <BrainAvatar />

                <motion.button
                    onClick={handleSyncKnowledge}
                    disabled={isSyncing}
                    className={`mt-2 w-full py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-2
                    ${isSyncing
                            ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
                            : 'bg-transparent text-fuchsia-400 border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:border-fuchsia-400/50'}`}
                    style={{ border: '1px solid' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <motion.span
                        animate={isSyncing ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: "linear" }}
                    >
                        🔄
                    </motion.span>
                    {isSyncing ? 'Syncing Neural Memory...' : 'Sync Knowledge'}
                </motion.button>

                <motion.button
                    onClick={handleHardReset}
                    className="text-[9px] text-gray-500 hover:text-red-400 uppercase tracking-widest font-bold transition-colors"
                    whileHover={{ scale: 1.05 }}
                >
                    ⚠️ Hard Reset Memory
                </motion.button>
            </div>

            {/* Content Tabs/Sections */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">

                {/* Chat History Section */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-[0.2em]">Chat History</h3>
                        <motion.button
                            onClick={createNewSession}
                            className="w-7 h-7 flex items-center justify-center text-lg font-bold text-white hover:text-cyan-400 
                                     rounded-lg border border-transparent hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            +
                        </motion.button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {sessions.length === 0 ? (
                            <p className="text-[10px] text-gray-500 italic text-center py-4">No recent chats</p>
                        ) : (
                            sessions.map((session) => (
                                <motion.div
                                    key={session.id}
                                    onClick={() => selectSession(session.id)}
                                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                                        ${currentSessionId === session.id
                                            ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                                            : 'bg-white/5 border-white/5 hover:border-cyan-500/20 hover:bg-cyan-500/5'}`}
                                    style={{ border: '1px solid' }}
                                    whileHover={{ x: 4 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[11px] font-bold truncate ${currentSessionId === session.id ? 'text-cyan-300' : 'text-gray-300'}`}>
                                            {session.title || 'Untitled Session'}
                                        </p>
                                        <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-tight">
                                            {session.message_count} messages
                                        </p>
                                    </div>
                                    <motion.button
                                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        ✕
                                    </motion.button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mx-6 my-4" />

                {/* Documents Section */}
                <div className="px-6 pb-6 flex-1 min-h-0">
                    <h3 className="text-[10px] font-bold text-blue-400/80 uppercase tracking-[0.2em] mb-4">Neural Documents</h3>

                    {/* Compact Upload */}
                    <div
                        {...getRootProps()}
                        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer mb-4
                        transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]
                        ${isDragActive
                                ? 'border-cyan-400 bg-cyan-500/10'
                                : 'border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/5'}`}
                    >
                        <input {...getInputProps()} />
                        <motion.div
                            className="text-gray-400 text-[10px] group-hover:text-cyan-300 transition-colors uppercase font-bold tracking-widest flex items-center justify-center gap-2"
                            animate={isDragActive ? { scale: 1.1 } : {}}
                        >
                            <span className="text-lg">{isDragActive ? '📥' : '📄'}</span>
                            {isUploading ? 'Uploading...' : isDragActive ? 'Drop files here!' : 'Add Knowledge'}
                        </motion.div>
                    </div>


                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <motion.div
                                key={doc.id}
                                className="bg-white/5 rounded-xl p-3 border border-white/5 group hover:border-cyan-500/30 transition-all"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold text-gray-200 truncate" title={doc.original_filename}>
                                            {doc.original_filename}
                                        </p>
                                        <div className="mt-1.5">
                                            {getStatusBadge(doc.index_status)}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <motion.button
                                            onClick={() => handlePreview(doc)}
                                            className="text-gray-500 hover:text-cyan-400 p-1.5 hover:bg-cyan-500/10 rounded-lg transition-all"
                                            title="Preview Document"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            className="text-gray-600 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-20 left-4 right-4 bg-red-500/20 border border-red-500/40 p-3 rounded-xl text-[10px] text-red-100 backdrop-blur-md z-50 shadow-2xl"
                    >
                        <div className="flex justify-between items-center">
                            <span>{error}</span>
                            <motion.button
                                onClick={() => setError(null)}
                                whileHover={{ scale: 1.2 }}
                            >
                                ✕
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* User Profile / Logout */}
            <div className="border-t border-cyan-500/10 py-4 px-6" style={{ background: 'rgba(5, 15, 30, 0.8)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <motion.div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-cyan-300 font-bold shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.2))',
                                border: '1px solid rgba(34, 211, 238, 0.3)'
                            }}
                            whileHover={{ scale: 1.1 }}
                        >
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </motion.div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{user?.username || 'User'}</p>
                            <p className="text-[9px] text-gray-500 truncate">{user?.email || 'Authenticated'}</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={logout}
                        className="text-gray-500 hover:text-red-400 p-2.5 rounded-lg hover:bg-red-500/10 transition-all"
                        title="Logout"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
