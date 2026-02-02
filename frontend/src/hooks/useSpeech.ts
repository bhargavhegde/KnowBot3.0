/**
 * useSpeech - Text-to-Speech Hook for KnowBot 2.0
 * 
 * Provides mechanical/robotic voice synthesis using Web Speech API.
 * Configured with low pitch and adjusted rate for a cyber-brain feel.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechOptions {
    pitch?: number;      // 0-2, default 0.8 for robotic feel
    rate?: number;       // 0.1-10, default 0.9 for clarity
    volume?: number;     // 0-1, default 1
    voiceName?: string;  // Preferred voice name (will try to match)
}

interface UseSpeechReturn {
    speak: (text: string, options?: SpeechOptions) => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    isSpeaking: boolean;
    isPaused: boolean;
    isSupported: boolean;
    availableVoices: SpeechSynthesisVoice[];
}

// Default mechanical voice settings
const DEFAULT_OPTIONS: SpeechOptions = {
    pitch: 0.8,      // Lower pitch for robotic effect
    rate: 0.95,      // Slightly slower for clarity
    volume: 1.0,
};

export function useSpeech(): UseSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Check if speech synthesis is supported
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Load available voices
    useEffect(() => {
        if (!isSupported) return;

        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
        };

        // Voices may load asynchronously
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [isSupported]);

    // Select the best voice for a mechanical feel
    const selectVoice = useCallback((preferredName?: string): SpeechSynthesisVoice | null => {
        if (availableVoices.length === 0) return null;

        // If a preferred voice is specified, try to find it
        if (preferredName) {
            const preferred = availableVoices.find(v =>
                v.name.toLowerCase().includes(preferredName.toLowerCase())
            );
            if (preferred) return preferred;
        }

        // Preference order for mechanical-sounding voices
        const preferenceOrder = [
            // Google voices tend to sound more synthetic
            'Google US English',
            'Google UK English Male',
            'Microsoft David',
            'Microsoft Mark',
            // Fallback to any English voice
            'en-US',
            'en-GB',
            'en'
        ];

        for (const pref of preferenceOrder) {
            const match = availableVoices.find(v =>
                v.name.includes(pref) || v.lang.startsWith(pref)
            );
            if (match) return match;
        }

        // Last resort: first available voice
        return availableVoices[0];
    }, [availableVoices]);

    // Clean text for speech (remove markdown, special chars)
    const cleanTextForSpeech = (text: string): string => {
        return text
            // Remove markdown formatting
            .replace(/\*\*([^*]+)\*\*/g, '$1')  // Bold
            .replace(/\*([^*]+)\*/g, '$1')      // Italic
            .replace(/`([^`]+)`/g, '$1')        // Inline code
            .replace(/```[\s\S]*?```/g, '')     // Code blocks
            .replace(/#{1,6}\s/g, '')           // Headings
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links
            // Clean up whitespace
            .replace(/\n+/g, '. ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Speak text
    const speak = useCallback((text: string, options?: SpeechOptions) => {
        if (!isSupported) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Stop any current speech
        window.speechSynthesis.cancel();

        const cleanedText = cleanTextForSpeech(text);
        if (!cleanedText) return;

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utteranceRef.current = utterance;

        // Apply options with defaults
        const opts = { ...DEFAULT_OPTIONS, ...options };
        utterance.pitch = opts.pitch!;
        utterance.rate = opts.rate!;
        utterance.volume = opts.volume!;

        // Select voice
        const voice = selectVoice(opts.voiceName);
        if (voice) {
            utterance.voice = voice;
        }

        // Event handlers
        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onpause = () => {
            setIsPaused(true);
        };

        utterance.onresume = () => {
            setIsPaused(false);
        };

        // Start speaking
        window.speechSynthesis.speak(utterance);
    }, [isSupported, selectVoice]);

    // Stop speaking
    const stop = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    }, [isSupported]);

    // Pause speaking
    const pause = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.pause();
        setIsPaused(true);
    }, [isSupported]);

    // Resume speaking
    const resume = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.resume();
        setIsPaused(false);
    }, [isSupported]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isSupported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSupported]);

    return {
        speak,
        stop,
        pause,
        resume,
        isSpeaking,
        isPaused,
        isSupported,
        availableVoices,
    };
}

export default useSpeech;
