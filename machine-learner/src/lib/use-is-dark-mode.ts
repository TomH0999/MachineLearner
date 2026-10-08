import { useSyncExternalStore } from "react";

/** Hook client : à importer uniquement depuis des Client Components (jamais depuis le graphe serveur). */
function subscribe(onChange: () => void): () => void {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
}

function getSnapshot(): boolean {
    return document.documentElement.classList.contains("dark");
}

function getServerSnapshot(): boolean {
    return false;
}

/** Suit la classe `dark` de <html> (false au rendu serveur). */
export function useIsDarkMode(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}