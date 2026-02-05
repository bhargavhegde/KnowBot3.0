# Knowbot 2.0 Frontend Architecture Guide

This document provides a high-level and low-level overview of the Knowbot 2.0 frontend, explaining how features are implemented and where they live in the codebase.

---

## 🏗 High-Level Architecture

The Knowbot 2.0 frontend is a modern, high-performance Single Page Application (SPA) designed with a "premium sci-fi" aesthetic. It interfaces with a Django-based RAG (Retrieval-Augmented Generation) backend.

### Core Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Runtime**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Context API
- **Data Fetching**: Axios with custom interceptors

---

## 🔍 Low-Level "Full Course" Flow

### 1. Initialization & Bootstrapping
When a user visits the site, the execution flow is as follows:
1.  **`src/app/layout.tsx`**: The root layout initializes the `AuthProvider` and `ChatProvider`.
2.  **`src/context/AuthContext.tsx`**: Checks `localStorage` for JWT tokens. If found, it attempts to fetch the user's profile (`/auth/me/`).
3.  **`src/app/page.tsx`**: The main entry point. It checks for authentication. If authenticated, it triggers a 2.5-second "boot sequence" visual using `BrainLoader` while pre-fetching data.

### 2. The Chat Lifecycle
The core interaction loop follows these steps:
1.  **Input**: User types in `ChatContainer.tsx`.
2.  **Action**: `sendMessage(content)` is triggered in `ChatContext.tsx`.
3.  **Optimistic Update**: The message is immediately added to the local `messages` state with a temporary ID.
4.  **Backend Call**: `apiService.sendMessage` (in `src/lib/api.ts`) sends the request to the Django `/api/chat/` endpoint.
5.  **Streaming & Response**: While waiting, the UI shows a "Thinking" animation. Once the response arrives (including `citations`), the message is updated in the state.
6.  **Rendering**: `MessageBubble.tsx` uses `ReactMarkdown` to render the response and identifies citations.

### 3. Authentication & Security
- **JWT Interceptors**: `src/lib/api.ts` contains an Axios interceptor that attaches the `Authorization: Bearer <token>` header to every request.
- **Auto-Refresh**: If a request returns a `401 Unauthorized`, the interceptor automatically calls the refresh token endpoint, updates the local storage, and retries the original request without user interruption.

---

## 🗺 Codebase Map

### 📁 `src/app/` (Routing & Layouts)
- `layout.tsx`: Global providers and base HTML structure.
- `page.tsx`: The main chat interface.
- `login/page.tsx` & `register/page.tsx`: Authentication pages.
- `globals.css`: Custom CSS animations (Aurora background, glassmorphism).

### 📁 `src/components/` (UI Components)
- `Sidebar.tsx`: Session list, profile management, and **File Upload** zone.
- `ChatContainer.tsx`: Scrollable message area and the primary input textarea.
- `MessageBubble.tsx`: Renders individual AI/User messages, Markdown, and Citations.
- `BrainHologram.tsx` / `BrainLoader.tsx`: High-end SVG/CSS animations for the sci-fi aesthetic.
- `CyberBrainIcon.tsx`: Custom SVG components.

### 📁 `src/context/` (State Management)
- `AuthContext.tsx`: Tracks user login status, tokens, and registration.
- `ChatContext.tsx`: The central hub for chat history, sessions, and active session state.

### 📁 `src/lib/` (Utilities & API)
- `api.ts`: **The Source of Truth for Backend Interaction**. Defines all axios endpoints and type interfaces for `Message`, `Session`, and `Document`.

### 📁 `src/hooks/` (Custom Hooks)
- `useSpeech.ts`: Encapsulates the Web Speech API to provide the "Listen" (TTS) functionality for AI responses.

---

## 🎨 Design System & Aesthetics
- **Color Palette**: Deep slates (`#0f172a`), Indigo gradients, and Cyan accents (`#22d3ee`).
- **Glassmorphism**: Heavy use of `backdrop-blur-xl` and semi-transparent borders to create a layered "heads-up display" look.
- **Animations**: Entrance animations (fade-up) for messages and smooth transitions for the sidebar.

---

## 🚀 How to Add New Features
1.  **New API Endpoint?** Add the interface and method to `src/lib/api.ts`.
2.  **New UI Element?** Create a component in `src/components/` using Tailwind logic.
3.  **New Global State?** Keep it in `ChatContext` if it relates to the conversation, or create a new Context in `src/context/`.
