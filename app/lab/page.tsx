"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

/* ── color math ─────────────────────────────────────────────── */

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const mm = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) =>
    Math.round(clamp((v + mm) * 255, 0, 255))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hslStringToHex(str: string): string {
  const parts = str.trim().split(/\s+/);
  const h = parseFloat(parts[0] ?? "0");
  const s = parseFloat((parts[1] ?? "0").replace("%", ""));
  const l = parseFloat((parts[2] ?? "0").replace("%", ""));
  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) return "#000000";
  return hslToHex(h, s, l);
}

function hexToHslString(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `${+h.toFixed(1)} ${+s.toFixed(1)}% ${+l.toFixed(1)}%`;
}

/* ── editable tokens ────────────────────────────────────────── */

const GROUPS: { group: string; tokens: { key: string; label: string }[] }[] = [
  {
    group: "Base",
    tokens: [
      { key: "--background", label: "Background" },
      { key: "--foreground", label: "Ink" },
      { key: "--card", label: "Card" },
      { key: "--muted", label: "Muted" },
      { key: "--muted-foreground", label: "Muted ink" },
      { key: "--border", label: "Hairline" },
    ],
  },
  {
    group: "Brand",
    tokens: [
      { key: "--primary", label: "Primary" },
      { key: "--primary-foreground", label: "On primary" },
    ],
  },
  {
    group: "T4SG accents",
    tokens: [
      { key: "--mint", label: "Mint" },
      { key: "--sky", label: "Sky" },
      { key: "--peri", label: "Periwinkle" },
    ],
  },
  {
    group: "Status",
    tokens: [
      { key: "--success", label: "Approved" },
      { key: "--warning", label: "Review" },
      { key: "--danger", label: "Rejected" },
    ],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.tokens.map((t) => t.key));

// Presets are authored in hex; converted to HSL tokens on apply.
const PRESETS: { name: string; note: string; colors: Record<string, string> }[] =
  [
    {
      name: "Studio",
      note: "warm paper · T4SG blue · pastel accents",
      colors: {
        "--background": "#F3F1EA",
        "--foreground": "#20201C",
        "--card": "#FCFAF4",
        "--muted": "#EAE4D6",
        "--muted-foreground": "#6F685A",
        "--border": "#DED7C8",
        "--primary": "#33629B",
        "--primary-foreground": "#FBFAF5",
        "--mint": "#86C6A0",
        "--sky": "#8AC0E8",
        "--peri": "#97A4E4",
        "--success": "#2F8F63",
        "--warning": "#9A5A17",
        "--danger": "#B23A30",
      },
    },
    {
      name: "Pastel",
      note: "cool mint-white, the member-card palette",
      colors: {
        "--background": "#EEF4F1",
        "--foreground": "#182420",
        "--card": "#F8FBF9",
        "--muted": "#DDEAE4",
        "--muted-foreground": "#5C6B65",
        "--border": "#CFE0D8",
        "--primary": "#3E7AC0",
        "--primary-foreground": "#FFFFFF",
        "--mint": "#7FC8A0",
        "--sky": "#8FC9EE",
        "--peri": "#98A6EA",
        "--success": "#2F9E6E",
        "--warning": "#C08432",
        "--danger": "#C24238",
      },
    },
    {
      name: "Gallery",
      note: "cream & terracotta, meli / HOVN",
      colors: {
        "--background": "#F1ECE0",
        "--foreground": "#211C16",
        "--card": "#FBF7EE",
        "--muted": "#E6DCC8",
        "--muted-foreground": "#726855",
        "--border": "#DBCFB8",
        "--primary": "#B0532B",
        "--primary-foreground": "#FBF7EE",
        "--mint": "#9CB79A",
        "--sky": "#A9C2CE",
        "--peri": "#B3A7C9",
        "--success": "#5E7F4E",
        "--warning": "#B0721E",
        "--danger": "#B23A30",
      },
    },
    {
      name: "Periwinkle",
      note: "cool gray & indigo",
      colors: {
        "--background": "#F3F4F8",
        "--foreground": "#1B1D2A",
        "--card": "#FBFBFE",
        "--muted": "#E4E6F0",
        "--muted-foreground": "#5F6377",
        "--border": "#D7DAE8",
        "--primary": "#5460C4",
        "--primary-foreground": "#FFFFFF",
        "--mint": "#88CBB4",
        "--sky": "#8FB6EE",
        "--peri": "#8D8FE6",
        "--success": "#2F8F73",
        "--warning": "#A9701F",
        "--danger": "#C0413B",
      },
    },
  ];

const STORAGE_KEY = "studio-theme";

export default function ColorLab() {
  const { setTheme, resolvedTheme } = useTheme();
  const [colors, setColors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  // Initialise inputs from any saved overrides, else the live computed tokens.
  useEffect(() => {
    const root = document.documentElement;
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
          string,
          string
        >;
      } catch {
        return {};
      }
    })();
    const next: Record<string, string> = {};
    for (const key of ALL_KEYS) {
      const hslStr =
        saved[key] ?? getComputedStyle(root).getPropertyValue(key).trim();
      next[key] = hslStr ? hslStringToHex(hslStr) : "#000000";
    }
    setColors(next);
    setMounted(true);
    // resolvedTheme in deps so re-reading picks up mode-specific defaults
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  function setToken(key: string, hex: string) {
    setColors((c) => ({ ...c, [key]: hex }));
    document.documentElement.style.setProperty(key, hexToHslString(hex));
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    const next = { ...colors };
    for (const [key, hex] of Object.entries(preset.colors)) {
      next[key] = hex;
      document.documentElement.style.setProperty(key, hexToHslString(hex));
    }
    setColors(next);
  }

  function save() {
    const map: Record<string, string> = {};
    for (const key of ALL_KEYS) {
      const hex = colors[key];
      if (hex) map[key] = hexToHslString(hex);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    toast({
      title: "Palette applied everywhere",
      description: "Saved to this browser. Navigate the app to see it in place.",
    });
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    for (const key of ALL_KEYS)
      document.documentElement.style.removeProperty(key);
    // re-read defaults
    const root = document.documentElement;
    const next: Record<string, string> = {};
    for (const key of ALL_KEYS) {
      const hslStr = getComputedStyle(root).getPropertyValue(key).trim();
      next[key] = hslStr ? hslStringToHex(hslStr) : "#000000";
    }
    setColors(next);
    toast({ title: "Reset to defaults" });
  }

  const cssText = useMemo(() => {
    const lines: string[] = [];
    for (const k of ALL_KEYS) {
      const hex = colors[k];
      if (hex) lines.push(`  ${k}: ${hexToHslString(hex)};`);
    }
    return `:root {\n${lines.join("\n")}\n}`;
  }, [colors]);

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(cssText);
      toast({ title: "CSS copied", description: "Paste into app/globals.css." });
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  }

  if (!mounted) {
    return <p className="annot">Loading the lab…</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 border-b border-foreground/80 pb-5">
        <p className="caps">Color lab</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Try the palette{" "}
          <span className="font-script text-[1.15em] text-primary">
            live.
          </span>
        </h1>
        <p className="annot max-w-xl">
          Every color in the app is a token. Adjust one and the whole interface
          updates as you go. Start from a preset, fine-tune, then apply it
          across the site or copy the CSS.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_1fr]">
        {/* Controls */}
        <div className="flex flex-col gap-7">
          {/* Presets */}
          <div className="flex flex-col gap-3">
            <p className="caps">Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="flex flex-col gap-2 border border-border bg-card p-3 text-left transition-colors hover:border-foreground/40"
                >
                  <span className="flex gap-1">
                    {["--primary", "--mint", "--sky", "--peri"].map((k) => (
                      <span
                        key={k}
                        className="h-4 w-4 rounded-full border border-border"
                        style={{ background: p.colors[k] }}
                      />
                    ))}
                  </span>
                  <span className="font-serif text-sm font-medium text-foreground">
                    {p.name}
                  </span>
                  <span className="text-[0.7rem] leading-tight text-muted-foreground">
                    {p.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Token pickers */}
          {GROUPS.map((g) => (
            <div key={g.group} className="flex flex-col gap-2.5">
              <p className="caps">{g.group}</p>
              {g.tokens.map((t) => (
                <label
                  key={t.key}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-foreground">{t.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {(colors[t.key] ?? "").toUpperCase()}
                    </span>
                    <input
                      type="color"
                      value={colors[t.key] ?? "#000000"}
                      onChange={(e) => setToken(t.key, e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded-sm border border-border bg-transparent"
                      aria-label={t.label}
                    />
                  </span>
                </label>
              ))}
            </div>
          ))}

          <div className="flex flex-col gap-2 border-t border-border pt-5">
            <Button onClick={save}>Apply across the site</Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => void copyCss()}
              >
                Copy CSS
              </Button>
              <Button variant="outline" className="flex-1" onClick={reset}>
                Reset
              </Button>
            </div>
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="mt-1 text-left text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Previewing {resolvedTheme} mode — switch to{" "}
              {resolvedTheme === "dark" ? "light" : "dark"}
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div className="flex flex-col gap-8">
          <p className="caps">Live preview</p>

          {/* Gradient swatch */}
          <div className="t4sg-gradient dot-field flex h-24 items-end overflow-hidden rounded-sm p-3">
            <span className="caps text-foreground/70">mint → sky → periwinkle</span>
          </div>

          {/* Hero snippet */}
          <div>
            <p className="caps">Harvard Computer Society</p>
            <h2 className="mt-2 font-serif text-4xl font-medium text-foreground">
              A marketplace for{" "}
              <span className="font-script text-[1.15em] text-primary">
                doing good.
              </span>
            </h2>
          </div>

          {/* Buttons & badges */}
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> Approved
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> Review
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-danger">
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> Rejected
            </span>
          </div>

          {/* Gallery tiles */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              { no: "01", title: "Rebuild the donor dashboard", org: "Food Bank Boston" },
              { no: "02", title: "Volunteer shift scheduler", org: "City Year" },
            ].map((item) => (
              <div key={item.no} className="tile">
                <div className="t4sg-gradient relative flex aspect-[5/3] items-center justify-center overflow-hidden border-b border-border">
                  <div className="dot-field absolute inset-0 opacity-60" />
                  <span className="relative font-serif text-5xl font-medium text-foreground/85">
                    {item.no}
                  </span>
                </div>
                <div className="px-4 py-4">
                  <h3 className="font-serif text-base font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="caps mt-1">{item.org}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CSS output */}
          <div className="flex flex-col gap-2">
            <p className="caps">Current tokens</p>
            <pre className="overflow-x-auto rounded-sm border border-border bg-card p-4 font-mono text-xs text-muted-foreground">
              {cssText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
