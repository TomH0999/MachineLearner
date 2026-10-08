import { describe, expect, it } from "vitest";
import {
  MIN_EASE_FACTOR,
  type Sm2Quality,
  type Sm2State,
  addDays,
  calculateSM2,
  createInitialSm2State,
  endOfDay,
  isDue,
  isSm2Quality,
} from "./sm2";

const NOW = new Date(2026, 0, 15, 10, 0);

function state(interval: number, repetition: number, easeFactor: number): Sm2State {
  return { interval, repetition, easeFactor };
}

describe("calculateSM2 : exemples de contrôle", () => {
  it("{0,0,2.5} q=4 → interval 1, repetition 1, EF 2.5", () => {
    const result = calculateSM2(state(0, 0, 2.5), 4, NOW);

    expect(result.interval).toBe(1);
    expect(result.repetition).toBe(1);
    expect(result.easeFactor).toBeCloseTo(2.5, 10);
  });

  it("{0,0,2.5} q=5 → EF 2.6 ; q=3 → EF 2.36", () => {
    expect(calculateSM2(state(0, 0, 2.5), 5, NOW).easeFactor).toBeCloseTo(2.6, 10);
    expect(calculateSM2(state(0, 0, 2.5), 3, NOW).easeFactor).toBeCloseTo(2.36, 10);
  });

  it("{0,0,2.5} q=0 → interval 1, repetition 0, EF 1.7", () => {
    const result = calculateSM2(state(0, 0, 2.5), 0, NOW);

    expect(result.interval).toBe(1);
    expect(result.repetition).toBe(0);
    expect(result.easeFactor).toBeCloseTo(1.7, 10);
  });

  it("{1,1,2.5} q=4 → interval 6, repetition 2", () => {
    const result = calculateSM2(state(1, 1, 2.5), 4, NOW);

    expect(result.interval).toBe(6);
    expect(result.repetition).toBe(2);
  });

  it("{6,2,2.5} q=4 → interval 15, repetition 3", () => {
    const result = calculateSM2(state(6, 2, 2.5), 4, NOW);

    expect(result.interval).toBe(15);
    expect(result.repetition).toBe(3);
  });

  it("{15,3,1.3} q=0 → interval 1, repetition 0, EF 1.3 (plancher)", () => {
    const result = calculateSM2(state(15, 3, 1.3), 0, NOW);

    expect(result.interval).toBe(1);
    expect(result.repetition).toBe(0);
    expect(result.easeFactor).toBe(MIN_EASE_FACTOR);
  });
});

describe("calculateSM2 : comportement", () => {
  it("fixe l'échéance à now + interval jours", () => {
    const result = calculateSM2(createInitialSm2State(), 4, NOW);

    expect(result.dueDate.getTime()).toBe(new Date(2026, 0, 16, 10, 0).getTime());
  });

  it("ne mute ni state ni now", () => {
    const input = state(6, 2, 2.5);
    const inputCopy = { ...input };
    const now = new Date(NOW.getTime());

    calculateSM2(input, 4, now);

    expect(input).toEqual(inputCopy);
    expect(now.getTime()).toBe(NOW.getTime());
  });

  it.each([
    { label: "interval négatif", input: state(-1, 0, 2.5), quality: 4 },
    { label: "repetition non entier", input: state(1, 1.5, 2.5), quality: 4 },
    { label: "easeFactor NaN", input: state(1, 1, Number.NaN), quality: 4 },
    { label: "note 7", input: state(1, 1, 2.5), quality: 7 },
  ])("lève une RangeError : $label", ({ input, quality }) => {
    expect(() => calculateSM2(input, quality as Sm2Quality, NOW)).toThrow(RangeError);
  });

  it("ramène à 1.3 un easeFactor d'entrée inférieur au plancher", () => {
    const result = calculateSM2(state(6, 2, 1.0), 4, NOW);

    expect(result.easeFactor).toBe(MIN_EASE_FACTOR);
    expect(result.interval).toBe(8); // 6 × 1.3 = 7.8, et non 6 × 1.0
  });

  it("garde EF ≥ 1.3, interval ≥ 1 et repetition ≥ 0 sur une séquence de notes", () => {
    const qualities: Sm2Quality[] = [5, 4, 0, 3, 5, 5, 0, 0, 4, 3, 5, 4];
    let current: Sm2State = createInitialSm2State();

    for (const quality of qualities) {
      const result = calculateSM2(current, quality, NOW);
      expect(result.easeFactor).toBeGreaterThanOrEqual(MIN_EASE_FACTOR);
      expect(result.interval).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(result.interval)).toBe(true);
      expect(result.repetition).toBeGreaterThanOrEqual(0);
      current = result;
    }
  });
});

