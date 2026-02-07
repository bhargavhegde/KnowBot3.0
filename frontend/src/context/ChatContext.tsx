'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService, Message, ChatSession } from '@/lib/api';

import { useAuth } from './AuthContext';

interface ChatContextType {
    messages: Message[];
    sessions: ChatSession[];
    currentSessionId: number | null;
    isLoading: boolean;
    error: string | null;
    fetchSessions: () => Promise<void>;
    selectSession: (sessionId: number) => Promise<void>;
    createNewSession: () => Promise<void>;
    deleteSession: (sessionId: number) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    clearMessages: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = useCallback(async () => {
        try {
            const resp = await apiService.getSessions();
            setSessions(resp.data);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        }
    }, []);

    const selectSession = useCallback(async (sessionId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const resp = await apiService.getSession(sessionId);
            setCurrentSessionId(sessionId);
            setMessages(resp.data.messages || []);
        } catch (err) {
            setError('Failed to load session');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createNewSession = useCallback(async () => {
        setIsLoading(true);
        try {
            const resp = await apiService.createSession('New Chat');
            setCurrentSessionId(resp.data.id);
            setMessages([]);
            fetchSessions();
        } catch (err) {
            setError('Failed to create session');
        } finally {
            setIsLoading(false);
        }
    }, [fetchSessions]);

    const deleteSession = useCallback(async (sessionId: number) => {
        try {
            await apiService.deleteSession(sessionId);
            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setMessages([]);
            }
            fetchSessions();
        } catch (err) {
            setError('Failed to delete session');
        }
    }, [currentSessionId, fetchSessions]);

    const sendMessage = useCallback(async (content: string) => {
        setIsLoading(true);
        setError(null);

        // Optimistic update
        const userMsg: Message = {
            id: Date.now(),
            role: 'user',
            content,
            citations: [],
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);

        try {
            const resp = await apiService.sendMessage(content, currentSessionId || undefined);
            const response = resp.data;

            if (!currentSessionId && response.session_id) {
                setCurrentSessionId(response.session_id);
                fetchSessions();
            }

            const assistantMsg: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.response,
                citations: response.citations,
                steps: response.steps, // Extract thinking steps from response
                suggested_action: response.suggested_action, // Pass the suggestion flag
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to send message');
        } finally {
            setIsLoading(false);
        }
    }, [currentSessionId, fetchSessions]);

    const clearMessages = useCallback(async () => {
        if (!currentSessionId) return;
        try {
            await apiService.clearMessages(currentSessionId);
            setMessages([]);
        } catch (err) {
            setError('Failed to clear messages');
        }
    }, [currentSessionId]);

    // Handle auth state changes
    useEffect(() => {
        if (user) {
            fetchSessions();
        } else {
            // User logged out - clear state
            setMessages([]);
            setSessions([]);
            setCurrentSessionId(null);
        }
    }, [user, fetchSessions]);

    return (
        <ChatContext.Provider value={{
            messages, sessions, currentSessionId, isLoading, error,
            fetchSessions, selectSession, createNewSession, deleteSession,
            sendMessage, clearMessages
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
