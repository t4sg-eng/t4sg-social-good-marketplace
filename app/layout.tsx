import { ModeToggle } from "@/app/(components-navbar)/mode-toggle";
import { Toaster } from "@/components/ui/toaster";
import { Bricolage_Grotesque, IBM_Plex_Mono, Public_Sans } from "next/font/google";
import AuthStatus from "./(components-navbar)/auth-status";
import Navbar from "./(components-navbar)/navbar";
import "./globals.css";
import { Providers } from "./providers";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Social Good Marketplace",
  description:
    "An open queue of real nonprofit tech projects, worked by student engineers. Browse open projects and take one on.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      {/* Hydration warning suppressed because of next-themes https://github.com/pacocoursey/next-themes */}
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
              <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 sm:px-8">
                <Navbar />
                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                  <ModeToggle />
                  <AuthStatus />
                </div>
              </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">{children}</main>

            <footer className="border-t border-border">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Harvard Computer Society · Tech for Social Good
                </p>
                <p className="font-mono text-xs text-muted-foreground">Built open-source · 2025–2026</p>
              </div>
            </footer>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
