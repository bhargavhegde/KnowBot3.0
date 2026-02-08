import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
                    localStorage.setItem('access_token', res.data.access);
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    if (typeof window !== 'undefined') window.location.href = '/login';
                }
            } else {
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export interface User {
    id: number;
    username: string;
    email: string;
}

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

export interface Message {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    citations: Citation[];
    steps?: string[]; // Optional: For displaying thinking process
    suggested_action?: 'web_search'; // Optional: Trigger UI buttons
    suggestions?: string[]; // Optional: Follow-up question suggestions
    created_at: string;
}

export interface Citation {
    content: string;
    metadata: {
        source: string;
        page?: number;
        [key: string]: any;
    };
}

export interface ChatSession {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    messages?: Message[];
}



// API Methods
export const apiService = {
    // Auth
    login: (credentials: any) => api.post('/token/', credentials),
    register: (data: any) => api.post('/auth/register/', data),
    getMe: () => api.get<User>('/auth/me/'),

    // Documents
    getDocuments: () => api.get<Document[]>('/documents/'),
    uploadDocument: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<Document>('/documents/upload/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    deleteDocument: (id: number) => api.delete(`/documents/${id}/`),
    getDocumentStatus: (id: number) => api.get(`/documents/${id}/status/`),
    previewDocument: (id: number) => api.get(`/documents/${id}/preview/`, { responseType: 'blob' }),
    resetKnowledge: () => api.post('/documents/reset/'),

    // Chat
    getSessions: () => api.get<ChatSession[]>('/sessions/'),
    getSession: (id: number) => api.get<ChatSession>(`/sessions/${id}/`),
    createSession: (title: string = 'New Chat') => api.post<ChatSession>('/sessions/', { title }),
    deleteSession: (id: number) => api.delete(`/sessions/${id}/`),
    deleteAllSessions: () => api.delete('/sessions/delete_all/'),
    getMessages: (sessionId: number) => api.get<Message[]>(`/sessions/${sessionId}/messages/`),
    clearMessages: (sessionId: number) => api.delete(`/sessions/${sessionId}/clear/`),

    sendMessage: (messageText: string, sessionId?: number) =>
        api.post<{
            response: string;
            session_id: number;
            citations: Citation[];
            steps?: string[];
            suggested_action?: 'web_search';
            suggestions?: string[];
        }>('/chat/', {
            message: messageText,
            session_id: sessionId,
        }),

    getInitialSuggestions: () => api.get<{ suggestions: string[] }>('/chat/suggestions/'),


};

export default api;