describe("isSm2Quality", () => {
  it.each([0, 3, 4, 5])("accepte %s", (value) => {
    expect(isSm2Quality(value)).toBe(true);
  });

  it.each([1, 2, "4", null])("refuse %s", (value) => {
    expect(isSm2Quality(value)).toBe(false);
  });
});

describe("dates", () => {
  it("endOfDay renvoie 23:59:59.999 le même jour", () => {
    const end = endOfDay(NOW);

    expect(end.getTime()).toBe(new Date(2026, 0, 15, 23, 59, 59, 999).getTime());
  });

  it("isDue : vrai plus tard le même jour ou la veille, faux le lendemain à 00:30", () => {
    expect(isDue(new Date(2026, 0, 15, 22, 0), NOW)).toBe(true);
    expect(isDue(new Date(2026, 0, 14, 10, 0), NOW)).toBe(true);
    expect(isDue(new Date(2026, 0, 16, 0, 30), NOW)).toBe(false);
  });

  it("addDays franchit la fin de mois", () => {
    const next = addDays(new Date(2026, 0, 31, 10, 0), 1);

    expect(next.getTime()).toBe(new Date(2026, 1, 1, 10, 0).getTime());
  });

  it("addDays conserve l'heure locale au passage à l'heure d'été", () => {
    const next = addDays(new Date(2026, 2, 28, 10, 0), 1);

    expect(next.getTime()).toBe(new Date(2026, 2, 29, 10, 0).getTime());
  });
});

// Entrées et sorties en instants UTC explicites : indépendant de process.env.TZ.
describe("fuseau horaire", () => {
  it.each([
    { label: "23:30 à Paris en hiver → fin du même jour", input: "2026-01-15T22:30:00Z", expected: "2026-01-15T22:59:59.999Z" },
    { label: "déjà le 16 à Paris → fin du 16", input: "2026-01-15T23:30:00Z", expected: "2026-01-16T22:59:59.999Z" },
    { label: "heure d'été (CEST)", input: "2026-07-01T10:00:00Z", expected: "2026-07-01T21:59:59.999Z" },
    { label: "jour du passage à l'heure d'été", input: "2026-03-29T12:00:00Z", expected: "2026-03-29T21:59:59.999Z" },
    { label: "jour du passage à l'heure d'hiver", input: "2026-10-25T12:00:00Z", expected: "2026-10-25T22:59:59.999Z" },
  ])("endOfDay (Europe/Paris par défaut) : $label", ({ input, expected }) => {
    expect(endOfDay(new Date(input)).toISOString()).toBe(expected);
  });

  it("endOfDay avec le fuseau explicite UTC", () => {
    expect(endOfDay(new Date("2026-01-15T22:30:00Z"), "UTC").toISOString()).toBe("2026-01-15T23:59:59.999Z");
  });

  it("isDue juge « aujourd'hui » à l'heure de Paris", () => {
    const now = new Date("2026-01-15T08:00:00Z");

    expect(isDue(new Date("2026-01-15T22:00:00Z"), now)).toBe(true);
    expect(isDue(new Date("2026-01-16T00:00:00Z"), now)).toBe(false); // 01:00 à Paris le 16
  });

  it("isDue avec le fuseau explicite UTC", () => {
    const now = new Date("2026-01-15T08:00:00Z");

    expect(isDue(new Date("2026-01-16T00:00:00Z"), now, "UTC")).toBe(false);
  });
});
