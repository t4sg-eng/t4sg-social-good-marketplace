import { ModeToggle } from "@/app/(components-navbar)/mode-toggle";
import { Toaster } from "@/components/ui/toaster";
import { Caveat, Fraunces, Inter } from "next/font/google";
import AuthStatus from "./(components-navbar)/auth-status";
import Navbar from "./(components-navbar)/navbar";
import "./globals.css";
import { Providers } from "./providers";

const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const script = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-script",
  display: "swap",
});

export const metadata = {
  title: "Social Good Marketplace — Studio",
  description:
    "A gallery of real nonprofit tech projects, worked by student engineers. Browse the collection and take one on.",
};

// Marquee phrases — the meli-style ticker under the masthead.
const ticker = [
  "real projects",
  "nonprofit-backed",
  "student-built",
  "open source",
  "ships to production",
  "no busywork",
];

// Applied before paint so /lab color overrides never flash the default palette.
const themeScript = `(function(){try{var t=JSON.parse(localStorage.getItem("studio-theme")||"{}");var r=document.documentElement;for(var k in t){r.style.setProperty(k,t[k]);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${script.variable}`}
    >
      {/* Hydration warning suppressed because of next-themes https://github.com/pacocoursey/next-themes */}
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-border bg-background">
              <div className="mx-auto flex h-[70px] w-full max-w-[1180px] items-center gap-6 px-5 sm:px-8">
                <Navbar />
                <div className="ml-auto flex items-center gap-2">
                  <ModeToggle />
                  <AuthStatus />
                </div>
              </div>
            </header>

            {/* Ticker */}
            <div className="overflow-hidden border-b border-border bg-card">
              <div className="marquee py-2.5" aria-hidden="true">
                {[0, 1].map((dup) => (
                  <div key={dup} className="flex items-center">
                    {ticker.map((phrase) => (
                      <span key={phrase} className="flex items-center">
                        <span className="px-6 font-serif text-sm italic text-foreground/70">
                          {phrase}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-peri" />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-16 sm:px-8">
              {children}
            </main>

            <footer className="mt-8 border-t border-border">
              <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <p className="font-serif text-base italic text-foreground">
                  Tech for Social Good
                </p>
                <p className="caps">
                  Harvard Computer Society · Built open-source, 2025–26
                </p>
              </div>
            </footer>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
