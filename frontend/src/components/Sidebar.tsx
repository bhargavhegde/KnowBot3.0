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
            // Re-fetch everything to ensure context is updated
            await fetchDocuments();
            // In a real RAG, this would re-index if needed, but here we just refresh local state
            // and maybe notify the LLM implicitly by refreshing the file list in prompt
            setTimeout(() => setIsSyncing(false), 1500); // Visual feedback
        } catch (err) {
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
        <div className="w-80 glass flex flex-col h-full shadow-2xl border-r border-white/10 relative z-10 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex flex-col items-center gap-2">
                <BrainAvatar />
                <button
                    onClick={handleSyncKnowledge}
                    disabled={isSyncing}
                    className={`mt-2 w-full py-2 rounded-xl border border-blue-500/30 text-[10px] uppercase font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-2
                    ${isSyncing ? 'bg-blue-500/20 text-blue-300' : 'bg-transparent text-blue-400 hover:bg-blue-500/10'}`}
                >
                    <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
                    {isSyncing ? 'Syncing Neural Memory...' : 'Sync Knowledge'}
                </button>
            </div>

            {/* Content Tabs/Sections */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">

                {/* Chat History Section */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold text-cyan-400/70 uppercase tracking-widest">Chat History</h3>
                        <button
                            onClick={createNewSession}
                            className="text-xs font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1"
                        >
                            <span className="text-lg">+</span>
                        </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {sessions.length === 0 ? (
                            <p className="text-[10px] text-gray-500 italic text-center py-4">No recent chats</p>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => selectSession(session.id)}
                                    className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                                        ${currentSessionId === session.id
                                            ? 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/5'
                                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[11px] font-bold truncate ${currentSessionId === session.id ? 'text-blue-300' : 'text-gray-300'}`}>
                                            {session.title || 'Untitled Session'}
                                        </p>
                                        <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-tight">
                                            {session.message_count} messages
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="h-px bg-white/5 mx-6 my-4 opacity-50" />

                {/* Documents Section */}
                <div className="px-6 pb-6 flex-1 min-h-0">
                    <h3 className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest mb-4">Neural Documents</h3>

                    {/* Compact Upload */}
                    <div
                        {...getRootProps()}
                        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer mb-4
                        transition-all duration-300 group
                        ${isDragActive
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-white/10 hover:border-blue-400/50 hover:bg-white/5'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="text-gray-400 text-[10px] group-hover:text-blue-300 transition-colors uppercase font-bold tracking-widest">
                            {isUploading ? 'Uploading...' : 'Add Knowledge'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <motion.div
                                key={doc.id}
                                className="bg-white/5 rounded-lg p-2 border border-white/5 group hover:border-blue-500/30 transition-all"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold text-gray-200 truncate" title={doc.original_filename}>
                                            {doc.original_filename}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handlePreview(doc)}
                                            className="text-gray-500 hover:text-cyan-400 p-1 transition-colors"
                                            title="Preview Document"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDeleteDocument(doc.id)} className="text-gray-600 hover:text-red-400 p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
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
                        className="absolute bottom-16 left-4 right-4 bg-red-500/20 border border-red-500/40 p-3 rounded-xl text-[10px] text-red-100 backdrop-blur-md z-50 shadow-2xl"
                    >
                        <div className="flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError(null)}>✕</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* User Profile / Logout */}
            <div className="border-t border-white/5 py-4 px-6 bg-black/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-white truncate">{user?.username || 'User'}</p>
                            <p className="text-[9px] text-gray-500 truncate">{user?.email || 'Authenticated'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="text-gray-500 hover:text-white p-2 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
