import { useId } from "react";
import { DOMAIN_STYLES } from "@/components/skill-tree/styles";
import type { DomainProgress } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, type Domain } from "@/types/domain";

// Libellés courts : les noms complets ne tiennent pas autour d'un radar de 280 px.
const SHORT_LABELS: Record<Domain, string> = {
  MATHS: "Maths",
  DEV: "Dev",
  RESEAUX: "Systèmes",
  IA: "IA",
  ARCHI: "Archi",
  ANGLAIS: "Anglais",
};

const GRID_LEVELS = [0.25, 0.5, 0.75, 1] as const;
const LABEL_OFFSET = 16;

interface Point {
  x: number;
  y: number;
}

function toPoints(points: readonly Point[]): string {
  return points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function textAnchorFor(cos: number): "start" | "middle" | "end" {
  if (cos > 0.1) return "start";
  if (cos < -0.1) return "end";
  return "middle";
}

function buildDescription(data: readonly DomainProgress[]): string {
  return data
    .map(({ domain, completed, total }) => {
      const validated = completed > 1 ? "validés" : "validé";
      return `${DOMAIN_LABELS[domain]} : ${completed} sur ${total} ${validated}`;
    })
    .join(" ; ");
}

/** Radar SVG de la progression par domaine (Server Component, sans dépendance de graphique). */
export function DomainRadar({ data, size = 280 }: { data: DomainProgress[]; size?: number }) {
  const titleId = useId();
  const descId = useId();

  const center = size / 2;
  const radius = size / 2 - 44; // marge pour les libellés
  const axes = data.map((entry, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / data.length;
    return { ...entry, cos: Math.cos(angle), sin: Math.sin(angle) };
  });
  const at = (cos: number, sin: number, distance: number): Point => ({
    x: center + cos * distance,
    y: center + sin * distance,
  });
  const progressPoints = axes.map(({ cos, sin, ratio }) => at(cos, sin, ratio * radius));

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-xs overflow-visible"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
      >
        <title id={titleId}>Progression par domaine</title>
        <desc id={descId}>{buildDescription(data)}</desc>

        <g fill="none" stroke="var(--border)">
          {GRID_LEVELS.map((level) => (
            <polygon key={level} points={toPoints(axes.map(({ cos, sin }) => at(cos, sin, level * radius)))} />
          ))}
          {axes.map(({ domain, cos, sin }) => {
            const end = at(cos, sin, radius);
            return <line key={domain} x1={center} y1={center} x2={end.x} y2={end.y} />;
          })}
        </g>

        <polygon
          points={toPoints(progressPoints)}
          fill="var(--primary)"
          fillOpacity={0.18}
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {axes.map(({ domain }, index) => (
          <circle
            key={domain}
            cx={progressPoints[index].x}
            cy={progressPoints[index].y}
            r={4}
            fill={`var(--domain-${domain.toLowerCase()})`}
          />
        ))}

        {axes.map(({ domain, cos, sin }) => {
          const position = at(cos, sin, radius + LABEL_OFFSET);
          return (
            <text
              key={domain}
              x={position.x}
              y={position.y}
              textAnchor={textAnchorFor(cos)}
              dominantBaseline="middle"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              {SHORT_LABELS[domain]}
            </text>
          );
        })}
      </svg>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {data.map(({ domain, completed, total }) => (
          <li key={domain} className="flex items-center gap-1.5">
            <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOMAIN_STYLES[domain].dot)} />
            <span className="truncate">{DOMAIN_LABELS[domain]}</span>
            <span className="ml-auto pl-2 text-muted-foreground tabular-nums">
              {completed}/{total}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
