import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "AI Interview Mentor Pro – Next-Gen Interview Preparation",
  description:
    "Ace coding, technical, HR, and behavioral interviews with AI-powered mock sessions, real-time voice analysis, eye-contact tracking, and detailed performance reports.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#020617",
  openGraph: {
    title: "AI Interview Mentor Pro",
    description: "Your personal AI-powered interview coach — voice-first, resume-aware, and 100% private.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300`}
        style={{ fontFamily: "var(--font-jakarta), var(--font-inter), system-ui, sans-serif" }}
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
