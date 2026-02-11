# KnowBot 3.0 Frontend

The frontend for KnowBot 3.0 is a high-performance **Next.js 15** application designed with a futuristic "Cybernetic" aesthetic. It connects to the Django backend to provide a seamless RAG experience.

---

## 🚀 Features

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4, Framer Motion
- **State Management**: React Context API
- **Authentication**: JWT-based auth with auto-refresh mechanism
- **Design**: Glassmorphism, custom SVG animations, and responsive layouts

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ☁️ Deployment on Vercel

1. **Commit your changes**: Ensure your latest code is pushed to GitHub.
2. **Import Project**: Go to [Vercel](https://vercel.com/) and import your `frontend` directory.
3. **Environment Variables**:
   Add the following environment variable in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://knowbot-backend-production.up.railway.app`).
4. **Deploy**: Click "Deploy" and wait for the build to complete.

---

## 📂 Key Directories

- `src/app/`: App Router pages and layouts.
- `src/components/`: Reusable UI components (Sidebar, ChatBubble, etc.).
- `src/context/`: Global state (Auth, Chat).
- `src/lib/`: API utilities and types.

For a deep dive into the architecture, check out [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md).
