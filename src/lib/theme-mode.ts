// User-controlled light/dark/system preference.
// The CHOICE ("light" | "dark" | "system") is persisted client-side (localStorage
// + a 1-year cookie so the server can render the right mode with no flash). The
// RESOLVED concrete mode ("light" | "dark") is written to html[data-mode], which
// the cricket theme CSS keys off. Admin chooses the team theme; the visitor
// chooses the mode — the two combine without conflict.

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedMode = "light" | "dark";

export const THEME_COOKIE = "nova-mode";
export const THEME_STORAGE_KEY = "nova-mode";

export function isThemeChoice(v: unknown): v is ThemeChoice {
  return v === "light" || v === "dark" || v === "system";
}

// Resolve a choice to a concrete mode given a system-prefers-dark flag.
export function resolveMode(choice: ThemeChoice, systemPrefersDark: boolean): ResolvedMode {
  if (choice === "system") return systemPrefersDark ? "dark" : "light";
  return choice;
}

// Inline script injected at the top of <body>, runs before content paints to set
// html[data-mode] from the stored choice (or system) — kills FOUC. Reads
// localStorage first (most up to date), falls back to the cookie, then system.
// `fallback` is the server's best guess (admin default mode) used only when
// nothing is stored and matchMedia is unavailable.
export function themeModeInitScript(fallback: ResolvedMode): string {
  return `(function(){try{` +
    `var c=null;try{c=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});}catch(e){}` +
    `if(!c){var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);if(m)c=decodeURIComponent(m[1]);}` +
    `if(c!=='light'&&c!=='dark'&&c!=='system')c='system';` +
    `var sysDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;` +
    `var mode=c==='system'?(sysDark?'dark':'light'):c;` +
    `document.documentElement.setAttribute('data-mode',mode||${JSON.stringify(fallback)});` +
    `}catch(e){document.documentElement.setAttribute('data-mode',${JSON.stringify(fallback)});}})();`;
}
