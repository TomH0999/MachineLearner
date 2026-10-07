export const ROUTES = {
  dashboard: "/",
  tree: "/tree",
  review: "/review",
  login: "/login",
  node: (nodeId: string) => `/nodes/${encodeURIComponent(nodeId)}`,
  quiz: (nodeId: string) => `/nodes/${encodeURIComponent(nodeId)}/quiz`,
} as const;

export type NavKey = "dashboard" | "tree" | "review";

export interface NavItem {
  key: NavKey;
  href: string;
  label: string; // libellé desktop
  shortLabel: string; // libellé mobile
  activePrefixes: readonly string[]; // "/" = correspondance exacte uniquement
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: "dashboard", href: ROUTES.dashboard, label: "Tableau de bord", shortLabel: "Accueil", activePrefixes: ["/"] },
  { key: "tree", href: ROUTES.tree, label: "Arbre de compétences", shortLabel: "Arbre", activePrefixes: ["/tree", "/nodes"] },
  { key: "review", href: ROUTES.review, label: "Révisions", shortLabel: "Révisions", activePrefixes: ["/review"] },
];

function matchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix === "/") return pathname === "/";
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Entrée de navigation à surligner pour `pathname`, ou null si aucune ne correspond. */
export function getActiveNavKey(pathname: string): NavKey | null {
  const item = NAV_ITEMS.find(({ activePrefixes }) =>
    activePrefixes.some((prefix) => matchesPrefix(pathname, prefix)),
  );
  return item?.key ?? null;
}
