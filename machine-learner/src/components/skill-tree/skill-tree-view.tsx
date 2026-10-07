"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle2, CircleDot, Lock, type LucideIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ROUTES } from "@/lib/routes";
import { topologicalOrder } from "@/lib/skill-tree/graph";
import { cn } from "@/lib/utils";
import { isDomain, useRehydrateUiStore, useUiStore } from "@/stores/ui-store";
import {
  DOMAIN_LABELS,
  DOMAIN_ORDER,
  STATUS_LABELS,
  type CalculatedNode,
  type Domain,
  type NodeStatus,
} from "@/types/domain";
import { SkillTreeFlow, getFlowKey } from "./skill-tree-flow";
import { DOMAIN_STYLES, STATUS_BADGE_CLASSES, formatScore } from "./styles";

const DESKTOP_QUERY = "(min-width: 768px)"; // breakpoint `md` de Tailwind

const STATUS_ICONS: Record<NodeStatus, LucideIcon> = {
  LOCKED: Lock,
  UNLOCKED: CircleDot,
  COMPLETED: CheckCircle2,
};

const STATUS_ICON_CLASSES: Record<NodeStatus, string> = {
  LOCKED: "text-status-locked",
  UNLOCKED: "text-status-unlocked",
  COMPLETED: "text-status-completed",
};

/** Snapshot serveur à `false` : le serveur et la première passe client rendent la version mobile/squelette. */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Graphe React Flow sur desktop (jamais monté sur mobile), accordéon par domaine sous 768 px. */
export function SkillTreeView({ nodes }: { nodes: CalculatedNode[] }) {
  useRehydrateUiStore();
  const selectedDomains = useUiStore((state) => state.selectedDomains);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <div className="space-y-4">
      <DomainFilter />
      <div className="hidden md:block">
        {isDesktop ? (
          <SkillTreeFlow
            key={`${getFlowKey(nodes)}|${selectedDomains.join(",")}`}
            nodes={nodes}
            highlightDomains={selectedDomains}
          />
        ) : (
          <Skeleton className="h-[520px] w-full rounded-xl" />
        )}
      </div>
      <div className="md:hidden">
        <SkillTreeAccordion nodes={nodes} domains={selectedDomains.length > 0 ? selectedDomains : DOMAIN_ORDER} />
      </div>
    </div>
  );
}

function DomainFilter() {
  const selectedDomains = useUiStore((state) => state.selectedDomains);
  const setSelectedDomains = useUiStore((state) => state.setSelectedDomains);
  const clearDomains = useUiStore((state) => state.clearDomains);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        aria-label="Filtrer par domaine"
        className="flex-wrap"
        value={selectedDomains}
        onValueChange={(values) => setSelectedDomains(values.filter(isDomain))}
      >
        {DOMAIN_ORDER.map((domain) => (
          <ToggleGroupItem
            key={domain}
            value={domain}
            aria-label={`Filtrer sur le domaine ${DOMAIN_LABELS[domain]}`}
          >
            <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOMAIN_STYLES[domain].dot)} />
            {DOMAIN_LABELS[domain]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {selectedDomains.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearDomains}>
          Tous les domaines
        </Button>
      )}
    </div>
  );
}

/** Structure indépendante du store au premier rendu : elle est aussi rendue côté serveur. */
function SkillTreeAccordion({ nodes, domains }: { nodes: CalculatedNode[]; domains: readonly Domain[] }) {
  const { nodesByDomain, titleById } = useMemo(() => {
    const byId = new Map(nodes.map((node) => [node.id, node]));
    // Ordre topologique calculé sur tout le graphe, puis regroupé : chaque domaine se lit dans l'ordre d'étude.
    const grouped = new Map<Domain, CalculatedNode[]>();
    for (const id of topologicalOrder(nodes)) {
      const node = byId.get(id);
      if (!node) continue;
      const group = grouped.get(node.domain);
      if (group) group.push(node);
      else grouped.set(node.domain, [node]);
    }
    return { nodesByDomain: grouped, titleById: new Map(nodes.map((node) => [node.id, node.title])) };
  }, [nodes]);

  const visibleDomains = domains.filter((domain) => nodesByDomain.has(domain));
  // Lu par Radix au premier rendu uniquement : ensuite, l'ouverture des sections reste celle choisie.
  const defaultOpen = visibleDomains.filter((domain) =>
    nodesByDomain.get(domain)?.some((node) => node.status === "UNLOCKED"),
  );

  if (visibleDomains.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun module dans les domaines sélectionnés.</p>;
  }

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="rounded-xl border bg-card px-4">
      {visibleDomains.map((domain) => {
        const domainNodes = nodesByDomain.get(domain) ?? [];
        const completedCount = domainNodes.filter((node) => node.status === "COMPLETED").length;
        return (
          <AccordionItem key={domain} value={domain}>
            <AccordionTrigger className="items-center">
              <span className="flex flex-1 items-center gap-2">
                <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", DOMAIN_STYLES[domain].dot)} />
                {DOMAIN_LABELS[domain]}
                <span className="mr-2 ml-auto text-xs font-normal text-muted-foreground">
                  {completedCount}/{domainNodes.length} validés
                </span>
              </span>
            </AccordionTrigger>
            {/* Les lignes sont des liens : on retire le soulignement que le contenu d'accordéon leur applique. */}
            <AccordionContent className="[&_a]:no-underline">
              <ul className="flex flex-col gap-1">
                {domainNodes.map((node) => (
                  <li key={node.id}>
                    <NodeRow node={node} titleById={titleById} />
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function NodeRow({ node, titleById }: { node: CalculatedNode; titleById: ReadonlyMap<string, string> }) {
  const Icon = STATUS_ICONS[node.status];
  const content = (
    <span className="flex items-center gap-3">
      <Icon aria-hidden className={cn("size-4 shrink-0", STATUS_ICON_CLASSES[node.status])} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="leading-snug font-medium">{node.title}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{node.id}</span>
      </span>
      <Badge className={STATUS_BADGE_CLASSES[node.status]}>
        {STATUS_LABELS[node.status]}
        {node.status === "COMPLETED" && ` · ${formatScore(node.bestScore)}`}
      </Badge>
    </span>
  );

  if (node.status === "LOCKED") {
    const missingTitles = node.missingPrerequisites.map((id) => titleById.get(id) ?? id).join(", ");
    return (
      <div className="flex flex-col gap-1 rounded-lg p-2 opacity-60">
        {content}
        {/* pl-7 : aligné sur le titre (icône size-4 + gap-3). */}
        <p className="pl-7 text-xs text-muted-foreground">Requiert&nbsp;: {missingTitles}</p>
      </div>
    );
  }

  return (
    <Link
      href={ROUTES.node(node.id)}
      className="block rounded-lg p-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {content}
    </Link>
  );
}
