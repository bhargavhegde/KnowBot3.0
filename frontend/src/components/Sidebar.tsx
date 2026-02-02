/**
 * Sidebar Component
 * Document management and system prompt customization
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
    Document,
    getDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentStatus,
    getActivePrompt,
    createPrompt,
    resetToDefaultPrompt,
} from '@/lib/api';

export function Sidebar() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showPromptEditor, setShowPromptEditor] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [hasActivePrompt, setHasActivePrompt] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch documents on mount
    useEffect(() => {
        fetchDocuments();
        fetchActivePrompt();
    }, []);

    const fetchDocuments = async () => {
        try {
            const docs = await getDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        }
    };

    const fetchActivePrompt = async () => {
        try {
            const prompt = await getActivePrompt();
            setHasActivePrompt(!!prompt);
            if (prompt) {
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
                    const status = await getDocumentStatus(doc.id);
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
                await uploadDocument(file);
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
            await deleteDocument(id);
            fetchDocuments();
        } catch (err) {
            setError('Failed to delete document');
        }
    };

    const handleApplyPrompt = async () => {
        try {
            if (customPrompt.trim()) {
                await createPrompt('Custom Prompt', customPrompt.trim(), true);
                setHasActivePrompt(true);
            } else {
                await resetToDefaultPrompt();
                setHasActivePrompt(false);
            }
            setShowPromptEditor(false);
        } catch (err) {
            setError('Failed to update prompt');
        }
    };

    const handleResetPrompt = async () => {
        try {
            await resetToDefaultPrompt();
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
            <span className={`text-xs px-2 py-0.5 rounded ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    return (
        <div className="w-80 bg-[#1a1d24] border-r border-[#2d3748] flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-4 border-b border-[#2d3748]">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    🧠 KnowBot Controls
                </h2>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-900/30 border-l-4 border-red-500 px-4 py-2 text-sm text-red-200"
                    >
                        {error}
                        <button onClick={() => setError(null)} className="float-right">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Area */}
            <div className="px-4 py-4">
                <h3 className="text-sm font-medium mb-2">Upload Documents</h3>
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
            transition-colors ${isDragActive
                            ? 'border-[#4a90e2] bg-[#4a90e2]/10'
                            : 'border-[#2d3748] hover:border-[#4a90e2]'}`}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <div className="text-[#4a90e2]">Uploading...</div>
                    ) : isDragActive ? (
                        <div className="text-[#4a90e2]">Drop files here</div>
                    ) : (
                        <div className="text-gray-400 text-sm">
                            <span className="text-2xl block mb-1">📄</span>
                            Drag & drop or click<br />
                            <span className="text-xs">PDF, TXT, MD</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto px-4">
                <h3 className="text-sm font-medium mb-2">Current Documents</h3>
                {documents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No documents yet. Upload some files.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-[#1e2530] rounded-lg p-3 group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" title={doc.original_filename}>
                                            📄 {doc.original_filename}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getStatusBadge(doc.index_status)}
                                            {doc.chunk_count > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    {doc.chunk_count} chunks
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* System Prompt Section */}
            <div className="border-t border-[#2d3748] px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">System Prompt</h3>
                    <span className="text-xs text-gray-500">
                        {hasActivePrompt ? 'Custom active' : 'Using default'}
                    </span>
                </div>

                {showPromptEditor ? (
                    <div className="space-y-2">
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Enter custom instructions..."
                            className="w-full bg-[#1e2530] border border-[#2d3748] rounded-lg px-3 py-2 
                         text-sm text-[#e0e0e0] placeholder-gray-500 resize-none 
                         focus:outline-none focus:border-[#4a90e2]"
                            rows={4}
                        />
                        <div className="flex gap-2">
                            <button onClick={handleApplyPrompt} className="btn-primary text-sm flex-1">
                                Apply
                            </button>
                            <button
                                onClick={() => setShowPromptEditor(false)}
                                className="btn-secondary text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPromptEditor(true)}
                            className="btn-secondary text-sm flex-1"
                        >
                            Customize
                        </button>
                        {hasActivePrompt && (
                            <button
                                onClick={handleResetPrompt}
                                className="btn-secondary text-sm"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;
