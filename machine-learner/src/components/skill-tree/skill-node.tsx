"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Lock, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, PASSING_SCORE, STATUS_LABELS, type CalculatedNode } from "@/types/domain";
import { DOMAIN_STYLES, STATUS_BADGE_CLASSES, formatScore } from "./styles";

/** Score à partir duquel un nœud validé reçoit le trophée. */
const TROPHY_SCORE = 90;

// `type` et non `interface` : React Flow contraint `data` à Record<string, unknown>.
export type SkillFlowNodeData = {
  node: CalculatedNode;
  missingPrerequisites: { id: string; title: string }[];
};

export type SkillFlowNode = Node<SkillFlowNodeData, "skill">;

const HANDLE_CLASS = "size-1.5! min-h-0! min-w-0! border-0! bg-muted-foreground/30!";

export const SkillNodeCard = memo(function SkillNodeCard({ data }: NodeProps<SkillFlowNode>) {
  const { node, missingPrerequisites } = data;
  const domain = DOMAIN_STYLES[node.domain];

  // L'accent du domaine vient en dernier : cn retire un border-l-* placé avant un border-status-*.
  const cardClassName = cn(
    "flex h-28 w-60 flex-col justify-between gap-1.5 rounded-lg border border-l-4 bg-card p-3 text-left text-card-foreground",
    node.status === "LOCKED" && "opacity-60",
    node.status === "UNLOCKED" && "glow-unlocked border-status-unlocked",
    node.status === "COMPLETED" && "border-status-completed",
    domain.accentBorder,
  );

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">{node.id}</span>
        <span className="flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
          <span aria-hidden className={cn("size-2 shrink-0 rounded-full", domain.dot)} />
          <span className="truncate">{DOMAIN_LABELS[node.domain]}</span>
        </span>
      </div>
      <p className="line-clamp-2 text-sm leading-snug font-semibold">{node.title}</p>
      <div className="flex items-center justify-between gap-2">
        <StatusBadge node={node} />
        {node.status === "UNLOCKED" && <NodeLink nodeId={node.id}>Étudier →</NodeLink>}
        {node.status === "COMPLETED" && <NodeLink nodeId={node.id}>Revoir →</NodeLink>}
      </div>
    </>
  );

  return (
    <>
      <Handle type="target" position={Position.Left} isConnectable={false} className={HANDLE_CLASS} />
      {node.status === "LOCKED" ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`${node.title} : verrouillé, voir les prérequis`}
              className={cn(cardClassName, "cursor-pointer")}
            >
              {body}
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-64">
            <PopoverHeader>
              <PopoverTitle>Prérequis manquants</PopoverTitle>
            </PopoverHeader>
            <ul className="flex flex-col gap-1.5">
              {missingPrerequisites.map((prerequisite) => (
                <li key={prerequisite.id} className="flex flex-col">
                  <span className="font-medium">{prerequisite.title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{prerequisite.id}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Valide ces modules (quiz ≥ {formatScore(PASSING_SCORE)}) pour débloquer celui-ci.
            </p>
          </PopoverContent>
        </Popover>
      ) : (
        <div className={cardClassName}>{body}</div>
      )}
      <Handle type="source" position={Position.Right} isConnectable={false} className={HANDLE_CLASS} />
    </>
  );
});

function StatusBadge({ node }: { node: CalculatedNode }) {
  const className = STATUS_BADGE_CLASSES[node.status];
  if (node.status === "LOCKED") {
    return (
      <Badge className={className}>
        <Lock data-icon="inline-start" aria-hidden />
        {STATUS_LABELS.LOCKED}
      </Badge>
    );
  }
  if (node.status === "UNLOCKED") {
    return <Badge className={className}>{STATUS_LABELS.UNLOCKED}</Badge>;
  }
  return (
    <span className="flex items-center gap-1">
      <Badge className={className}>
        {STATUS_LABELS.COMPLETED} · {formatScore(node.bestScore)}
      </Badge>
      {node.bestScore >= TROPHY_SCORE && (
        <Trophy role="img" aria-label={`Excellence : score ≥ ${formatScore(TROPHY_SCORE)}`} className="size-4 text-gold" />
      )}
    </span>
  );
}

function NodeLink({ nodeId, children }: { nodeId: string; children: ReactNode }) {
  return (
    <Link
      href={ROUTES.node(nodeId)}
      className="nodrag nopan rounded-sm text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}
