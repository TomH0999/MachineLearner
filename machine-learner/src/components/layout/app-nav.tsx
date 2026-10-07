"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Layers,
  LayoutDashboard,
  Monitor,
  Moon,
  Network,
  Route,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, ROUTES, getActiveNavKey, type NavKey } from "@/lib/routes";
import { applyTheme, getStoredTheme, type ThemePreference } from "@/lib/theme";

const NAV_ICONS: Record<NavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  tree: Network,
  review: Layers,
};

const THEME_OPTIONS = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
] as const satisfies readonly { value: ThemePreference; label: string; icon: LucideIcon }[];

function isThemePreference(value: string): value is ThemePreference {
  return THEME_OPTIONS.some((option) => option.value === value);
}

/**
 * Navigation principale. `usePathname` suspend sur les routes dynamiques avec
 * cacheComponents : à rendre sous <Suspense fallback={<AppNavFallback />}>.
 */
export function AppNav() {
  const pathname = usePathname();
  return <AppNavView activeKey={getActiveNavKey(pathname)} />;
}

/** Fallback du Suspense : même rendu que AppNav, sans lien actif. */
export function AppNavFallback() {
  return <AppNavView activeKey={null} />;
}

function AppNavView({ activeKey }: { activeKey: NavKey | null }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center px-5">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2 font-semibold">
            <Route className="size-5 text-primary" aria-hidden="true" />
            EngiPath
          </Link>
        </div>
        <nav aria-label="Navigation principale" className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.key];
            const isActive = item.key === activeKey;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <ThemeToggle align="start" />
        </div>
      </aside>

      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="grid h-16 grid-cols-4">
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.key];
            const isActive = item.key === activeKey;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-primary hover:text-primary",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.shortLabel}
              </Link>
            );
          })}
          <div className="flex items-center justify-center">
            <ThemeToggle align="end" />
          </div>
        </div>
      </nav>
    </>
  );
}

function ThemeToggle({ align }: { align: "start" | "end" }) {
  // Le contenu du menu n'est monté qu'à l'ouverture : lire localStorage ici ne crée pas de décalage d'hydratation.
  const [preference, setPreference] = useState<ThemePreference>(() =>
    typeof window === "undefined" ? "system" : getStoredTheme(),
  );

  // En dev, le remontage du Strict Mode retire la classe `dark` posée par le script inline : on la réapplique avant l'affichage.
  useLayoutEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    // Deux ThemeToggle sont montés (desktop + mobile) : on relit la préférence stockée
    // pour ne pas écraser un choix fait depuis l'autre instance.
    const onChange = () => {
      if (getStoredTheme() === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) setPreference(getStoredTheme());
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Changer de thème">
          <Sun className="dark:hidden" aria-hidden="true" />
          <Moon className="hidden dark:block" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align={align}>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => {
            if (!isThemePreference(value)) return;
            setPreference(value);
            applyTheme(value);
          }}
        >
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon aria-hidden="true" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
