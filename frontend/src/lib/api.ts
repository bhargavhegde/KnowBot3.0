/**
 * API Client for KnowBot Backend
 */

import axios from 'axios';

// API Base URL - use environment variable or fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types
export interface Document {
    id: number;
    filename: string;
    original_filename: string;
    file_size: number;
    file_type: string;
    index_status: 'pending' | 'processing' | 'indexed' | 'failed';
    chunk_count: number;
    error_message: string | null;
    uploaded_at: string;
    indexed_at: string | null;
}

export interface Citation {
    source: string;
    content: string;
    page?: number;
}

export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    citations: Citation[];
    created_at: string;
}

export interface ChatSession {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    messages?: ChatMessage[];
}

export interface SystemPrompt {
    id: number;
    name: string;
    content: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ChatResponse {
    response: string;
    session_id: number;
    citations: Citation[];
}

// API Functions

// Health Check
export const checkHealth = async () => {
    const response = await api.get('/health/');
    return response.data;
};

// Documents
export const getDocuments = async (): Promise<Document[]> => {
    const response = await api.get('/documents/');
    return response.data;
};

export const uploadDocument = async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteDocument = async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}/`);
};

export const getDocumentStatus = async (id: number): Promise<{ index_status: string; chunk_count: number; error_message: string | null }> => {
    const response = await api.get(`/documents/${id}/status/`);
    return response.data;
};

// Chat
export const sendMessage = async (message: string, sessionId?: number): Promise<ChatResponse> => {
    const response = await api.post('/chat/', {
        message,
        session_id: sessionId,
    });
    return response.data;
};

// Sessions
export const getSessions = async (): Promise<ChatSession[]> => {
    const response = await api.get('/sessions/');
    return response.data;
};

export const getSession = async (id: number): Promise<ChatSession> => {
    const response = await api.get(`/sessions/${id}/`);
    return response.data;
};

export const createSession = async (): Promise<ChatSession> => {
    const response = await api.post('/sessions/', {});
    return response.data;
};

export const deleteSession = async (id: number): Promise<void> => {
    await api.delete(`/sessions/${id}/`);
};

export const clearSessionMessages = async (id: number): Promise<void> => {
    await api.delete(`/sessions/${id}/clear/`);
};

// System Prompts
export const getSystemPrompts = async (): Promise<SystemPrompt[]> => {
    const response = await api.get('/prompts/');
    return response.data;
};

export const getActivePrompt = async (): Promise<SystemPrompt | null> => {
    try {
        const response = await api.get('/prompts/active/');
        return response.data.id ? response.data : null;
    } catch {
        return null;
    }
};

export const createPrompt = async (name: string, content: string, isActive: boolean = false): Promise<SystemPrompt> => {
    const response = await api.post('/prompts/', {
        name,
        content,
        is_active: isActive,
    });
    return response.data;
};

export const activatePrompt = async (id: number): Promise<SystemPrompt> => {
    const response = await api.post(`/prompts/${id}/activate/`);
    return response.data;
};

export const resetToDefaultPrompt = async (): Promise<void> => {
    await api.post('/prompts/reset/');
};

export default api;
