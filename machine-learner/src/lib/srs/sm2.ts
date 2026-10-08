/** Répétition espacée SM-2 (spécification 4.3 du cahier des charges). Fonctions pures. */

export const SM2_QUALITIES = [0, 3, 4, 5] as const;
export type Sm2Quality = (typeof SM2_QUALITIES)[number];
export const SM2_QUALITY_LABELS: Record<Sm2Quality, string> = { 0: "Nul", 3: "Difficile", 4: "Bon", 5: "Facile" };

export const INITIAL_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;

export interface Sm2State {
  interval: number; // en jours
  repetition: number;
  easeFactor: number;
}

export interface Sm2Result extends Sm2State {
  dueDate: Date;
}

/** Vrai si `value` est une note SM-2 acceptée (0, 3, 4 ou 5). */
export function isSm2Quality(value: unknown): value is Sm2Quality {
  return typeof value === "number" && (SM2_QUALITIES as readonly number[]).includes(value);
}

/** État d'une carte jamais révisée (identique aux valeurs par défaut Prisma). */
export function createInitialSm2State(): Sm2State {
  return { interval: 0, repetition: 0, easeFactor: INITIAL_EASE_FACTOR };
}

/** Nouvelle Date décalée de `days` jours calendaires (setDate gère les changements d'heure). */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/** Fuseau des échéances : « aujourd'hui » se juge à l'heure de Paris, quel que soit le fuseau du serveur. */
export const APP_TIME_ZONE = "Europe/Paris";

interface ZonedParts {
  year: number;
  month: number; // 1..12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const zonedFormatters = new Map<string, Intl.DateTimeFormat>();

function getZonedFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = zonedFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    zonedFormatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Date et heure murales de `date` dans `timeZone`. */
function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const values: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {};
  for (const part of getZonedFormatter(timeZone).formatToParts(date)) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }
  return {
    year: values.year ?? 0,
    month: values.month ?? 1,
    day: values.day ?? 1,
    hour: values.hour ?? 0,
    minute: values.minute ?? 0,
    second: values.second ?? 0,
  };
}

/** Décalage de `timeZone` par rapport à UTC à l'instant `date`, en ms (ex. +3 600 000 à Paris en hiver). */
function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const { year, month, day, hour, minute, second } = getZonedParts(date, timeZone);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return wallClockAsUtc - (date.getTime() - date.getUTCMilliseconds());
}

/**
 * Instant correspondant à 23:59:59.999 dans `timeZone`, le jour où tombe `date` dans ce fuseau.
 * Ne dépend pas du fuseau du runtime : sur Vercel le serveur tourne en UTC et `TZ` est réservée.
 * Le décalage est mesuré à l'instant 23:59:59.999 UTC du même jour, soit 1 à 2 h d'écart avec l'instant
 * visé : sans effet en Europe, où le changement d'heure a lieu à 01:00 UTC, jamais près de 23:59 heure locale.
 */
export function endOfDay(date: Date, timeZone: string = APP_TIME_ZONE): Date {
  const { year, month, day } = getZonedParts(date, timeZone);
  const candidate = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
  return new Date(candidate - getTimeZoneOffsetMs(new Date(candidate), timeZone));
}

/** Une carte est due toute la journée (dans `timeZone`) de sa date d'échéance. */
export function isDue(dueDate: Date, now: Date = new Date(), timeZone: string = APP_TIME_ZONE): boolean {
  return dueDate.getTime() <= endOfDay(now, timeZone).getTime();
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Applique une révision notée `quality` à `state` et renvoie le nouvel état et sa date d'échéance.
 * Lève une RangeError si l'état ou la note est invalide. Ne mute ni `state` ni `now`.
 */
export function calculateSM2(state: Sm2State, quality: Sm2Quality, now: Date = new Date()): Sm2Result {
  if (!Number.isInteger(state.interval) || state.interval < 0) {
    throw new RangeError(`SM-2 : interval invalide (${state.interval}), entier ≥ 0 attendu`);
  }
  if (!Number.isInteger(state.repetition) || state.repetition < 0) {
    throw new RangeError(`SM-2 : repetition invalide (${state.repetition}), entier ≥ 0 attendu`);
  }
  if (!Number.isFinite(state.easeFactor)) {
    throw new RangeError(`SM-2 : easeFactor invalide (${state.easeFactor}), nombre fini attendu`);
  }
  if (!isSm2Quality(quality)) {
    throw new RangeError(`SM-2 : note invalide (${String(quality)}), attendu 0, 3, 4 ou 5`);
  }

  const easeFactor = Math.max(state.easeFactor, MIN_EASE_FACTOR);

  let interval: number;
  let repetition: number;
  if (quality < 3) {
    interval = 1;
    repetition = 0;
  } else {
    if (state.repetition === 0) interval = 1;
    else if (state.repetition === 1) interval = 6;
    else interval = Math.round(state.interval * easeFactor); // EF avant mise à jour
    repetition = state.repetition + 1;
  }

  const gap = 5 - quality;
  const nextEaseFactor = roundTo2(Math.max(MIN_EASE_FACTOR, easeFactor + (0.1 - gap * (0.08 + gap * 0.02))));

  return { interval, repetition, easeFactor: nextEaseFactor, dueDate: addDays(now, interval) };
}
