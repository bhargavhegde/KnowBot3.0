/**
 * Custom hook for chat functionality
 */

'use client';

import { useState, useCallback } from 'react';
import { apiService, Message } from '@/lib/api';

interface UseChatOptions {
    sessionId?: number;
    onSessionCreated?: (sessionId: number) => void;
}

interface UseChatReturn {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    sessionId: number | null;
    sendChatMessage: (content: string) => Promise<void>;
    clearMessages: () => void;
    setMessages: (messages: Message[]) => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<number | null>(options.sessionId || null);

    const sendChatMessage = useCallback(async (content: string) => {
        setIsLoading(true);
        setError(null);

        // Optimistically add user message
        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content,
            citations: [],
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const resp = await apiService.sendMessage(content, sessionId || undefined);
            const response = resp.data;

            // Update session ID if this is a new session
            if (!sessionId && response.session_id) {
                setSessionId(response.session_id);
                options.onSessionCreated?.(response.session_id);
            }

            // Add assistant message
            const assistantMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.response,
                citations: response.citations,
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err?.message || 'Failed to send message';
            setError(errorMessage);

            // Add error message to chat
            const errorMsg: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: `⚠️ Error: ${errorMessage}`,
                citations: [],
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, options]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setSessionId(null);
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sessionId,
        sendChatMessage,
        clearMessages,
        setMessages,
    };
}
