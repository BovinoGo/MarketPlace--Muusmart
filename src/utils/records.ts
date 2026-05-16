import type { ApiRecord } from "../types";

export function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readAny(source: ApiRecord | undefined, keys: string[]): unknown {
  if (!source) return undefined;

  const normalized = new Map(
    Object.entries(source).map(([key, value]) => [key.toLowerCase(), value]),
  );

  for (const key of keys) {
    const value = normalized.get(key.toLowerCase());
    if (value !== undefined && value !== null) return value;
  }

  return undefined;
}

export function readString(
  source: ApiRecord | undefined,
  keys: string[],
  fallback = "",
): string {
  const value = readAny(source, keys);
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

export function readNumber(
  source: ApiRecord | undefined,
  keys: string[],
  fallback = 0,
): number {
  const value = readAny(source, keys);
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function readBoolean(
  source: ApiRecord | undefined,
  keys: string[],
  fallback = false,
): boolean {
  const value = readAny(source, keys);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
}

export function readRecord(
  source: ApiRecord | undefined,
  keys: string[],
): ApiRecord | undefined {
  const value = readAny(source, keys);
  return isRecord(value) ? value : undefined;
}

export function normalizeCollection(payload: unknown): ApiRecord[] {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];

  const candidates = ["data", "items", "result", "results", "value", "publications"];
  for (const key of candidates) {
    const value = readAny(payload, [key]);
    if (Array.isArray(value)) return value.filter(isRecord);
    if (isRecord(value)) {
      const nested = normalizeCollection(value);
      if (nested.length) return nested;
    }
  }

  return [];
}

export function findStringDeep(
  value: unknown,
  keyCandidates: string[],
  depth = 0,
): string | undefined {
  if (depth > 4 || value === null || value === undefined || typeof value === "string") {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findStringDeep(item, keyCandidates, depth + 1);
      if (found) return found;
    }
    return undefined;
  }

  if (!isRecord(value)) return undefined;

  const wanted = new Set(keyCandidates.map((key) => key.toLowerCase()));
  for (const [key, rawValue] of Object.entries(value)) {
    if (wanted.has(key.toLowerCase()) && typeof rawValue === "string" && rawValue) {
      return rawValue;
    }
  }

  for (const rawValue of Object.values(value)) {
    const found = findStringDeep(rawValue, keyCandidates, depth + 1);
    if (found) return found;
  }

  return undefined;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operacion.";
}
