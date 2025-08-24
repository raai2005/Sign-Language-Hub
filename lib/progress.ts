// Local progress tracking for learned letters (client-side persistence)

export type ProgressData = {
  completedLetters: string[];
  updatedAt: number; // epoch ms
};

const STORAGE_KEY = 'isl_progress_v1';

function safeParse(json: string | null): ProgressData | null {
  if (!json) return null;
  try {
    const data = JSON.parse(json);
    if (
      data &&
      Array.isArray(data.completedLetters) &&
      typeof data.updatedAt === 'number'
    ) {
      return data as ProgressData;
    }
  } catch (_e) {
    // ignore
  }
  return null;
}

export function getProgress(): ProgressData {
  if (typeof window === 'undefined') {
    return { completedLetters: [], updatedAt: Date.now() };
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw);
  return (
    parsed ?? { completedLetters: [], updatedAt: Date.now() }
  );
}

export function setProgress(next: ProgressData) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (_e) {
    // quota or privacy mode—ignore silently
  }
}

export function isLetterCompleted(letterId: string): boolean {
  const { completedLetters } = getProgress();
  return completedLetters.includes(letterId.toUpperCase());
}

export function markLetter(letterId: string, completed: boolean) {
  const id = letterId.toUpperCase();
  const current = getProgress();
  const set = new Set(current.completedLetters.map((x) => x.toUpperCase()));
  if (completed) set.add(id); else set.delete(id);
  setProgress({ completedLetters: Array.from(set), updatedAt: Date.now() });
}

export function toggleLetter(letterId: string): boolean {
  const nextCompleted = !isLetterCompleted(letterId);
  markLetter(letterId, nextCompleted);
  return nextCompleted;
}

// Subscribe to cross-tab updates via storage events
export function onProgressChange(callback: (data: ProgressData) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getProgress());
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export function resetProgress() {
  setProgress({ completedLetters: [], updatedAt: Date.now() });
}
