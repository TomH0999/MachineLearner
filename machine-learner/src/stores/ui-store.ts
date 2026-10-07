"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DOMAIN_ORDER, type Domain } from "@/types/domain";

export type CourseSplit = "50-50" | "40-60"; // utilisé à l'étape 15 (split-screen du cours)

interface UiState {
  selectedDomains: Domain[]; // vide = tous les domaines
  courseSplit: CourseSplit;
  setSelectedDomains: (domains: Domain[]) => void;
  clearDomains: () => void;
  setCourseSplit: (split: CourseSplit) => void;
}

type PersistedUiState = Pick<UiState, "selectedDomains" | "courseSplit">;

const DEFAULT_COURSE_SPLIT: CourseSplit = "50-50";

export function isDomain(value: unknown): value is Domain {
  return (DOMAIN_ORDER as readonly unknown[]).includes(value);
}

function isCourseSplit(value: unknown): value is CourseSplit {
  return value === "50-50" || value === "40-60";
}

/** Garde les domaines connus, sans doublons, dans l'ordre de DOMAIN_ORDER. */
function normalizeDomains(values: unknown): Domain[] {
  const selected = new Set<unknown>(Array.isArray(values) ? values : []);
  return DOMAIN_ORDER.filter((domain) => selected.has(domain));
}

/**
 * Préférences d'interface persistées dans localStorage (jamais la progression : la base fait foi).
 * `skipHydration` : le rendu serveur et le premier rendu client utilisent les valeurs par défaut ;
 * le localStorage n'est lu qu'après le montage, via useRehydrateUiStore.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      selectedDomains: [],
      courseSplit: DEFAULT_COURSE_SPLIT,
      setSelectedDomains: (domains) => set({ selectedDomains: normalizeDomains(domains) }),
      clearDomains: () => set({ selectedDomains: [] }),
      setCourseSplit: (split) => set({ courseSplit: split }),
    }),
    {
      name: "engipath-ui",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state): PersistedUiState => ({
        selectedDomains: state.selectedDomains,
        courseSplit: state.courseSplit,
      }),
      // Le localStorage est modifiable à la main : on n'en reprend que des valeurs valides.
      merge: (persisted, current) => {
        if (typeof persisted !== "object" || persisted === null) return current;
        const { selectedDomains, courseSplit } = persisted as Partial<Record<keyof PersistedUiState, unknown>>;
        return {
          ...current,
          selectedDomains: normalizeDomains(selectedDomains),
          courseSplit: isCourseSplit(courseSplit) ? courseSplit : DEFAULT_COURSE_SPLIT,
        };
      },
    },
  ),
);

/** À appeler dans chaque composant client racine qui lit le store : charge le localStorage après le montage. */
export function useRehydrateUiStore(): void {
  useEffect(() => {
    void useUiStore.persist.rehydrate();
  }, []);
}

/** Fonction pure : une sélection vide renvoie tous les éléments. */
export function filterByDomains<T extends { domain: Domain }>(items: readonly T[], selected: readonly Domain[]): T[] {
  if (selected.length === 0) return [...items];
  const wanted = new Set(selected);
  return items.filter((item) => wanted.has(item.domain));
}
