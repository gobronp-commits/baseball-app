import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dave Gobron's Scorecard Archive",
  description: "A searchable archive of hand-scored baseball games.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="bg-[var(--navy)] text-white border-b-4 border-[var(--accent)]">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <a href="/" className="flex items-center gap-2.5">
              <img src="/logos/111.svg" alt="" width={28} height={28} />
              <span className="font-heading text-lg sm:text-xl tracking-wide uppercase">
                Dave Gobron&apos;s Scorecard Archive
              </span>
            </a>
            <nav className="flex gap-5 text-sm text-white/70">
              <a href="/" className="hover:text-white transition-colors">
                Summary
              </a>
              <a href="/games" className="hover:text-white transition-colors">
                All Games
              </a>
              <a href="/notable-sightings" className="hover:text-white transition-colors">
                Notable Sightings
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
