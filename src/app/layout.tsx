import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scorecard Archive",
  description: "A searchable archive of hand-scored baseball games.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-black/10 dark:border-white/10">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold tracking-tight">
              Scorecard Archive
            </a>
            <nav className="flex gap-4 text-sm text-black/60 dark:text-white/60">
              <a href="/" className="hover:text-black dark:hover:text-white">
                Summary
              </a>
              <a href="/games" className="hover:text-black dark:hover:text-white">
                All Games
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-black/10 dark:border-white/10 py-6 text-center text-xs text-black/40 dark:text-white/40">
          Hand-scored at the ballpark. Game data via MLB Stats API.
        </footer>
      </body>
    </html>
  );
}
