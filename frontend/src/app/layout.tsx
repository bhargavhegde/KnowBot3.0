import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "KnowBot - Personal RAG Chatbot",
  description: "Your local & private personal knowledge assistant powered by AI",
  keywords: ["RAG", "chatbot", "AI", "LLM", "knowledge", "assistant"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-[#0f1117] text-[#e0e0e0]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
