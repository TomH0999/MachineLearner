"use client";

import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { markCourseViewed } from "@/app/(app)/nodes/[nodeId]/actions";
import { tabsListVariants } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRehydrateUiStore, useUiStore, type CourseSplit } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

type MobileTab = "video" | "sheet";

const MOBILE_TABS: readonly { value: MobileTab; label: string }[] = [
  { value: "video", label: "Vidéo" },
  { value: "sheet", label: "Fiche de cours" },
];

function isCourseSplit(value: string): value is CourseSplit {
  return value === "50-50" || value === "40-60";
}

/**
 * Espace de cours : vidéo + fiche côte à côte à partir de `lg` (ratio mémorisé), onglets en dessous.
 * `video` et `sheet` sont des slots rendus une seule fois : la fiche reste rendue côté serveur.
 */
export function CourseLayout({
  nodeId,
  shouldMarkViewed,
  video,
  sheet,
}: {
  nodeId: string;
  shouldMarkViewed: boolean;
  video: ReactNode;
  sheet: ReactNode;
}) {
  useRehydrateUiStore();
  const courseSplit = useUiStore((state) => state.courseSplit);
  const setCourseSplit = useUiStore((state) => state.setCourseSplit);
  const [mobileTab, setMobileTab] = useState<MobileTab>("video");
  const baseId = useId();
  const tabId = (tab: MobileTab) => `${baseId}-tab-${tab}`;
  const panelId = (tab: MobileTab) => `${baseId}-panel-${tab}`;

  // Appel de Server Action (aucun setState) : la consultation est enregistrée une fois le cours affiché.
  useEffect(() => {
    if (shouldMarkViewed) void markCourseViewed(nodeId).catch(() => undefined);
  }, [nodeId, shouldMarkViewed]);

  // Deux onglets : les flèches gauche/droite passent à l'autre (motif ARIA « tabs », focus itinérant).
  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next: MobileTab = mobileTab === "video" ? "sheet" : "video";
    setMobileTab(next);
    document.getElementById(tabId(next))?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden items-center justify-end gap-3 lg:flex">
        <span id={`${baseId}-split-label`} className="text-sm text-muted-foreground">
          Disposition
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          aria-labelledby={`${baseId}-split-label`}
          value={courseSplit}
          onValueChange={(value) => {
            if (isCourseSplit(value)) setCourseSplit(value); // "" = clic sur l'item actif : ignoré
          }}
        >
          <ToggleGroupItem value="50-50" aria-label="Vidéo et fiche à parts égales">
            50/50
          </ToggleGroupItem>
          <ToggleGroupItem value="40-60" aria-label="Fiche plus large">
            40/60
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div
        role="tablist"
        aria-label="Contenu du cours"
        onKeyDown={handleTabKeyDown}
        className={cn(tabsListVariants(), "h-9 w-full lg:hidden")}
      >
        {MOBILE_TABS.map(({ value, label }) => {
          const selected = mobileTab === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              id={tabId(value)}
              aria-selected={selected}
              aria-controls={panelId(value)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setMobileTab(value)}
              className={cn(
                "inline-flex h-full flex-1 items-center justify-center rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-muted-foreground dark:hover:text-foreground",
                selected && "bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30 dark:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "grid gap-6 lg:items-start",
          courseSplit === "50-50" ? "lg:grid-cols-2" : "lg:grid-cols-[2fr_3fr]",
        )}
      >
        <section
          role="tabpanel"
          id={panelId("video")}
          aria-labelledby={tabId("video")}
          className={cn(mobileTab === "video" ? "block" : "hidden", "min-w-0 lg:sticky lg:top-8 lg:block")}
        >
          {video}
        </section>
        <section
          role="tabpanel"
          id={panelId("sheet")}
          aria-labelledby={tabId("sheet")}
          className={cn(mobileTab === "sheet" ? "block" : "hidden", "min-w-0 lg:block")}
        >
          {sheet}
        </section>
      </div>
    </div>
  );
}
