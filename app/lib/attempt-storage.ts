import type { ColorId } from './tribute';

export type Attempt = {
  id: number;
  guess: ColorId[];
  exact: number;
  misplaced: number;
};

export const MAX_RECORDED_ATTEMPTS = 6;

const STORAGE_KEY = 'tribute-solver-attempts-v1';
const EMPTY_SNAPSHOT = '[]';
const listeners = new Set<() => void>();
let inMemorySnapshot: string | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isColorId(value: unknown): value is ColorId {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 5;
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 4;
}

function parseAttempt(value: unknown): Attempt | null {
  if (!isRecord(value) || !Number.isSafeInteger(value.id)) return null;
  if (!Array.isArray(value.guess) || value.guess.length !== 4 || !value.guess.every(isColorId)) return null;
  if (!isCount(value.exact) || !isCount(value.misplaced) || value.exact + value.misplaced > 4) return null;

  return {
    id: value.id as number,
    guess: [...value.guess] as ColorId[],
    exact: value.exact,
    misplaced: value.misplaced,
  };
}

export function parseAttemptsSnapshot(snapshot: string | null): Attempt[] {
  if (!snapshot) return [];

  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed)) return [];

    const attempts: Attempt[] = [];
    const ids = new Set<number>();
    for (const value of parsed) {
      const attempt = parseAttempt(value);
      if (!attempt || ids.has(attempt.id)) continue;
      attempts.push(attempt);
      ids.add(attempt.id);
      if (attempts.length === MAX_RECORDED_ATTEMPTS) break;
    }
    return attempts;
  } catch {
    return [];
  }
}

export function getAttemptsSnapshot(): string {
  if (inMemorySnapshot !== null) return inMemorySnapshot;

  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

export function getServerAttemptsSnapshot(): string {
  return EMPTY_SNAPSHOT;
}

export function subscribeToAttempts(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      inMemorySnapshot = null;
      onStoreChange();
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

export function saveAttempts(attempts: Attempt[]): void {
  const snapshot = JSON.stringify(attempts.slice(0, MAX_RECORDED_ATTEMPTS));
  inMemorySnapshot = snapshot;

  try {
    window.localStorage.setItem(STORAGE_KEY, snapshot);
    inMemorySnapshot = null;
  } catch {
    // Keep the session usable through the in-memory snapshot when storage is
    // unavailable, full, or blocked by the browser.
  }

  for (const listener of listeners) listener();
}
