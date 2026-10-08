/**
 * Thème clair / sombre sans next-themes : la classe `dark` sur <html> pilote le
 * `@custom-variant dark` de shadcn. Module neutre (ni "use client" ni "server-only") :
 * `themeInitScript` est injecté par le layout racine, les fonctions servent côté client.
 */

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "engipath-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Script inline exécuté dans <head> avant le premier rendu (évite le flash de thème).
 * Une valeur absente, "system" ou invalide suit la préférence du système.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var d=t==="dark"||(t!=="light"&&window.matchMedia(${JSON.stringify(DARK_QUERY)}).matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(_){}})()`;

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** Client uniquement : préférence enregistrée, "system" si absente ou invalide. */
export function getStoredTheme(): ThemePreference {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(value) ? value : "system";
  } catch {
    return "system";
  }
}

/** Client uniquement : enregistre la préférence puis l'applique à <html>. */
export function applyTheme(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // localStorage indisponible (navigation privée, quota) : on applique quand même.
  }

  const isDark =
    preference === "dark" ||
    (preference === "system" && window.matchMedia(DARK_QUERY).matches);
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}
